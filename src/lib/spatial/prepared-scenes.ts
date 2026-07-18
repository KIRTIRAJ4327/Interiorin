import { spatialSceneSchema, type SpatialScene } from "./schema";

const entered = {
  evidence: "user_entered" as const,
  confidence: "high" as const,
  authority: "user_declared" as const,
  sourceLabel: "Prepared homeowner declaration",
  sourceRef: "prepared.homeowner-baseline-v1",
  capturedAt: "2026-07-18T00:00:00.000Z",
};

const observed = {
  evidence: "observed" as const,
  confidence: "high" as const,
  authority: "observed_unverified" as const,
  sourceLabel: "Visual estimate from prepared capture",
  sourceRef: "prepared.visual-estimate-v1",
  capturedAt: "2026-07-18T00:00:00.000Z",
};

const preparedVerified = {
  evidence: "prepared_demo" as const,
  confidence: "high" as const,
  authority: "user_declared" as const,
  sourceLabel: "Prepared homeowner baseline",
  sourceRef: "prepared.homeowner-baseline-v1",
  capturedAt: "2026-07-18T00:00:00.000Z",
};

const inferred = {
  evidence: "inferred" as const,
  confidence: "low" as const,
  authority: "inferred" as const,
  sourceLabel: "Inferred from a single exterior photograph",
};

const transform = (x: number, y: number, z: number) => ({
  position: { x, y, z },
  rotation: { x: 0, y: 0, z: 0 },
  scale: { x: 1, y: 1, z: 1 },
});

const instant = "2026-07-18T00:00:00.000Z";

export const preparedInteriorScene: SpatialScene = spatialSceneSchema.parse({
  schemaVersion: "1.0",
  id: "prepared-dining-room",
  name: "Dining room · measured baseline",
  kind: "interior",
  sourceKind: "prepared_demo",
  calibration: {
    status: "calibrated",
    anchorLabel: "North wall",
    realLengthMeters: 7,
    modelLengthMeters: 7,
  },
  zones: [
    {
      id: "floor",
      label: "Oak floor",
      kind: "floor",
      polygon: [
        { x: 0, y: 0, z: 0 },
        { x: 5.2, y: 0, z: 0 },
        { x: 5.2, y: 0, z: 4 },
        { x: 0, y: 0, z: 4 },
      ],
      materialId: "oak-natural",
      protected: true,
      provenance: entered,
    },
    {
      id: "north-wall",
      label: "North wall",
      kind: "wall",
      polygon: [
        { x: 0, y: 0, z: 0 },
        { x: 5.2, y: 0, z: 0 },
        { x: 5.2, y: 2.7, z: 0 },
        { x: 0, y: 2.7, z: 0 },
      ],
      materialId: "plaster-chalk",
      protected: true,
      provenance: observed,
    },
  ],
  openings: [
    {
      id: "door-east",
      label: "Hall door",
      kind: "door",
      parentZoneId: "north-wall",
      transform: transform(2.2, 0, 0),
      dimensions: { width: 0.88, height: 2.04, depth: 0.14, provenance: observed },
      protected: true,
      provenance: observed,
    },
  ],
  objects: [
    {
      id: "table",
      label: "Dining table",
      category: "table",
      assetId: "table-oval-oak",
      transform: transform(0.92, 0, 2),
      dimensions: { width: 1.6, height: 0.75, depth: 0.9, provenance: preparedVerified },
      materialIds: ["oak-mid"],
      protected: false,
      provenance: preparedVerified,
    },
    {
      id: "bookcase",
      label: "Heirloom bookcase",
      category: "storage",
      assetId: "bookcase-heirloom",
      transform: transform(3.3, 0, 0.35),
      dimensions: {
        width: 1,
        height: 1.8,
        depth: 0.35,
        provenance: observed,
        widthProvenance: observed,
      },
      materialIds: ["walnut-aged"],
      protected: true,
      provenance: preparedVerified,
    },
    {
      id: "pendant",
      label: "Existing pendant",
      category: "lighting",
      assetId: "pendant-opal",
      transform: transform(0, 2.1, 0),
      dimensions: { width: 0.42, height: 0.5, depth: 0.42, provenance: observed },
      materialIds: ["opal", "brass-aged"],
      protected: true,
      provenance: observed,
    },
  ],
  constraints: [
    {
      id: "path-clearance",
      type: "clearance",
      severity: "blocking",
      message: "Keep the prepared homeowner 0.9 m access path beside the observed bookcase.",
      relatedIds: ["table", "bookcase"],
      thresholdMeters: 0.9,
      requiresProfessionalReview: false,
      provenance: {
        ...entered,
        sourceLabel: "Prepared homeowner constraint",
        sourceRef: "prepared.homeowner-constraint-v1",
      },
    },
    {
      id: "bookcase-bounds-review",
      type: "scale",
      severity: "review",
      message: "Verify the observed bookcase depth before purchase or construction.",
      relatedIds: ["bookcase"],
      requiresProfessionalReview: true,
      provenance: observed,
    },
  ],
  createdAt: instant,
  updatedAt: instant,
});

export const preparedExteriorScene: SpatialScene = spatialSceneSchema.parse({
  schemaVersion: "1.0",
  id: "prepared-courtyard",
  name: "Courtyard · boundary unresolved",
  kind: "exterior",
  sourceKind: "prepared_demo",
  calibration: {
    status: "approximate",
    message: "The courtyard is approximate until one known measurement is entered.",
  },
  zones: [
    {
      id: "courtyard",
      label: "Courtyard",
      kind: "yard",
      polygon: [
        { x: -3, y: 0, z: -2 },
        { x: 3, y: 0, z: -2 },
        { x: 3, y: 0, z: 2 },
        { x: -3, y: 0, z: 2 },
      ],
      materialId: "gravel-warm",
      protected: false,
      provenance: observed,
    },
  ],
  openings: [],
  objects: [
    {
      id: "planter",
      label: "Stone planter",
      category: "plant",
      assetId: "planter-stone",
      transform: transform(1.2, 0, 0),
      dimensions: { width: 0.7, height: 0.55, depth: 0.7, provenance: observed },
      materialIds: ["limestone"],
      protected: false,
      provenance: observed,
    },
  ],
  constraints: [
    {
      id: "property-line",
      type: "property_boundary",
      severity: "blocking",
      message: "Property boundary unknown. A professional must enter it before this move can commit.",
      relatedIds: ["planter"],
      requiresProfessionalReview: true,
      provenance: inferred,
    },
  ],
  createdAt: instant,
  updatedAt: instant,
});

export function clonePreparedScene(kind: "interior" | "exterior"): SpatialScene {
  return structuredClone(kind === "interior" ? preparedInteriorScene : preparedExteriorScene);
}
