import { NextResponse } from "next/server";
import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import { preparedInteriorScene } from "@/lib/spatial/prepared-scenes";
import {
  clarifiedProposalSchema,
  preparedProposalFallback,
  proposalContext,
  proposalRequestSchema,
  type ProposalEnvelope,
} from "@/lib/ai/proposal";

const defaultModel = "gpt-5.6-terra";

function fallback(request: string, disclosure: string): ProposalEnvelope {
  return {
    mode: "prepared_fallback",
    result: preparedProposalFallback(request),
    disclosure,
  };
}

export async function POST(request: Request) {
  const parsed = proposalRequestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Provide a spatial request between 3 and 500 characters." },
      { status: 400 },
    );
  }

  const apiKey = process.env.OPENAI_API_KEY?.trim();
  const liveEnabled = process.env.ENABLE_LIVE_OPENAI?.trim() === "true";
  const canaryResponseId = process.env.OPENAI_CANARY_RESPONSE_ID?.trim();
  if (!apiKey || !liveEnabled || !canaryResponseId) {
    const disclosure = !apiKey
      ? "Prepared deterministic clarification; OPENAI_API_KEY is not configured."
      : !liveEnabled
        ? "Prepared deterministic clarification; live OpenAI is disabled until its canary is verified."
        : "Prepared deterministic clarification; no durable Terra canary evidence is configured.";
    return NextResponse.json(
      fallback(parsed.data.request, disclosure),
    );
  }

  const model = process.env.OPENAI_MODEL?.trim() || defaultModel;
  if (model !== defaultModel) {
    return NextResponse.json(
      fallback(parsed.data.request, `Prepared deterministic clarification; unsupported live model ${model}.`),
    );
  }
  try {
    const client = new OpenAI({ apiKey });
    const response = await client.responses.parse({
      model,
      store: false,
      instructions:
        "You clarify a homeowner's request into the supplied typed proposal. Use only provided object and constraint IDs. Never decide authority, geometry validity, safety, or commit eligibility. Ask one concise question when target, direction, or distance is ambiguous.",
      input: JSON.stringify({
        request: parsed.data.request,
        scene: proposalContext(preparedInteriorScene),
      }),
      text: {
        format: zodTextFormat(clarifiedProposalSchema, "spatial_proposal"),
      },
    }, { signal: AbortSignal.timeout(6000) });

    if (!response.output_parsed || !response.id) {
      return NextResponse.json(
        fallback(parsed.data.request, "GPT-5.6 returned no typed proposal; prepared fallback is active."),
      );
    }

    const envelope: ProposalEnvelope = {
      mode: "gpt-5.6-terra",
      model,
      requestId: response.id,
      result: response.output_parsed,
      disclosure: "GPT-5.6 clarified intent only; deterministic code owns authority and mutation.",
    };
    return NextResponse.json(envelope);
  } catch {
    return NextResponse.json(
      fallback(parsed.data.request, "GPT-5.6 was unavailable; prepared deterministic fallback is active."),
    );
  }
}
