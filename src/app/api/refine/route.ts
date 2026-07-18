import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import { NextResponse } from "next/server";
import { z } from "zod";
import { sceneActionSchema } from "@/lib/spatial/schema";

const exactModel = "gpt-5.6-terra";
const refineRequestSchema = z.object({
  transcript: z.string().trim().min(2).max(500), fallbackQuestion: z.string().trim().min(1).max(280),
  context: z.object({
    objects: z.array(z.object({ id: z.string().min(1).max(100), label: z.string().max(80), category: z.string().max(40), assetId: z.string().max(120), protected: z.boolean(), position: z.object({ x: z.number(), y: z.number(), z: z.number() }), rotationY: z.number(), allowedAssetIds: z.array(z.string().max(120)).max(8) })).max(20),
    zones: z.array(z.object({ id: z.string().min(1).max(100), label: z.string().max(80), kind: z.string().max(40), protected: z.boolean(), materialId: z.string().max(120) })).max(12),
  }),
});
const providerResultSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("action_proposal"), action: sceneActionSchema, summary: z.string().trim().min(1).max(280) }),
  z.object({ type: z.literal("clarification"), question: z.string().trim().min(1).max(280) }),
]);

function fallback(question: string, disclosure: string, startedAt: number) {
  return { mode: "prepared_fallback" as const, clarification: question, disclosure, latencyMs: Date.now() - startedAt };
}

function referencesAllowed(action: z.infer<typeof sceneActionSchema>, context: z.infer<typeof refineRequestSchema>["context"]) {
  if (action.type === "undo" || action.type === "save_version" || action.type === "compare_versions") return false;
  if (action.type === "set_environment") return true;
  if (action.type === "set_material") return context.zones.some((zone) => zone.id === action.zoneId);
  const object = context.objects.find((candidate) => candidate.id === action.objectId);
  if (!object) return false;
  return action.type !== "replace_object" || object.allowedAssetIds.includes(action.assetId);
}

export async function POST(request: Request) {
  const startedAt = Date.now();
  const parsed = refineRequestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Refinement context failed validation." }, { status: 400 });
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  const liveEnabled = process.env.ENABLE_LIVE_OPENAI === "true";
  const canary = process.env.OPENAI_CANARY_RESPONSE_ID?.trim();
  const model = process.env.OPENAI_MODEL?.trim() || exactModel;
  if (!apiKey || !liveEnabled || !canary || !/^resp_[A-Za-z0-9_-]+$/.test(canary) || model !== exactModel) {
    const reason = !apiKey ? "OPENAI_API_KEY is not configured" : !liveEnabled ? "live OpenAI is disabled" : !canary || !/^resp_/.test(canary) ? "verified canary evidence is missing" : `unsupported model ${model}`;
    return NextResponse.json(fallback(parsed.data.fallbackQuestion, `Deterministic clarification retained; ${reason}.`, startedAt));
  }
  try {
    const client = new OpenAI({ apiKey });
    const response = await client.responses.parse({
      model, store: false, temperature: 0.1,
      instructions: "Interpret one homeowner request into exactly one supplied SceneAction or ask one concise clarification. Use only IDs and replacement variants present in context. Never approve, validate, or commit geometry. Never infer measurements.",
      input: JSON.stringify({ transcript: parsed.data.transcript, context: parsed.data.context }),
      text: { format: zodTextFormat(providerResultSchema, "paired_refinement") },
    }, { signal: AbortSignal.timeout(6_000) });
    const result = response.output_parsed;
    if (!result || !response.id) return NextResponse.json(fallback(parsed.data.fallbackQuestion, "Provider returned no validated typed result.", startedAt));
    if (result.type === "clarification") return NextResponse.json({ mode: "gpt-5.6-terra", clarification: result.question, model, responseId: response.id, disclosure: "GPT interpreted intent only; deterministic code owns authority and mutation.", latencyMs: Date.now() - startedAt });
    if (!referencesAllowed(result.action, parsed.data.context)) return NextResponse.json(fallback(parsed.data.fallbackQuestion, "Provider referenced an identifier or variant outside the supplied scene context.", startedAt));
    return NextResponse.json({ mode: "gpt-5.6-terra", action: result.action, summary: result.summary, model, responseId: response.id, disclosure: "GPT interpreted intent only; deterministic code owns authority and mutation.", latencyMs: Date.now() - startedAt });
  } catch {
    return NextResponse.json(fallback(parsed.data.fallbackQuestion, "Provider was unavailable or timed out; no scene mutation occurred.", startedAt));
  }
}
