import { GoogleGenAI } from "@google/genai";
import { compileVisualRevealPrompt, type VisualDesignBrief } from "./schema";

const allowedOutputTypes = new Set(["image/png", "image/jpeg", "image/webp"]);

export class VisualRevealProviderError extends Error {
  constructor(public readonly safeMessage: string) { super(safeMessage); }
}

export async function generateVisualReveal({ source, sourceMimeType, brief }: { source: Uint8Array; sourceMimeType: "image/jpeg"; brief: VisualDesignBrief }) {
  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY?.trim();
  if (!apiKey) throw new VisualRevealProviderError("Nano Banana is not configured. Continue with canonical 3D or retry later.");
  const model = process.env.GEMINI_IMAGE_MODEL?.trim() || "gemini-3.1-flash-image";
  const startedAt = Date.now();
  try {
    const response = await new GoogleGenAI({ apiKey }).models.generateContent({
      model,
      contents: [{ inlineData: { data: Buffer.from(source).toString("base64"), mimeType: sourceMimeType } }, { text: compileVisualRevealPrompt(brief) }],
      config: { abortSignal: AbortSignal.timeout(60_000) },
    });
    const part = response.candidates?.flatMap((candidate) => candidate.content?.parts ?? []).find((candidate) => candidate.inlineData?.data);
    const data = part?.inlineData?.data;
    const mimeType = part?.inlineData?.mimeType ?? "image/png";
    if (!data || !allowedOutputTypes.has(mimeType)) throw new VisualRevealProviderError("Nano Banana returned no supported image. Continue with canonical 3D or retry.");
    const image = Buffer.from(data, "base64");
    if (!image.length || image.length > 15 * 1024 * 1024) throw new VisualRevealProviderError("The generated reveal was outside the safe image limit. Continue with canonical 3D or retry.");
    return { image, mimeType, model, responseId: response.responseId, latencyMs: Date.now() - startedAt, disclosure: "AI visual hypothesis—not measured. Canonical 3D and deterministic checks remain authoritative." };
  } catch (cause) {
    if (cause instanceof VisualRevealProviderError) throw cause;
    const message = cause instanceof Error && /429|quota|resource_exhausted|billing/i.test(cause.message)
      ? "Nano Banana quota is unavailable for this Google project. Enable billing or quota, then retry; canonical 3D remains available."
      : cause instanceof Error && /403|permission|forbidden/i.test(cause.message)
        ? "Nano Banana access is not enabled for this Google project. Continue with canonical 3D while access is repaired."
        : "Nano Banana could not generate this reveal. Continue with canonical 3D or retry.";
    throw new VisualRevealProviderError(message);
  }
}
