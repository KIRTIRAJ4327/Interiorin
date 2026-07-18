import { z } from "zod";

export const conceptRenderEnvelopeSchema = z.object({
  status: z.enum(["generated", "provider_unavailable", "invalid_source", "generation_failed"]),
  disclosure: z.string().trim().min(1).max(320),
  imageDataUrl: z.string().startsWith("data:image/").max(12_000_000).optional(),
  model: z.string().trim().min(1).max(100).optional(),
  requestId: z.string().trim().min(1).max(180).optional(),
  createdAt: z.string().datetime().optional(),
});

export type ConceptRenderEnvelope = z.infer<typeof conceptRenderEnvelopeSchema>;

