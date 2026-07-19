import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { productFeatures } from "@/lib/config/features";
import { compileVisualDesignBrief } from "@/lib/reveal/schema";
import { generateVisualReveal, VisualRevealProviderError } from "@/lib/reveal/provider";
import { consumeRateLimit } from "@/lib/server/rate-limit";
import { pairedCanonicalStateSchema } from "@/lib/session/schema";
import { bearerToken } from "@/lib/session/security";
import { authenticateAccessToken, getSupabaseAdmin } from "@/lib/supabase/server";

type Context = { params: Promise<{ sessionId: string }> };
const requestSchema = z.object({ expectedRevision: z.number().int().nonnegative(), idempotencyKey: z.string().uuid() }).strict();

export const runtime = "nodejs";
export const maxDuration = 75;

export async function POST(request: Request, { params }: Context) {
  if (!productFeatures.visualReveal) return NextResponse.json({ error: "Visual Reveal is disabled." }, { status: 404 });
  const { sessionId } = await params;
  const parsed = requestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Reveal request failed validation." }, { status: 400 });
  const requestData = parsed.data;
  const user = await authenticateAccessToken(bearerToken(request));
  const admin = getSupabaseAdmin();
  if (!user || !admin) return NextResponse.json({ error: "Verified real-device pairing is required for a live reveal. Canonical 3D remains available." }, { status: 401 });

  const [{ data: member }, { data: duplicate }, { data: session }] = await Promise.all([
    admin.from("studio_members").select("role").eq("session_id", sessionId).eq("user_id", user.id).maybeSingle(),
    admin.from("studio_events").select("id,payload").eq("session_id", sessionId).eq("idempotency_key", requestData.idempotencyKey).maybeSingle(),
    admin.from("studio_sessions").select("revision,status,canonical_state,expires_at").eq("id", sessionId).maybeSingle(),
  ]);
  if (member?.role !== "controller") return NextResponse.json({ error: "Controller membership is required for a room reveal." }, { status: 403 });
  if (duplicate) return NextResponse.json({ duplicate: true, eventId: Number(duplicate.id), metadata: duplicate.payload });
  if (!session || session.status === "ended" || new Date(session.expires_at).getTime() <= Date.now()) return NextResponse.json({ error: "This session is unavailable or expired." }, { status: 410 });
  if (session.revision !== requestData.expectedRevision) return NextResponse.json({ error: "Session revision is stale.", revision: session.revision, recover: true }, { status: 409 });
  const sessionRevision = session.revision;
  const limited = consumeRateLimit(`reveal:${sessionId}:${user.id}`, 4, 60 * 60_000);
  if (!limited.allowed) return NextResponse.json({ error: "This session reached its live reveal limit. Continue with canonical 3D." }, { status: 429, headers: { "retry-after": String(limited.retryAfterSeconds) } });

  const canonical = pairedCanonicalStateSchema.parse(session.canonical_state);
  if (!canonical.source || canonical.visualReveal?.status !== "requested" || canonical.visualReveal.canonicalRevision !== canonical.designRevision) return NextResponse.json({ error: "Request a reveal for the current selected direction first." }, { status: 422 });
  const requestedAt = canonical.visualReveal.requestedAt;
  const { data: sourceBlob, error: sourceError } = await admin.storage.from("studio-sources").download(canonical.source.objectPath);
  if (sourceError || !sourceBlob) return commitFailure("The private room source is unavailable. Upload the room again or continue with canonical 3D.");

  let generated;
  try {
    generated = await generateVisualReveal({ source: new Uint8Array(await sourceBlob.arrayBuffer()), sourceMimeType: "image/jpeg", brief: compileVisualDesignBrief(canonical) });
  } catch (cause) {
    return commitFailure(cause instanceof VisualRevealProviderError ? cause.safeMessage : "Nano Banana could not generate this reveal. Continue with canonical 3D or retry.");
  }

  const extension = generated.mimeType === "image/jpeg" ? "jpg" : generated.mimeType === "image/webp" ? "webp" : "png";
  const objectPath = `${sessionId}/${canonical.designRevision}-${randomUUID()}.${extension}`;
  const uploaded = await admin.storage.from("studio-renders").upload(objectPath, generated.image, { contentType: generated.mimeType, upsert: false });
  if (uploaded.error) return commitFailure("The generated reveal could not be stored privately. Continue with canonical 3D or retry.");
  const createdAt = new Date().toISOString();
  const nextCanonical = pairedCanonicalStateSchema.parse({ ...canonical, visualReveal: { status: "generated", canonicalRevision: canonical.designRevision, requestedAt, objectPath, sourceObjectPath: canonical.source.objectPath, model: generated.model, responseId: generated.responseId, latencyMs: generated.latencyMs, createdAt, disclosure: generated.disclosure } });
  const payload = { canonicalRevision: canonical.designRevision, objectPath, model: generated.model, responseId: generated.responseId, latencyMs: generated.latencyMs, createdAt, disclosure: generated.disclosure };
  const committed = await admin.rpc("commit_studio_command", { p_session_id: sessionId, p_actor_user_id: user.id, p_expected_revision: sessionRevision, p_canonical_state: nextCanonical, p_event_type: "visual_reveal_generated", p_idempotency_key: requestData.idempotencyKey, p_payload: payload, p_status: "active" });
  if (committed.error || !committed.data) {
    await admin.storage.from("studio-renders").remove([objectPath]);
    return NextResponse.json({ error: "The session changed before the reveal could be attached. Synchronize and retry.", recover: true }, { status: 409 });
  }
  return NextResponse.json({ status: "generated", revision: (committed.data as { revision: number }).revision, metadata: payload });

  async function commitFailure(failure: string) {
    const nextCanonical = pairedCanonicalStateSchema.parse({ ...canonical, visualReveal: { status: "failed", canonicalRevision: canonical.designRevision, requestedAt, failure } });
    const payload = { canonicalRevision: canonical.designRevision, failure };
    const committed = await admin!.rpc("commit_studio_command", { p_session_id: sessionId, p_actor_user_id: user!.id, p_expected_revision: sessionRevision, p_canonical_state: nextCanonical, p_event_type: "visual_reveal_failed", p_idempotency_key: requestData.idempotencyKey, p_payload: payload, p_status: "active" });
    if (committed.error) return NextResponse.json({ error: failure, recover: true }, { status: 502 });
    return NextResponse.json({ status: "failed", error: failure }, { status: 502 });
  }
}
