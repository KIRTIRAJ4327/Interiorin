import { randomUUID } from "node:crypto";
import QRCode from "qrcode";
import { NextResponse } from "next/server";
import { createPairingCredential, digestPairingToken, bearerToken } from "@/lib/session/security";
import { getSupabaseSecretConfig } from "@/lib/supabase/config";
import { authenticateAccessToken, getSupabaseAdmin } from "@/lib/supabase/server";

export const runtime = "nodejs";

const SAME_DEVICE_DISCLOSURE = "Same-device demo mode: controller and wall must be open in this browser on the same origin.";

export async function POST(request: Request) {
  const origin = process.env.NEXT_PUBLIC_APP_URL?.trim() || new URL(request.url).origin;
  const credential = createPairingCredential();
  const expiresAt = new Date(Date.now() + 10 * 60_000).toISOString();
  const config = getSupabaseSecretConfig();

  if (!config) {
    const sessionId = randomUUID();
    const joinUrl = `${origin}/control/${sessionId}?token=${encodeURIComponent(credential.token)}&mode=same_device`;
    return NextResponse.json({
      mode: "same_device",
      sessionId,
      joinUrl,
      qrDataUrl: await QRCode.toDataURL(joinUrl, { margin: 1, width: 480 }),
      pairingCode: credential.code,
      expiresAt,
      disclosure: SAME_DEVICE_DISCLOSURE,
    });
  }

  const user = await authenticateAccessToken(bearerToken(request));
  const admin = getSupabaseAdmin();
  if (!user || !admin) return NextResponse.json({ error: "Authentication required." }, { status: 401 });

  const sessionId = randomUUID();
  const topic = `studio:${sessionId}`;
  const { error: sessionError } = await admin.from("studio_sessions").insert({
    id: sessionId,
    topic,
    pairing_code: credential.code,
    pairing_token_digest: digestPairingToken(credential.token, config.tokenPepper),
    pairing_expires_at: expiresAt,
    created_by: user.id,
  });
  if (sessionError) return NextResponse.json({ error: "Could not create a studio session." }, { status: 500 });

  const { error: memberError } = await admin.from("studio_members").insert({
    session_id: sessionId,
    user_id: user.id,
    role: "wall",
  });
  if (memberError) {
    await admin.from("studio_sessions").delete().eq("id", sessionId);
    return NextResponse.json({ error: "Could not register the Studio Wall." }, { status: 500 });
  }

  await admin.from("studio_events").insert({
    session_id: sessionId,
    event_type: "session_created",
    actor_user_id: user.id,
    actor_role: "wall",
    idempotency_key: randomUUID(),
    payload: { status: "pairing" },
  });

  const joinUrl = `${origin}/control/${sessionId}?token=${encodeURIComponent(credential.token)}`;
  return NextResponse.json({
    mode: "supabase",
    sessionId,
    joinUrl,
    qrDataUrl: await QRCode.toDataURL(joinUrl, { margin: 1, width: 480 }),
    pairingCode: credential.code,
    expiresAt,
    disclosure: "Private paired session. The QR token is single-use and expires in ten minutes.",
  });
}
