import { z } from "zod";

export const spaceKindSchema = z.enum(["interior", "exterior"]);
export type SpaceKind = z.infer<typeof spaceKindSchema>;

export const evidenceKindSchema = z.enum([
  "observed",
  "user_entered",
  "inferred",
  "generated",
  "prepared_demo",
]);
export type EvidenceKind = z.infer<typeof evidenceKindSchema>;

export const confidenceSchema = z.enum(["high", "medium", "low", "unverified"]);
export type Confidence = z.infer<typeof confidenceSchema>;

export const authoritySchema = z.enum([
  "verified",
  "user_declared",
  "observed_unverified",
  "inferred",
  "generated",
]);
export type Authority = z.infer<typeof authoritySchema>;

export const vector3Schema = z.object({
  x: z.number().finite(),
  y: z.number().finite(),
  z: z.number().finite(),
});
export type Vector3 = z.infer<typeof vector3Schema>;

export const provenanceSchema = z.object({
  evidence: evidenceKindSchema,
  confidence: confidenceSchema,
  authority: authoritySchema,
  sourceLabel: z.string().trim().min(1).max(120),
  sourceRef: z.string().trim().min(1).max(160).optional(),
  sourceEventId: z.string().trim().min(1).max(160).optional(),
  capturedAt: z.string().datetime().optional(),
  note: z.string().trim().max(280).optional(),
});
export type Provenance = z.infer<typeof provenanceSchema>;

export const dimensionsSchema = z.object({
  width: z.number().positive(),
  height: z.number().positive(),
  depth: z.number().positive(),
  provenance: provenanceSchema,
  widthProvenance: provenanceSchema.optional(),
});

export const transformSchema = z.object({
  position: vector3Schema,
  rotation: vector3Schema,
  scale: vector3Schema,
});

export const zoneSchema = z.object({
  id: z.string().min(1),
  label: z.string().trim().min(1).max(80),
  kind: z.enum([
    "floor",
    "wall",
    "ceiling",
    "yard",
    "patio",
    "planting_bed",
    "facade",
    "protected_boundary",
  ]),
  polygon: z.array(vector3Schema).min(3),
  materialId: z.string().min(1),
  protected: z.boolean().default(false),
  provenance: provenanceSchema,
});
export type SpatialZone = z.infer<typeof zoneSchema>;

export const openingSchema = z.object({
  id: z.string().min(1),
  label: z.string().trim().min(1).max(80),
  kind: z.enum(["door", "window", "gate", "passage"]),
  parentZoneId: z.string().min(1),
  transform: transformSchema,
  dimensions: dimensionsSchema,
  protected: z.boolean().default(true),
  provenance: provenanceSchema,
});
export type SpatialOpening = z.infer<typeof openingSchema>;

export const sceneObjectSchema = z.object({
  id: z.string().min(1),
  label: z.string().trim().min(1).max(80),
  category: z.enum([
    "seating",
    "table",
    "storage",
    "lighting",
    "decor",
    "appliance",
    "plant",
    "tree",
    "hardscape",
    "structure",
  ]),
  assetId: z.string().min(1),
  transform: transformSchema,
  dimensions: dimensionsSchema,
  materialIds: z.array(z.string().min(1)).default([]),
  protected: z.boolean().default(false),
  provenance: provenanceSchema,
});
export type SceneObject = z.infer<typeof sceneObjectSchema>;

export const constraintSchema = z.object({
  id: z.string().min(1),
  type: z.enum([
    "clearance",
    "opening",
    "scale",
    "sun",
    "climate",
    "maintenance",
    "drainage",
    "utility",
    "property_boundary",
    "local_code",
  ]),
  severity: z.enum(["info", "review", "blocking"]),
  message: z.string().trim().min(1).max(280),
  relatedIds: z.array(z.string()).default([]),
  thresholdMeters: z.number().positive().optional(),
  requiresProfessionalReview: z.boolean().default(false),
  provenance: provenanceSchema,
});
export type SpatialConstraint = z.infer<typeof constraintSchema>;

export const calibrationSchema = z.discriminatedUnion("status", [
  z.object({
    status: z.literal("approximate"),
    message: z.string().trim().min(1).max(220),
  }),
  z.object({
    status: z.literal("calibrated"),
    anchorLabel: z.string().trim().min(1).max(100),
    realLengthMeters: z.number().positive(),
    modelLengthMeters: z.number().positive(),
  }),
]);

export const spatialSceneSchema = z.object({
  schemaVersion: z.literal("1.0"),
  id: z.string().min(1),
  name: z.string().trim().min(1).max(80),
  kind: spaceKindSchema,
  sourceKind: z.enum(["photo", "floor_plan", "guided_views", "prepared_demo"]),
  calibration: calibrationSchema,
  zones: z.array(zoneSchema).min(1),
  openings: z.array(openingSchema),
  objects: z.array(sceneObjectSchema),
  constraints: z.array(constraintSchema),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
export type SpatialScene = z.infer<typeof spatialSceneSchema>;

const versionNameSchema = z
  .string()
  .transform((value) => value.trim().replace(/\s+/g, " "))
  .pipe(z.string().min(1).max(40));

export const sceneActionSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("move_object"),
    objectId: z.string().min(1),
    position: vector3Schema,
  }),
  z.object({
    type: z.literal("protect_object"),
    objectId: z.string().min(1),
    protected: z.boolean(),
  }),
  z.object({
    type: z.literal("replace_object"),
    objectId: z.string().min(1),
    assetId: z.string().min(1),
  }),
  z.object({
    type: z.literal("set_material"),
    zoneId: z.string().min(1),
    materialId: z.string().min(1),
  }),
  z.object({
    type: z.literal("set_environment"),
    warmth: z.enum(["cool", "neutral", "warm"]),
    intensity: z.enum(["dim", "normal", "bright"]),
  }),
  z.object({
    type: z.literal("save_version"),
    name: versionNameSchema,
  }),
  z.object({
    type: z.literal("compare_versions"),
    firstVersionId: z.string().min(1),
    secondVersionId: z.string().min(1),
  }).refine((value) => value.firstVersionId !== value.secondVersionId, {
    message: "Choose two different saved versions.",
    path: ["secondVersionId"],
  }),
  z.object({ type: z.literal("undo") }),
]);
export type SceneAction = z.infer<typeof sceneActionSchema>;

export function freezeSceneAction(candidate: SceneAction): SceneAction {
  const action = sceneActionSchema.parse(candidate);
  if (action.type === "move_object") Object.freeze(action.position);
  return Object.freeze(action);
}

export const actionReceiptSchema = z.object({
  id: z.string().min(1),
  action: sceneActionSchema,
  status: z.enum(["accepted", "rejected"]),
  message: z.string().trim().min(1).max(280),
  changedIds: z.array(z.string()).default([]),
  warnings: z.array(z.string()).default([]),
  createdAt: z.string().datetime(),
});
export type ActionReceipt = z.infer<typeof actionReceiptSchema>;

export const designRecommendationSchema = z.object({
  id: z.string().min(1),
  title: z.string().trim().min(1).max(100),
  rationale: z.string().trim().min(1).max(500),
  relatedConstraintIds: z.array(z.string()).default([]),
  assumptionIds: z.array(z.string()).default([]),
  proposedActions: z.array(sceneActionSchema).min(1),
  confidence: confidenceSchema,
});
export type DesignRecommendation = z.infer<typeof designRecommendationSchema>;
