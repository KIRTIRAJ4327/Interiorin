import { z } from "zod";
import { actionReceiptSchema, sceneActionSchema, spatialSceneSchema } from "./schema";

export const transactionCheckSchema = z.object({
  code: z.string().min(1),
  status: z.enum(["pass", "warning", "fail"]),
  message: z.string().trim().min(1).max(280),
  relatedIds: z.array(z.string()).default([]),
});

export const truthTransactionSchema = z.object({
  id: z.string().min(1),
  sequence: z.number().int().nonnegative(),
  status: z.enum(["proposed", "committed", "rejected", "undone"]),
  action: sceneActionSchema,
  before: z.record(z.string(), z.unknown()),
  after: z.record(z.string(), z.unknown()),
  reason: z.string().trim().min(1).max(500),
  servesPreference: z.string().trim().min(1).max(220),
  checks: z.array(transactionCheckSchema),
  receipt: actionReceiptSchema,
  createdAt: z.string().datetime(),
});
export type TruthTransaction = z.infer<typeof truthTransactionSchema>;

export const truthBranchSchema = z.object({
  id: z.string().min(1),
  name: z.string().trim().min(1).max(40),
  baselineSceneId: z.string().min(1),
  rulePack: z.enum(["interior-v1", "exterior-v1"]),
  intent: z.string().trim().min(1).max(300),
  transactions: z.array(truthTransactionSchema),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
export type TruthBranch = z.infer<typeof truthBranchSchema>;

export const sceneVersionSchema = z.object({
  id: z.string().min(1),
  name: z.string().trim().min(1).max(40),
  branchId: z.string().min(1),
  scene: spatialSceneSchema,
  captureUrl: z.string().min(1).optional(),
  captureState: z.enum(["pending", "ready", "failed"]),
  createdAt: z.string().datetime(),
});
export type SceneVersion = z.infer<typeof sceneVersionSchema>;
