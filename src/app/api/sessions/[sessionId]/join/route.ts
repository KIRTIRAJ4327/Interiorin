import { randomUUID, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { sessionJoinRequestSchema } from "@/lib/session/schema";
import { bearerToken, digestPairingToken } from "@/lib/session/security";
import { getSupabaseSecretConfig } from "@/lib/supabase/config";
import { authenticateAccessToken, getSupabaseAdmin } from "@/lib/supabase/server";

type Context = { params: Promise<{ sessionId: string }> };

export async function POST(request: Request, { params }: Context) {
  const { sessionId } = await params;
  const parsed = sessionJoinRequestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "The pairing token is invalid." }, { status: 400 });

  const config = getSupabaseSecretConfig();
  if (!config) return NextResponse.json({
    mode: "same_device",
    sessionId,
    role: "controller",
    disclosure: "Same-device demo mode: data remains in this browser origin.",
  });

  const user = await authenticateAccessToken(bearerToken(request));
  const admin = getSupabaseAdmin();
  if (!user || !admin) return NextResponse.json({ error: "Authentication required." }, { status: 401 });

  const { data: session } = await admin.from("studio_sessions")
    .select("id,pairing_token_digest,pairing_expires_at,pairing_used_at,status")
    .eq("id", sessionId).maybeSingle();
  if (!session || session.status !== "pairing" || session.pairing_used_at || new Date(session.pairing_expires_at).getTime() <= Date.now()) {
    return NextResponse.json({ error: "This pairing link has expired or was already used." }, { status: 410 });
  }

  const received = Buffer.from(digestPairingToken(parsed.data.token, config.tokenPepper), "hex");
  const expected = Buffer.from(session.pairing_token_digest, "hex");
  if (received.length !== expected.length || !timingSafeEqual(received, expected)) {
    return NextResponse.json({ error: "The pairing token is invalid." }, { status: 403 });
  }

  const { count } = await admin.from("studio_members")
    .select("session_id", { count: "exact", head: true })
    .eq("session_id", sessionId).eq("role", "controller");
  if ((count ?? 0) > 0) return NextResponse.json({ error: "This session already has a controller." }, { status: 409 });

  const { error: memberError } = await admin.from("studio_members").insert({ session_id: sessionId, user_id: user.id, role: "controller" });
  if (memberError) return NextResponse.json({ error: "This session could not be joined." }, { status: 409 });

  const now = new Date().toISOString();
  const { error: updateError } = await admin.from("studio_sessions").update({ pairing_used_at: now, status: "active", updated_at: now }).eq("id", sessionId).is("pairing_used_at", null);
  if (updateError) return NextResponse.json({ error: "The pairing link was already claimed." }, { status: 409 });

  await admin.from("studio_events").insert({
    session_id: sessionId,
    event_type: "controller_joined",
    actor_user_id: user.id,
    actor_role: "controller",
    idempotency_key: randomUUID(),
    payload: { status: "active" },
  });
  return NextResponse.json({ mode: "supabase", sessionId, role: "controller", disclosure: "Private paired session connected." });
}
