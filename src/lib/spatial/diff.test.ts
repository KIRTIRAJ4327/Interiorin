import { describe, expect, it } from "vitest";
import { compareScenes } from "./diff";
import type { SpatialScene } from "./schema";

const provenance = {
  evidence: "prepared_demo" as const,
  confidence: "high" as const,
  sourceLabel: "Prepared test scene",
};

function scene(): SpatialScene {
  return {
    schemaVersion: "1.0",
    id: "scene",
    name: "Living room",
    kind: "interior",
    sourceKind: "prepared_demo",
    calibration: { status: "approximate", message: "Add a measurement." },
    zones: [
      {
        id: "floor",
        label: "Floor",
        kind: "floor",
        polygon: [
          { x: -2, y: 0, z: -2 },
          { x: 2, y: 0, z: -2 },
          { x: 2, y: 0, z: 2 },
        ],
        materialId: "oak-light",
        protected: false,
        provenance,
      },
    ],
    openings: [],
    objects: [
      {
        id: "table",
        label: "Dining table",
        category: "table",
        assetId: "table-round",
        transform: {
          position: { x: 0, y: 0, z: 0 },
          rotation: { x: 0, y: 0, z: 0 },
          scale: { x: 1, y: 1, z: 1 },
        },
        dimensions: { width: 1.2, height: 0.75, depth: 1.2, provenance },
        materialIds: ["oak-light"],
        protected: false,
        provenance,
      },
    ],
    constraints: [],
    createdAt: "2026-07-18T00:00:00.000Z",
    updatedAt: "2026-07-18T00:00:00.000Z",
  };
}

describe("semantic scene comparison", () => {
  it("reports factual movement, replacement, and material deltas", () => {
    const before = scene();
    const after = structuredClone(before);
    after.objects[0]!.transform.position.x = 1;
    after.objects[0]!.assetId = "table-oval";
    after.zones[0]!.materialId = "walnut";

    const diff = compareScenes(before, after);

    expect(diff.movedObjects).toHaveLength(1);
    expect(diff.movedObjects[0]?.after.x).toBe(1);
    expect(diff.replacedObjects[0]).toMatchObject({
      before: "table-round",
      after: "table-oval",
    });
    expect(diff.materialChanges[0]).toMatchObject({
      before: "oak-light",
      after: "walnut",
    });
  });
});
