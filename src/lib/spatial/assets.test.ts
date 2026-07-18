import { describe, expect, it } from "vitest";
import { proceduralAssetFamily } from "./assets";
import { sceneObjectSchema } from "./schema";

describe("procedural asset dispatch", () => {
  it.each([
    ["sofa-linen-compact", "seating", "solid", "sofa"],
    ["table-oak-round-compact", "table", "solid", "table"],
    ["storage-bookcloth-tall", "storage", "solid", "storage"],
    ["rug-wool-flatweave", "decor", "floor_layer", "rug"],
    ["plant-ceramic-upright", "plant", "solid", "plant"],
    ["unknown-network-free-box", "appliance", "solid", "fallback"],
  ] as const)("maps %s to %s procedural rendering", (assetId, category, placementClass, expected) => {
    expect(proceduralAssetFamily({ assetId, category, placementClass })).toBe(expected);
  });

  it("defaults legacy objects to solid placement", () => {
    const provenance = { evidence: "generated" as const, confidence: "medium" as const, authority: "generated" as const, sourceLabel: "Test" };
    const parsed = sceneObjectSchema.parse({
      id: "legacy", label: "Legacy box", category: "decor", assetId: "legacy-box",
      transform: { position: { x: 0, y: 0, z: 0 }, rotation: { x: 0, y: 0, z: 0 }, scale: { x: 1, y: 1, z: 1 } },
      dimensions: { width: 1, height: 1, depth: 1, provenance }, materialIds: [], protected: false, provenance,
    });
    expect(parsed.placementClass).toBe("solid");
  });
});
