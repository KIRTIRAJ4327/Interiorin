import { NextResponse } from "next/server";
import { bearerToken } from "@/lib/session/security";
import { getSupabaseSecretConfig } from "@/lib/supabase/config";
import { authenticateAccessToken, getSupabaseAdmin } from "@/lib/supabase/server";

type Context = { params: Promise<{ sessionId: string }> };

export async function GET(request: Request, { params }: Context) {
  const { sessionId } = await params;
  if (!getSupabaseSecretConfig()) return NextResponse.json({ error: "Recovery is local in same-device mode." }, { status: 404 });
  const user = await authenticateAccessToken(bearerToken(request));
  const admin = getSupabaseAdmin();
  if (!user || !admin) return NextResponse.json({ error: "Authentication required." }, { status: 401 });

  const { data: membership } = await admin.from("studio_members").select("role,joined_at").eq("session_id", sessionId).eq("user_id", user.id).maybeSingle();
  if (!membership) return NextResponse.json({ error: "Session membership required." }, { status: 403 });
  const { data: session } = await admin.from("studio_sessions").select("id,topic,revision,status,canonical_state,expires_at").eq("id", sessionId).maybeSingle();
  if (!session) return NextResponse.json({ error: "Session not found." }, { status: 404 });
  const { data: events } = await admin.from("studio_events").select("id,event_type,actor_role,payload,created_at").eq("session_id", sessionId).order("id").limit(500);
  const { data: members } = await admin.from("studio_members").select("role,joined_at").eq("session_id", sessionId);
  const mappedEvents = (events ?? []).map((event) => ({ id: Number(event.id), sessionId, eventType: event.event_type, actorRole: event.actor_role, payload: event.payload, createdAt: event.created_at }));
  return NextResponse.json({
    sessionId,
    topic: session.topic,
    revision: session.revision,
    status: session.status,
    canonicalState: session.canonical_state,
    lastEventId: mappedEvents.at(-1)?.id ?? 0,
    events: mappedEvents,
    members: (members ?? []).map((member) => ({ role: member.role, joinedAt: member.joined_at })),
    expiresAt: session.expires_at,
  });
}

export async function DELETE(request: Request, { params }: Context) {
  const { sessionId } = await params;
  const user = await authenticateAccessToken(bearerToken(request));
  const admin = getSupabaseAdmin();
  if (!user || !admin) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  const { data: membership } = await admin.from("studio_members").select("role").eq("session_id", sessionId).eq("user_id", user.id).maybeSingle();
  if (!membership) return NextResponse.json({ error: "Session membership required." }, { status: 403 });
  const { data: session } = await admin.from("studio_sessions").select("canonical_state").eq("id", sessionId).maybeSingle();
  if (!session) return NextResponse.json({ deleted: true });
  const canonical = session.canonical_state as { source?: { objectPath?: string } } | null;
  const objectPath = canonical?.source?.objectPath;
  if (objectPath && !objectPath.startsWith("local/")) await admin.storage.from("studio-sources").remove([objectPath]);
  const { error } = await admin.from("studio_sessions").delete().eq("id", sessionId);
  if (error) return NextResponse.json({ error: "Session deletion failed." }, { status: 500 });
  return NextResponse.json({ deleted: true });
}
