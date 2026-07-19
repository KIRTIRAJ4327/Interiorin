import { z } from "zod";

const conciseText = z.string().trim().min(1).max(280);

export const voiceBriefSchema = z.object({
  purpose: conciseText,
  feeling: conciseText,
  mustKeep: conciseText,
  improveOrAvoid: conciseText,
}).strict();

export const voiceRefinementSchema = z.object({ transcript: z.string().trim().min(2).max(500) }).strict();

export const voiceSessionEnvelopeSchema = z.object({
  signedUrl: z.string().url().refine((value) => value.startsWith("wss://"), "Expected a secure WebSocket URL."),
  expiresInSeconds: z.number().int().positive().max(900),
  initialization: z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])),
}).strict();

export type VoiceBrief = z.infer<typeof voiceBriefSchema>;
