import { z } from "zod";

const observationConfidenceSchema = z.enum(["high", "medium", "low"]);
const relativePositionSchema = z.enum(["left", "center", "right", "foreground", "middle", "background", "uncertain"]);

export const spaceAnalysisSchema = z.object({
  spaceKind: z.enum(["interior", "exterior", "uncertain"]),
  spaceType: z.string().trim().min(1).max(80),
  summary: z.string().trim().min(1).max(420),
  confidence: observationConfidenceSchema,
  openings: z.array(z.object({
    kind: z.enum(["door", "window", "gate", "passage"]),
    label: z.string().trim().min(1).max(80),
    position: relativePositionSchema,
    confidence: observationConfidenceSchema,
  })).max(8),
  retainedObjects: z.array(z.object({
    label: z.string().trim().min(1).max(80),
    category: z.enum(["seating", "table", "storage", "lighting", "decor", "appliance", "plant", "tree", "hardscape", "structure"]),
    position: relativePositionSchema,
    confidence: observationConfidenceSchema,
    likelyMovable: z.boolean(),
  })).max(12),
  styleCues: z.array(z.object({
    label: z.string().trim().min(1).max(80),
    confidence: observationConfidenceSchema,
  })).max(8),
  naturalLight: z.object({
    level: z.enum(["low", "medium", "high", "uncertain"]),
    note: z.string().trim().min(1).max(180),
    confidence: observationConfidenceSchema,
  }),
  reviewRisks: z.array(z.string().trim().min(1).max(180)).max(8),
  clarificationQuestions: z.array(z.string().trim().min(1).max(180)).max(6),
  metricWarning: z.literal("No metric dimensions were inferred from the uncalibrated source."),
});

export type SpaceAnalysis = z.infer<typeof spaceAnalysisSchema>;

export const spaceAnalysisEnvelopeSchema = z.object({
  status: z.enum(["analyzed", "provider_unavailable", "invalid_source", "analysis_failed"]),
  analysis: spaceAnalysisSchema.optional(),
  disclosure: z.string().trim().min(1).max(300),
  model: z.string().trim().min(1).max(100).optional(),
  requestId: z.string().trim().min(1).max(180).optional(),
});

export type SpaceAnalysisEnvelope = z.infer<typeof spaceAnalysisEnvelopeSchema>;

export const analysisFileLimitBytes = 15 * 1024 * 1024;

