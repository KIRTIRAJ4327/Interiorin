import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";
import { z } from "zod";
import {
  analysisFileLimitBytes,
  spaceAnalysisEnvelopeSchema,
  spaceAnalysisSchema,
  type SpaceAnalysisEnvelope,
} from "@/lib/studio/analysis";

export const runtime = "nodejs";

const defaultModel = "gemini-3.5-flash";
const allowedKinds = new Set(["interior", "exterior"]);

function unavailable(disclosure: string): SpaceAnalysisEnvelope {
  return spaceAnalysisEnvelopeSchema.parse({ status: "provider_unavailable", disclosure });
}

export async function POST(request: Request) {
  const body = await request.formData().catch(() => undefined);
  const file = body?.get("source");
  const kind = body?.get("kind");
  const condition = body?.get("condition");
  const intent = body?.get("intent");

  if (!file || typeof file === "string" || typeof kind !== "string" || !allowedKinds.has(kind) || typeof condition !== "string" || typeof intent !== "string") {
    return NextResponse.json(
      spaceAnalysisEnvelopeSchema.parse({ status: "invalid_source", disclosure: "Provide one image or PDF plus the project context." }),
      { status: 400 },
    );
  }
  const supported = file.type.startsWith("image/") || file.type === "application/pdf";
  if (!supported || file.size === 0 || file.size > analysisFileLimitBytes) {
    return NextResponse.json(
      spaceAnalysisEnvelopeSchema.parse({
        status: "invalid_source",
        disclosure: `Visual analysis accepts a non-empty image or PDF up to ${analysisFileLimitBytes / 1024 / 1024} MB.`,
      }),
      { status: 413 },
    );
  }

  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY?.trim();
  if (!apiKey) {
    return NextResponse.json(unavailable("Visual source analysis is unavailable because the server has no Google Generative AI key. Entered dimensions remain usable."));
  }

  const model = process.env.GEMINI_ANALYSIS_MODEL?.trim() || defaultModel;
  try {
    const ai = new GoogleGenAI({ apiKey });
    const sourceData = Buffer.from(await file.arrayBuffer()).toString("base64");
    const response = await ai.models.generateContent({
      model,
      contents: [
        { inlineData: { data: sourceData, mimeType: file.type } },
        { text: `Analyze this ${kind} source for an evidence-aware spatial design tool. The user says the space is ${condition} and wants: ${intent}. Report only visually supportable observations. Never estimate dimensions, legal boundaries, structure, code compliance, utilities, drainage, or hidden conditions. Treat ambiguous items as low confidence and ask concise clarification questions. If the source conflicts with the user's space kind, report the observed kind honestly.` },
      ],
      config: {
        abortSignal: AbortSignal.timeout(20_000),
        responseMimeType: "application/json",
        responseJsonSchema: z.toJSONSchema(spaceAnalysisSchema, { target: "draft-7" }),
        temperature: 0.1,
      },
    });

    const analysis = spaceAnalysisSchema.parse(JSON.parse(response.text ?? "null"));
    return NextResponse.json(spaceAnalysisEnvelopeSchema.parse({
      status: "analyzed",
      analysis,
      model,
      requestId: response.responseId,
      disclosure: "Gemini identified visible spatial cues only. Entered measurements remain the sole metric authority.",
    }));
  } catch {
    return NextResponse.json(
      spaceAnalysisEnvelopeSchema.parse({ status: "analysis_failed", disclosure: "The visual source could not be analyzed. Entered dimensions remain usable and no visual estimate was promoted to fact." }),
    );
  }
}
