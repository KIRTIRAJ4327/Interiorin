import { describe, expect, it } from "vitest";
import { productFeatures } from "./features";

describe("productFeatures", () => {
  it("keeps the paired surface on while deadline cuts stay off by default", () => {
    expect(productFeatures.pairedExperience).toBe(true);
    expect(productFeatures.conceptRender).toBe(false);
    expect(productFeatures.phone3dPreview).toBe(false);
  });
});

