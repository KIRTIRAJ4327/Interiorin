import { NextResponse } from "next/server";
import { studioCommandSchema } from "@/lib/session/schema";
import { applyStudioCommand, eventTypeForCommand } from "@/lib/session/reducer";
import { bearerToken } from "@/lib/session/security";
import { authenticateAccessToken, getSupabaseAdmin } from "@/lib/supabase/server";

type Context = { params: Promise<{ sessionId: string }> };

export async function POST(request: Request, { params }: Context) {
  const { sessionId } = await params;
  const parsed = studioCommandSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Command payload failed validation." }, { status: 400 });
  const user = await authenticateAccessToken(bearerToken(request));
  const admin = getSupabaseAdmin();
  if (!user || !admin) return NextResponse.json({ error: "Authentication required." }, { status: 401 });

  const { data: member } = await admin.from("studio_members").select("role").eq("session_id", sessionId).eq("user_id", user.id).maybeSingle();
  if (!member || member.role !== "controller") return NextResponse.json({ error: "Controller membership required." }, { status: 403 });
  const { data: duplicate } = await admin.from("studio_events").select("id,payload").eq("session_id", sessionId).eq("idempotency_key", parsed.data.idempotencyKey).maybeSingle();
  if (duplicate) return NextResponse.json({ duplicate: true, eventId: Number(duplicate.id), receipt: duplicate.payload });

  const { data: session } = await admin.from("studio_sessions").select("revision,status,canonical_state,expires_at").eq("id", sessionId).maybeSingle();
  if (!session || session.status === "ended" || new Date(session.expires_at).getTime() <= Date.now()) return NextResponse.json({ error: "Session is unavailable or expired." }, { status: 410 });
  if (session.revision !== parsed.data.expectedRevision) return NextResponse.json({ error: "Session revision is stale.", revision: session.revision, recover: true }, { status: 409 });
  const { count } = await admin.from("studio_events").select("id", { count: "exact", head: true }).eq("session_id", sessionId);
  if ((count ?? 0) >= 500) return NextResponse.json({ error: "This session reached its 500-event limit." }, { status: 429 });

  let canonicalState;
  try {
    canonicalState = applyStudioCommand(session.canonical_state, parsed.data, sessionId);
  } catch (cause) {
    return NextResponse.json({ error: cause instanceof Error ? cause.message : "Command could not be applied." }, { status: 422 });
  }
  const nextRevision = session.revision + 1;
  const now = new Date().toISOString();
  const { data: updated, error: updateError } = await admin.from("studio_sessions")
    .update({ canonical_state: canonicalState, revision: nextRevision, status: parsed.data.type === "end_session" ? "ended" : "active", updated_at: now })
    .eq("id", sessionId).eq("revision", session.revision).select("revision").maybeSingle();
  if (updateError || !updated) return NextResponse.json({ error: "Session changed before this command committed.", recover: true }, { status: 409 });
  const safePayload = { commandType: parsed.data.type, revision: nextRevision };
  const { data: event, error: eventError } = await admin.from("studio_events").insert({
    session_id: sessionId, event_type: eventTypeForCommand(parsed.data), actor_user_id: user.id, actor_role: "controller",
    idempotency_key: parsed.data.idempotencyKey, payload: safePayload,
  }).select("id,created_at").single();
  if (eventError) return NextResponse.json({ error: "Canonical state committed but event append needs recovery.", revision: nextRevision }, { status: 500 });
  return NextResponse.json({ revision: nextRevision, canonicalState, event: { id: Number(event.id), sessionId, eventType: eventTypeForCommand(parsed.data), actorRole: "controller", payload: safePayload, createdAt: event.created_at } });
}
