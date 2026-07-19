import { z } from "zod";
import { spaceAnalysisSchema } from "@/lib/studio/analysis";
import { studioOptionSchema } from "@/lib/studio/schema";
import { actionReceiptSchema, sceneActionSchema } from "@/lib/spatial/schema";

export const studioMemberRoleSchema = z.enum(["wall", "controller"]);
export type StudioMemberRole = z.infer<typeof studioMemberRoleSchema>;

export const studioSessionStatusSchema = z.enum(["pairing", "active", "ended", "expired"]);

const commandBase = {
  idempotencyKey: z.string().uuid(),
  expectedRevision: z.number().int().nonnegative(),
  clientTimestamp: z.string().datetime(),
};

export const refinementInterpretationSchema = z.object({
  mode: z.enum(["local_parser", "gpt-5.6-terra", "prepared_fallback"]),
  action: sceneActionSchema.optional(),
  summary: z.string().trim().min(1).max(280).optional(),
  clarification: z.string().trim().min(1).max(280).optional(),
  model: z.string().max(100).optional(), responseId: z.string().max(180).optional(),
  disclosure: z.string().trim().min(1).max(300), latencyMs: z.number().int().nonnegative().max(30_000),
}).refine((value) => Boolean(value.action && value.summary) !== Boolean(value.clarification), { message: "Provide one action proposal or one clarification." });

export const studioCommandSchema = z.discriminatedUnion("type", [
  z.object({ ...commandBase, type: z.literal("submit_source"), sourceObjectPath: z.string().min(3).max(300), fileName: z.string().min(1).max(180), mimeType: z.literal("image/jpeg"), byteSize: z.number().int().positive().max(5 * 1024 * 1024), pixelWidth: z.number().int().positive().max(2048), pixelHeight: z.number().int().positive().max(2048), dimensions: z.object({ widthM: z.number().min(2).max(40), depthM: z.number().min(2).max(40), heightM: z.number().min(2).max(8) }) }),
  z.object({ ...commandBase, type: z.literal("confirm_analysis"), analysis: spaceAnalysisSchema.optional(), disclosure: z.string().trim().min(1).max(300), acceptedRetainedObjectIds: z.array(z.string().min(1).max(100)).max(12) }),
  z.object({ ...commandBase, type: z.literal("submit_brief"), answers: z.object({ purpose: z.string().trim().min(3).max(320), feeling: z.string().trim().min(3).max(240), mustKeep: z.string().trim().max(240), improveOrAvoid: z.string().trim().max(320) }) }),
  z.object({ ...commandBase, type: z.literal("generate_options") }),
  z.object({ ...commandBase, type: z.literal("select_option"), optionId: z.string().min(1).max(100) }),
  z.object({ ...commandBase, type: z.literal("request_refinement"), transcript: z.string().trim().min(2).max(500), interpretation: refinementInterpretationSchema }),
  z.object({ ...commandBase, type: z.literal("confirm_proposal"), proposalId: z.string().min(1).max(120) }),
  z.object({ ...commandBase, type: z.literal("reject_proposal"), proposalId: z.string().min(1).max(120) }),
  z.object({ ...commandBase, type: z.literal("save_version"), name: z.string().trim().min(1).max(40) }),
  z.object({ ...commandBase, type: z.literal("select_comparison"), firstVersionId: z.string().min(1), secondVersionId: z.string().min(1) }).refine((value) => value.firstVersionId !== value.secondVersionId, { message: "Choose two different versions." }),
  z.object({ ...commandBase, type: z.literal("select_review_version"), versionId: z.string().min(1) }),
  z.object({ ...commandBase, type: z.literal("request_visual_reveal") }),
  z.object({ ...commandBase, type: z.literal("end_session") }),
]);

export type StudioCommand = z.infer<typeof studioCommandSchema>;

export const pairedProposalSchema = z.object({
  id: z.string().min(1), transcript: z.string().min(2).max(500), interpretation: refinementInterpretationSchema,
  receipt: actionReceiptSchema.optional(), status: z.enum(["clarification", "awaiting_approval", "committed", "rejected"]),
  beforeAfterDiff: z.record(z.string(), z.unknown()).optional(), createdAt: z.string().datetime(), decidedAt: z.string().datetime().optional(),
});
export type PairedProposal = z.infer<typeof pairedProposalSchema>;
export const pairedVersionSchema = z.object({ id: z.string().min(1), name: z.string().trim().min(1).max(40), optionId: z.string().min(1), scene: studioOptionSchema.shape.scene, createdAt: z.string().datetime() });

export const pairedVisualRevealSchema = z.object({
  status: z.enum(["requested", "generated", "stale", "failed"]),
  canonicalRevision: z.number().int().nonnegative(),
  requestedAt: z.string().datetime(),
  objectPath: z.string().min(3).max(300).optional(),
  sourceObjectPath: z.string().min(3).max(300).optional(),
  model: z.string().min(1).max(120).optional(),
  responseId: z.string().max(180).optional(),
  latencyMs: z.number().int().nonnegative().max(120_000).optional(),
  createdAt: z.string().datetime().optional(),
  disclosure: z.string().min(1).max(320).optional(),
  failure: z.string().min(1).max(240).optional(),
}).superRefine((value, context) => {
  if ((value.status === "generated" || value.status === "stale") && (!value.objectPath || !value.sourceObjectPath || !value.model || !value.createdAt || !value.disclosure)) {
    context.addIssue({ code: "custom", message: "Generated reveals require private artifact metadata." });
  }
  if (value.status === "failed" && !value.failure) context.addIssue({ code: "custom", message: "Failed reveals require a safe recovery message." });
});

export const pairedCanonicalStateSchema = z.object({
  stage: z.enum(["space", "brief", "options", "refine", "approve", "ended"]).default("space"),
  designRevision: z.number().int().nonnegative().default(0),
  source: z.object({
    objectPath: z.string().min(3).max(300), fileName: z.string().min(1).max(180), mimeType: z.literal("image/jpeg"),
    byteSize: z.number().int().positive().max(5 * 1024 * 1024), pixelWidth: z.number().int().positive().max(2048), pixelHeight: z.number().int().positive().max(2048),
    dimensions: z.object({ widthM: z.number().min(2).max(40), depthM: z.number().min(2).max(40), heightM: z.number().min(2).max(8) }),
  }).optional(),
  analysis: spaceAnalysisSchema.optional(),
  analysisDisclosure: z.string().max(300).optional(),
  acceptedRetainedObjectIds: z.array(z.string()).max(12).default([]),
  brief: z.object({ purpose: z.string(), feeling: z.string(), mustKeep: z.string(), improveOrAvoid: z.string() }).optional(),
  options: z.array(studioOptionSchema).max(3).default([]),
  selectedOptionId: z.string().optional(),
  proposals: z.array(pairedProposalSchema).max(20).default([]),
  receipts: z.array(pairedProposalSchema).max(20).default([]),
  versions: z.array(pairedVersionSchema).max(12).default([]),
  comparison: z.object({ firstVersionId: z.string(), secondVersionId: z.string() }).optional(),
  selectedReviewVersionId: z.string().optional(),
  visualReveal: pairedVisualRevealSchema.optional(),
});

export type PairedCanonicalState = z.infer<typeof pairedCanonicalStateSchema>;

export const studioEventTypeSchema = z.enum([
  "session_created", "controller_joined", "source_submitted", "source_analyzed",
  "brief_answered", "brief_confirmed", "options_generated", "option_selected",
  "refinement_requested", "proposal_ready", "proposal_rejected", "proposal_confirmed",
  "scene_committed", "version_saved", "comparison_selected", "review_version_selected",
  "visual_reveal_requested", "visual_reveal_generated", "visual_reveal_failed", "visual_reveal_stale",
  "handoff_exported", "provider_failed", "session_ended",
]);

export const studioEventSchema = z.object({
  id: z.number().int().positive(),
  sessionId: z.string().uuid(),
  eventType: studioEventTypeSchema,
  actorRole: studioMemberRoleSchema.nullable(),
  payload: z.record(z.string(), z.unknown()),
  createdAt: z.string().datetime(),
});

export type StudioEvent = z.infer<typeof studioEventSchema>;

export const studioSnapshotSchema = z.object({
  sessionId: z.string().uuid(),
  topic: z.string().min(10),
  revision: z.number().int().nonnegative(),
  status: studioSessionStatusSchema,
  canonicalState: z.record(z.string(), z.unknown()),
  lastEventId: z.number().int().nonnegative(),
  events: z.array(studioEventSchema).max(500),
  members: z.array(z.object({ role: studioMemberRoleSchema, joinedAt: z.string().datetime() })).max(2),
  expiresAt: z.string().datetime(),
});

export type StudioSnapshot = z.infer<typeof studioSnapshotSchema>;

export const sessionCreateEnvelopeSchema = z.object({
  mode: z.enum(["supabase", "same_device"]),
  sessionId: z.string().uuid(),
  joinUrl: z.string().url(),
  qrDataUrl: z.string().startsWith("data:image/png;base64,"),
  pairingCode: z.string().length(6),
  expiresAt: z.string().datetime(),
  disclosure: z.string().min(1),
});

export type SessionCreateEnvelope = z.infer<typeof sessionCreateEnvelopeSchema>;

export const sessionJoinRequestSchema = z.object({ token: z.string().min(32).max(256) });
export const sessionJoinEnvelopeSchema = z.object({
  mode: z.enum(["supabase", "same_device"]),
  sessionId: z.string().uuid(),
  role: z.literal("controller"),
  disclosure: z.string().min(1),
});

export type SessionJoinEnvelope = z.infer<typeof sessionJoinEnvelopeSchema>;
