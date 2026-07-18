import { z } from "zod";

export const studioMemberRoleSchema = z.enum(["wall", "controller"]);
export type StudioMemberRole = z.infer<typeof studioMemberRoleSchema>;

export const studioSessionStatusSchema = z.enum(["pairing", "active", "ended", "expired"]);

const commandBase = {
  idempotencyKey: z.string().uuid(),
  expectedRevision: z.number().int().nonnegative(),
  clientTimestamp: z.string().datetime(),
};

export const studioCommandSchema = z.discriminatedUnion("type", [
  z.object({ ...commandBase, type: z.literal("submit_source"), sourceObjectPath: z.string().min(3).max(300), mimeType: z.enum(["image/jpeg", "image/png", "image/webp"]), byteSize: z.number().int().positive().max(5 * 1024 * 1024) }),
  z.object({ ...commandBase, type: z.literal("confirm_analysis"), acceptedRetainedObjectIds: z.array(z.string().min(1).max(100)).max(12) }),
  z.object({ ...commandBase, type: z.literal("submit_brief"), answers: z.object({ purpose: z.string().trim().min(3).max(320), feeling: z.string().trim().min(3).max(240), mustKeep: z.string().trim().max(240), improveOrAvoid: z.string().trim().max(320) }) }),
  z.object({ ...commandBase, type: z.literal("generate_options") }),
  z.object({ ...commandBase, type: z.literal("select_option"), optionId: z.string().min(1).max(100) }),
  z.object({ ...commandBase, type: z.literal("request_refinement"), transcript: z.string().trim().min(2).max(500) }),
  z.object({ ...commandBase, type: z.literal("confirm_proposal"), proposalId: z.string().min(1).max(120) }),
  z.object({ ...commandBase, type: z.literal("reject_proposal"), proposalId: z.string().min(1).max(120) }),
  z.object({ ...commandBase, type: z.literal("save_version"), name: z.string().trim().min(1).max(40) }),
  z.object({ ...commandBase, type: z.literal("select_comparison"), firstVersionId: z.string().min(1), secondVersionId: z.string().min(1) }).refine((value) => value.firstVersionId !== value.secondVersionId, { message: "Choose two different versions." }),
  z.object({ ...commandBase, type: z.literal("select_review_version"), versionId: z.string().min(1) }),
  z.object({ ...commandBase, type: z.literal("end_session") }),
]);

export type StudioCommand = z.infer<typeof studioCommandSchema>;

export const studioEventTypeSchema = z.enum([
  "session_created", "controller_joined", "source_submitted", "source_analyzed",
  "brief_answered", "brief_confirmed", "options_generated", "option_selected",
  "refinement_requested", "proposal_ready", "proposal_rejected", "proposal_confirmed",
  "scene_committed", "version_saved", "comparison_selected", "review_version_selected",
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

