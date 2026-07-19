import { NextResponse } from "next/server";
import { productFeatures } from "@/lib/config/features";
import { consumeRateLimit } from "@/lib/server/rate-limit";
import { bearerToken } from "@/lib/session/security";
import { authenticateAccessToken, getSupabaseAdmin } from "@/lib/supabase/server";
import { voiceSessionEnvelopeSchema } from "@/lib/voice/schema";

type Context = { params: Promise<{ sessionId: string }> };

export const runtime = "nodejs";

export async function POST(request: Request, { params }: Context) {
  if (!productFeatures.voiceGuide) return NextResponse.json({ error: "Voice guidance is disabled." }, { status: 404 });
  const { sessionId } = await params;
  const apiKey = process.env.ELEVENLABS_API_KEY?.trim();
  const agentId = process.env.ELEVENLABS_AGENT_ID?.trim();
  if (!apiKey || !agentId) return NextResponse.json({ error: "Voice is not configured. Continue by typing." }, { status: 503 });

  const user = await authenticateAccessToken(bearerToken(request));
  const admin = getSupabaseAdmin();
  if (!user || !admin) return NextResponse.json({ error: "Verified phone pairing is required for voice. Continue by typing in same-device mode." }, { status: 401 });

  const [{ data: member }, { data: session }] = await Promise.all([
    admin.from("studio_members").select("role").eq("session_id", sessionId).eq("user_id", user.id).maybeSingle(),
    admin.from("studio_sessions").select("status,expires_at,canonical_state").eq("id", sessionId).maybeSingle(),
  ]);
  if (member?.role !== "controller") return NextResponse.json({ error: "Controller membership is required for voice." }, { status: 403 });
  if (!session || session.status === "ended" || new Date(session.expires_at).getTime() <= Date.now()) return NextResponse.json({ error: "This session is unavailable or expired." }, { status: 410 });

  const limited = consumeRateLimit(`voice:${sessionId}:${user.id}`, 5, 10 * 60_000);
  if (!limited.allowed) return NextResponse.json({ error: "Too many voice connection attempts. Continue by typing and retry later." }, { status: 429, headers: { "retry-after": String(limited.retryAfterSeconds) } });

  const provider = await fetch(`https://api.elevenlabs.io/v1/convai/conversation/get-signed-url?agent_id=${encodeURIComponent(agentId)}`, {
    headers: { "xi-api-key": apiKey },
    cache: "no-store",
    signal: AbortSignal.timeout(8_000),
  }).catch(() => null);
  if (!provider?.ok) return NextResponse.json({ error: "Voice could not connect. Continue by typing." }, { status: 502 });
  const payload = await provider.json().catch(() => null) as { signed_url?: unknown } | null;
  const stage = typeof session.canonical_state === "object" && session.canonical_state && "stage" in session.canonical_state ? String(session.canonical_state.stage) : "intent";
  const envelope = voiceSessionEnvelopeSchema.safeParse({
    signedUrl: payload?.signed_url,
    expiresInSeconds: 900,
    initialization: {
      session_id: sessionId,
      design_stage: stage,
      authority: "Interiorin validates every spatial action and the homeowner approves every commit.",
    },
  });
  if (!envelope.success) return NextResponse.json({ error: "Voice returned an invalid connection. Continue by typing." }, { status: 502 });
  return NextResponse.json(envelope.data, { headers: { "cache-control": "no-store" } });
}
