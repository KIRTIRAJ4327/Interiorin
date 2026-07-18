import { describe, expect, it } from "vitest";
import type { SpatialScene } from "./schema";
import { evaluateTruthContract } from "./truth-contract";

const observed = {
  evidence: "observed" as const,
  confidence: "high" as const,
  sourceLabel: "Visible in supplied room photograph",
};
const entered = {
  evidence: "user_entered" as const,
  confidence: "high" as const,
  sourceLabel: "Entered by homeowner",
};

function room(): SpatialScene {
  return {
    schemaVersion: "1.0",
    id: "room",
    name: "Living room",
    kind: "interior",
    sourceKind: "photo",
    calibration: {
      status: "calibrated",
      anchorLabel: "North wall",
      realLengthMeters: 6,
      modelLengthMeters: 6,
    },
    zones: [
      {
        id: "floor",
        label: "Floor",
        kind: "floor",
        polygon: [
          { x: -3, y: 0, z: -2 },
          { x: 3, y: 0, z: -2 },
          { x: 3, y: 0, z: 2 },
          { x: -3, y: 0, z: 2 },
        ],
        materialId: "oak",
        protected: false,
        provenance: entered,
      },
    ],
    openings: [],
    objects: [
      {
        id: "table",
        label: "Dining table",
        category: "table",
        assetId: "table",
        transform: {
          position: { x: 0, y: 0, z: 0 },
          rotation: { x: 0, y: 0, z: 0 },
          scale: { x: 1, y: 1, z: 1 },
        },
        dimensions: { width: 1.4, height: 0.75, depth: 0.9, provenance: entered },
        materialIds: ["oak"],
        protected: false,
        provenance: observed,
      },
      {
        id: "bookcase",
        label: "Heirloom bookcase",
        category: "storage",
        assetId: "bookcase",
        transform: {
          position: { x: 2, y: 0, z: 0 },
          rotation: { x: 0, y: 0, z: 0 },
          scale: { x: 1, y: 1, z: 1 },
        },
        dimensions: { width: 1, height: 2, depth: 0.4, provenance: observed },
        materialIds: ["walnut"],
        protected: true,
        provenance: observed,
      },
    ],
    constraints: [
      {
        id: "path-clearance",
        type: "clearance",
        severity: "blocking",
        message: "Keep the entered 0.9 m access path beside the observed bookcase.",
        relatedIds: ["table", "bookcase"],
        thresholdMeters: 0.9,
        requiresProfessionalReview: false,
        provenance: entered,
      },
      {
        id: "electrical-review",
        type: "utility",
        severity: "review",
        message: "Verify the outlet location before final placement.",
        relatedIds: ["bookcase"],
        requiresProfessionalReview: true,
        provenance: observed,
      },
    ],
    createdAt: "2026-07-18T00:00:00.000Z",
    updatedAt: "2026-07-18T00:00:00.000Z",
  };
}

describe("truth contract", () => {
  it("limits an adversarial move to the maximum valid clearance", () => {
    const outcome = evaluateTruthContract(room(), {
      type: "move_object",
      objectId: "table",
      position: { x: 1.8, y: 0, z: 0 },
    });

    expect(outcome.decision).toBe("limited");
    expect(outcome.effectiveAction).toMatchObject({
      type: "move_object",
      position: { x: 1.1, y: 0, z: 0 },
    });
    expect(outcome.checks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: "clearance.maximum_valid",
          factEvidence: "user_entered",
        }),
      ]),
    );
    expect(outcome.verificationQueueCount).toBe(1);
  });

  it("refuses direct changes to an observed protected object", () => {
    const outcome = evaluateTruthContract(room(), {
      type: "replace_object",
      objectId: "bookcase",
      assetId: "new-bookcase",
    });

    expect(outcome.decision).toBe("refused");
    expect(outcome.checks[0]).toMatchObject({
      code: "target.protected",
      factEvidence: "observed",
      factConfidence: "high",
    });
  });
});
