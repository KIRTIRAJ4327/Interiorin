import { spatialSceneSchema, type Provenance, type SpatialScene } from "@/lib/spatial/schema";
import { studioOptionSchema, type StudioOption, type StudioProject } from "./schema";

const transform = (x: number, y: number, z: number) => ({
  position: { x, y, z },
  rotation: { x: 0, y: 0, z: 0 },
  scale: { x: 1, y: 1, z: 1 },
});

function projectProvenance(project: StudioProject, label: string): Provenance {
  return {
    evidence: "user_entered",
    confidence: "high",
    authority: "user_declared",
    sourceLabel: label,
    sourceRef: `project:${project.id}:guided-measurements`,
    capturedAt: project.createdAt,
  };
}

function observedProvenance(project: StudioProject): Provenance {
  const analyzed = project.source.analysis;
  return {
    evidence: analyzed ? "observed" : project.source.mode === "photo_with_measurements" ? "observed" : "inferred",
    confidence: analyzed?.confidence ?? "medium",
    authority: "observed_unverified",
    sourceLabel: analyzed && project.source.fileName ? `AI-observed in ${project.source.fileName}` : project.source.fileName ? `Unanalyzed reference ${project.source.fileName}` : "Suggested from the project brief",
    sourceRef: `project:${project.id}:source`,
    capturedAt: project.createdAt,
    note: analyzed ? "Visible identity and relative placement were AI-observed; metric placement remains generated and requires review." : "Object identity and placement require homeowner review.",
  };
}

function relativeCoordinate(position: string, length: number) {
  if (position === "left" || position === "foreground") return length * 0.18;
  if (position === "right" || position === "background") return length * 0.82;
  return length * 0.5;
}

function observedItem(project: StudioProject, category: string) {
  return project.source.analysis?.retainedObjects.find((object) => object.category === category);
}

function analyzedOpenings(project: StudioProject, parentZoneId: string, width: number, depth: number, provenance: Provenance) {
  return (project.source.analysis?.openings ?? []).slice(0, 4).map((opening, index) => ({
    id: `observed-${opening.kind}-${index + 1}`,
    label: opening.label,
    kind: opening.kind,
    parentZoneId,
    transform: transform(relativeCoordinate(opening.position, width), 0, parentZoneId === "yard" ? relativeCoordinate(opening.position, depth) : 0),
    dimensions: {
      width: opening.kind === "window" ? Math.min(1.4, width * 0.25) : Math.min(1, width * 0.2),
      height: opening.kind === "window" ? 1.2 : 2.05,
      depth: 0.15,
      provenance: { ...provenance, confidence: opening.confidence },
    },
    protected: true,
    provenance: { ...provenance, confidence: opening.confidence },
  }));
}

function analysisReviewConstraints(project: StudioProject, provenance: Provenance) {
  const analysis = project.source.analysis;
  if (!analysis) return [];
  return analysis.clarificationQuestions.slice(0, 3).map((question, index) => ({
    id: `source-clarification-${index + 1}`,
    type: "scale" as const,
    severity: "review" as const,
    message: question,
    relatedIds: [],
    requiresProfessionalReview: false,
    provenance,
  }));
}

function interiorBaseline(project: StudioProject): SpatialScene {
  const { widthM: width, depthM: depth, heightM: height } = project.dimensions;
  const entered = projectProvenance(project, "Homeowner-entered room dimensions");
  const observed = observedProvenance(project);
  const sofaObservation = observedItem(project, "seating");
  const storageObservation = observedItem(project, "storage");
  const existing = project.condition === "existing" && !project.source.analysis;

  return spatialSceneSchema.parse({
    schemaVersion: "1.0",
    id: `${project.id}-baseline`,
    name: `${project.name} · entered baseline`,
    kind: "interior",
    sourceKind: project.source.mode === "photo_with_measurements" ? "photo" : "guided_views",
    calibration: {
      status: "calibrated",
      anchorLabel: "Entered room width",
      realLengthMeters: width,
      modelLengthMeters: width,
    },
    zones: [
      {
        id: "floor",
        label: "Main floor",
        kind: "floor",
        polygon: [
          { x: 0, y: 0, z: 0 }, { x: width, y: 0, z: 0 },
          { x: width, y: 0, z: depth }, { x: 0, y: 0, z: depth },
        ],
        materialId: "oak-natural",
        protected: false,
        provenance: entered,
      },
      {
        id: "north-wall",
        label: "North wall",
        kind: "wall",
        polygon: [
          { x: 0, y: 0, z: 0 }, { x: width, y: 0, z: 0 },
          { x: width, y: height, z: 0 }, { x: 0, y: height, z: 0 },
        ],
        materialId: "plaster-chalk",
        protected: false,
        provenance: entered,
      },
    ],
    openings: analyzedOpenings(project, "north-wall", width, depth, observed),
    objects: [
      {
        id: "sofa",
        label: sofaObservation?.label ?? (existing ? "Existing sofa" : "Suggested sofa"),
        category: "seating",
        assetId: "sofa-linen-low",
        transform: transform(Math.max(1.1, width * 0.26), 0, Math.max(0.65, depth * 0.22)),
        dimensions: { width: Math.min(2.2, width * 0.42), height: 0.82, depth: 0.92, provenance: observed },
        materialIds: ["linen-oat"],
        protected: sofaObservation ? !sofaObservation.likelyMovable : existing,
        provenance: observed,
      },
      {
        id: "table",
        label: "Central table",
        category: "table",
        assetId: "table-oak-round",
        transform: transform(width * 0.5, 0, depth * 0.52),
        dimensions: { width: Math.min(1.25, width * 0.26), height: 0.42, depth: Math.min(1.25, width * 0.26), provenance: observed },
        materialIds: ["oak-mid"],
        protected: false,
        provenance: observed,
      },
      {
        id: "storage",
        label: storageObservation?.label ?? (existing ? "Existing storage" : "Suggested storage"),
        category: "storage",
        assetId: "storage-bookcloth-low",
        transform: transform(Math.max(0.7, width * 0.82), 0, Math.max(0.3, depth * 0.1)),
        dimensions: { width: Math.min(1.6, width * 0.3), height: 1.2, depth: 0.38, provenance: observed },
        materialIds: ["bookcloth-walnut"],
        protected: storageObservation ? !storageObservation.likelyMovable : existing,
        provenance: observed,
      },
    ],
    constraints: [
      {
        id: "circulation",
        type: "clearance",
        severity: "review",
        message: "Keep a 900 mm circulation path through the entered room envelope.",
        relatedIds: ["sofa", "table", "storage"],
        thresholdMeters: 0.9,
        requiresProfessionalReview: false,
        provenance: entered,
      },
      ...analysisReviewConstraints(project, observed),
    ],
    createdAt: project.createdAt,
    updatedAt: project.createdAt,
  });
}

function exteriorBaseline(project: StudioProject): SpatialScene {
  const { widthM: width, depthM: depth } = project.dimensions;
  const entered = projectProvenance(project, "Homeowner-entered site dimensions");
  const observed = observedProvenance(project);
  const seatingObservation = observedItem(project, "seating");
  const treeObservation = observedItem(project, "tree");

  return spatialSceneSchema.parse({
    schemaVersion: "1.0",
    id: `${project.id}-baseline`,
    name: `${project.name} · entered site baseline`,
    kind: "exterior",
    sourceKind: project.source.mode === "photo_with_measurements" ? "photo" : "guided_views",
    calibration: {
      status: "calibrated",
      anchorLabel: "Entered site width",
      realLengthMeters: width,
      modelLengthMeters: width,
    },
    zones: [{
      id: "yard",
      label: "Entered site envelope",
      kind: "yard",
      polygon: [
        { x: 0, y: 0, z: 0 }, { x: width, y: 0, z: 0 },
        { x: width, y: 0, z: depth }, { x: 0, y: 0, z: depth },
      ],
      materialId: "ground-warm-gravel",
      protected: false,
      provenance: entered,
    }],
    openings: analyzedOpenings(project, "yard", width, depth, observed),
    objects: [
      {
        id: "outdoor-seating",
        label: seatingObservation?.label ?? "Suggested outdoor seating",
        category: "seating",
        assetId: "outdoor-bench-timber",
        transform: transform(width * 0.25, 0, depth * 0.28),
        dimensions: { width: Math.min(2.4, width * 0.32), height: 0.78, depth: 0.82, provenance: observed },
        materialIds: ["timber-weathered"],
        protected: seatingObservation ? !seatingObservation.likelyMovable : false,
        provenance: observed,
      },
      {
        id: "feature-tree",
        label: treeObservation?.label ?? "Suggested feature tree",
        category: "tree",
        assetId: "tree-canopy-small",
        transform: transform(width * 0.72, 0, depth * 0.68),
        dimensions: { width: 1.8, height: 3.4, depth: 1.8, provenance: observed },
        materialIds: ["foliage-olive"],
        protected: treeObservation ? !treeObservation.likelyMovable : false,
        provenance: observed,
      },
      {
        id: "patio-table",
        label: "Patio table",
        category: "table",
        assetId: "table-stone-round",
        transform: transform(width * 0.5, 0, depth * 0.48),
        dimensions: { width: 1.2, height: 0.74, depth: 1.2, provenance: observed },
        materialIds: ["stone-limestone"],
        protected: false,
        provenance: observed,
      },
    ],
    constraints: [
      {
        id: "site-boundary-review",
        type: "property_boundary",
        severity: "blocking",
        message: "Entered dimensions are not a legal property boundary. Confirm survey, setbacks, utilities, grade, and drainage before construction decisions.",
        relatedIds: ["outdoor-seating", "feature-tree", "patio-table"],
        requiresProfessionalReview: true,
        provenance: entered,
      },
      ...analysisReviewConstraints(project, observed),
    ],
    createdAt: project.createdAt,
    updatedAt: project.createdAt,
  });
}

function optionScene(base: SpatialScene, id: string, mutate: (scene: SpatialScene) => void): SpatialScene {
  const scene = structuredClone(base);
  scene.id = `${base.id}-${id}`;
  scene.name = id;
  mutate(scene);
  return spatialSceneSchema.parse(scene);
}

export function generateStudioOptions(project: StudioProject): StudioOption[] {
  const base = project.kind === "interior" ? interiorBaseline(project) : exteriorBaseline(project);
  const { widthM: width, depthM: depth } = project.dimensions;

  const definitions = project.kind === "interior" ? [
    {
      id: "clear-passage",
      name: "Clear Passage",
      principle: "Open the longest circulation line",
      rationale: `Uses the ${width.toFixed(1)} × ${depth.toFixed(1)} m entered envelope to keep the central route legible while gathering furniture at the edges.`,
      tradeoffs: ["More open floor area", "Less intimate seating distance", "Existing objects still need field verification"],
      mutate: (scene: SpatialScene) => {
        const sofa = scene.objects.find((object) => object.id === "sofa");
        const table = scene.objects.find((object) => object.id === "table");
        if (sofa) sofa.transform.position = { x: width * 0.27, y: 0, z: depth * 0.18 };
        if (table) table.transform.position = { x: width * 0.68, y: 0, z: depth * 0.58 };
      },
    },
    {
      id: "conversation-island",
      name: "Conversation Island",
      principle: "Pull activity into one social centre",
      rationale: "Brings seating and table into a compact relationship, leaving a quiet perimeter for storage, art, and lighting.",
      tradeoffs: ["Stronger social focus", "Tighter central clearance", "Best after opening locations are confirmed"],
      mutate: (scene: SpatialScene) => {
        const sofa = scene.objects.find((object) => object.id === "sofa");
        const table = scene.objects.find((object) => object.id === "table");
        if (sofa) sofa.transform.position = { x: width * 0.36, y: 0, z: depth * 0.42 };
        if (table) table.transform.position = { x: width * 0.57, y: 0, z: depth * 0.5 };
      },
    },
    {
      id: "gallery-edge",
      name: "Gallery Edge",
      principle: "Keep one flexible wall and one active edge",
      rationale: "Concentrates storage and seating along opposing edges so the room can switch between everyday use and larger gatherings.",
      tradeoffs: ["Most flexible open centre", "Requires deliberate wall composition", "Storage depth needs on-site confirmation"],
      mutate: (scene: SpatialScene) => {
        const storage = scene.objects.find((object) => object.id === "storage");
        const table = scene.objects.find((object) => object.id === "table");
        if (storage) storage.transform.position = { x: width * 0.5, y: 0, z: 0.25 };
        if (table) table.transform.position = { x: width * 0.48, y: 0, z: depth * 0.7 };
        const floor = scene.zones.find((zone) => zone.id === "floor");
        if (floor) floor.materialId = "oak-smoked";
      },
    },
  ] : [
    {
      id: "sheltered-court",
      name: "Sheltered Court",
      principle: "Gather near the protected edge",
      rationale: `Organizes the entered ${width.toFixed(1)} × ${depth.toFixed(1)} m site as a compact outdoor room with a generous open edge.`,
      tradeoffs: ["Clear social centre", "Shade and wind still need observation", "Survey/setback review remains blocking"],
      mutate: (scene: SpatialScene) => {
        const seating = scene.objects.find((object) => object.id === "outdoor-seating");
        const table = scene.objects.find((object) => object.id === "patio-table");
        if (seating) seating.transform.position = { x: width * 0.22, y: 0, z: depth * 0.22 };
        if (table) table.transform.position = { x: width * 0.38, y: 0, z: depth * 0.35 };
      },
    },
    {
      id: "green-frame",
      name: "Green Frame",
      principle: "Use planting to define a quiet centre",
      rationale: "Pulls the feature tree and seating into a planted edge, preserving a central field for flexible use.",
      tradeoffs: ["Strong seasonal character", "Maintenance and climate need review", "Tree position is illustrative until utilities are known"],
      mutate: (scene: SpatialScene) => {
        const tree = scene.objects.find((object) => object.id === "feature-tree");
        const seating = scene.objects.find((object) => object.id === "outdoor-seating");
        if (tree) tree.transform.position = { x: width * 0.78, y: 0, z: depth * 0.52 };
        if (seating) seating.transform.position = { x: width * 0.62, y: 0, z: depth * 0.72 };
      },
    },
    {
      id: "open-gathering",
      name: "Open Gathering",
      principle: "Prioritize one broad, adaptable platform",
      rationale: "Centers the table and keeps larger objects at the perimeter so the site reads as one flexible gathering surface.",
      tradeoffs: ["Most adaptable for groups", "Least sheltered", "Drainage and surface build-up require professional input"],
      mutate: (scene: SpatialScene) => {
        const table = scene.objects.find((object) => object.id === "patio-table");
        const seating = scene.objects.find((object) => object.id === "outdoor-seating");
        if (table) table.transform.position = { x: width * 0.5, y: 0, z: depth * 0.5 };
        if (seating) seating.transform.position = { x: width * 0.18, y: 0, z: depth * 0.72 };
        const yard = scene.zones.find((zone) => zone.id === "yard");
        if (yard) yard.materialId = "stone-permeable-paver";
      },
    },
  ];

  return definitions.map((definition) => studioOptionSchema.parse({
    id: definition.id,
    name: definition.name,
    principle: definition.principle,
    rationale: definition.rationale,
    tradeoffs: definition.tradeoffs,
    scene: optionScene(base, definition.name, definition.mutate),
  }));
}
