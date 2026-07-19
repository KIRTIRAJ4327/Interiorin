import { describe, expect, it } from "vitest";
import { productFeatures } from "./features";

describe("productFeatures", () => {
  it("keeps the paired hero on while legacy deadline experiments stay off", () => {
    expect(productFeatures.pairedExperience).toBe(true);
    expect(productFeatures.conceptRender).toBe(false);
    expect(productFeatures.phone3dPreview).toBe(false);
    expect(productFeatures.voiceGuide).toBe(true);
    expect(productFeatures.visualReveal).toBe(true);
  });
});
