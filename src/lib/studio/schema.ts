import { z } from "zod";
import { spatialSceneSchema } from "@/lib/spatial/schema";
import { spaceAnalysisSchema } from "./analysis";

export const studioProjectSchema = z.object({
  id: z.string().min(1),
  name: z.string().trim().min(1).max(60),
  kind: z.enum(["interior", "exterior"]),
  condition: z.enum(["empty", "existing"]),
  intent: z.string().trim().min(8).max(320),
  dimensions: z.object({
    widthM: z.number().min(2).max(40),
    depthM: z.number().min(2).max(40),
    heightM: z.number().min(2).max(8),
  }),
  source: z.object({
    mode: z.enum(["guided_measurements", "photo_with_measurements"]),
    fileName: z.string().max(180).optional(),
    fileSize: z.number().nonnegative().optional(),
    authority: z.literal("user_declared"),
    analysis: spaceAnalysisSchema.optional(),
    analysisDisclosure: z.string().trim().min(1).max(300).optional(),
    analysisModel: z.string().trim().min(1).max(100).optional(),
    analysisRequestId: z.string().trim().min(1).max(180).optional(),
  }),
  createdAt: z.string().datetime(),
});

export type StudioProject = z.infer<typeof studioProjectSchema>;

export const studioOptionSchema = z.object({
  id: z.string().min(1),
  name: z.string().trim().min(1).max(60),
  principle: z.string().trim().min(1).max(120),
  rationale: z.string().trim().min(1).max(500),
  tradeoffs: z.array(z.string().trim().min(1).max(220)).min(1).max(5),
  scene: spatialSceneSchema,
});

export type StudioOption = z.infer<typeof studioOptionSchema>;

export const studioVersionSchema = z.object({
  id: z.string().min(1),
  projectId: z.string().min(1),
  optionId: z.string().min(1),
  name: z.string().trim().min(1).max(40),
  scene: spatialSceneSchema,
  receipts: z.array(z.object({
    id: z.string().min(1),
    transcript: z.string().min(1),
    summary: z.string().min(1),
    status: z.enum(["accepted", "rejected"]),
    createdAt: z.string().datetime(),
  })),
  createdAt: z.string().datetime(),
});

export type StudioVersion = z.infer<typeof studioVersionSchema>;
