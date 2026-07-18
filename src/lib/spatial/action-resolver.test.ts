import { describe, expect, it } from "vitest";
import { resolveSceneAction } from "./action-resolver";
import type { SpatialScene } from "./schema";

const provenance = {
  evidence: "prepared_demo" as const,
  confidence: "high" as const,
  authority: "verified" as const,
  sourceLabel: "Prepared test scene",
};

const scene: SpatialScene = {
  schemaVersion: "1.0",
  id: "scene-1",
  name: "Test room",
  kind: "interior",
  sourceKind: "prepared_demo",
  calibration: { status: "approximate", message: "Add one known measurement." },
  zones: [
    {
      id: "floor",
      label: "Living room floor",
      kind: "floor",
      polygon: [
        { x: -3, y: 0, z: -2 },
        { x: 3, y: 0, z: -2 },
        { x: 3, y: 0, z: 2 },
        { x: -3, y: 0, z: 2 },
      ],
      materialId: "oak",
      protected: false,
      provenance,
    },
  ],
  openings: [],
  objects: [
    {
      id: "chair",
      label: "Reading chair",
      category: "seating",
      assetId: "chair-demo",
      transform: {
        position: { x: 0, y: 0, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
        scale: { x: 1, y: 1, z: 1 },
      },
      dimensions: { width: 0.8, height: 0.9, depth: 0.8, provenance },
      materialIds: ["linen"],
      protected: false,
      provenance,
    },
    {
      id: "heirloom",
      label: "Heirloom cabinet",
      category: "storage",
      assetId: "cabinet-demo",
      transform: {
        position: { x: 2, y: 0, z: 1 },
        rotation: { x: 0, y: 0, z: 0 },
        scale: { x: 1, y: 1, z: 1 },
      },
      dimensions: { width: 1, height: 1.8, depth: 0.45, provenance },
      materialIds: ["walnut"],
      protected: true,
      provenance,
    },
  ],
  constraints: [],
  createdAt: "2026-07-18T00:00:00.000Z",
  updatedAt: "2026-07-18T00:00:00.000Z",
};

const context = {
  id: () => "receipt-1",
  now: () => new Date("2026-07-18T00:00:00.000Z"),
};

describe("bounded scene action resolver", () => {
  it("accepts a move inside the known envelope and discloses approximate fit", () => {
    const receipt = resolveSceneAction(
      scene,
      { type: "move_object", objectId: "chair", position: { x: 1, y: 0, z: 1 } },
      context,
    );

    expect(receipt.status).toBe("accepted");
    expect(receipt.changedIds).toEqual(["chair"]);
    expect(receipt.warnings[0]).toMatch(/approximate/i);
  });

  it("rejects edits to protected objects", () => {
    const receipt = resolveSceneAction(
      scene,
      { type: "replace_object", objectId: "heirloom", assetId: "new-cabinet" },
      context,
    );

    expect(receipt.status).toBe("rejected");
    expect(receipt.message).toMatch(/protected/i);
  });

  it("rejects a move outside the known space", () => {
    const receipt = resolveSceneAction(
      scene,
      { type: "move_object", objectId: "chair", position: { x: 20, y: 0, z: 20 } },
      context,
    );

    expect(receipt.status).toBe("rejected");
    expect(receipt.message).toMatch(/outside the known space/i);
  });
});
