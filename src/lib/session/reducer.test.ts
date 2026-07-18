import { describe, expect, it } from "vitest";
import { applyStudioCommand } from "./reducer";
import type { StudioCommand } from "./schema";

const common = { idempotencyKey: crypto.randomUUID(), expectedRevision: 0, clientTimestamp: "2026-07-18T12:00:00.000Z" };

describe("paired canonical reducer", () => {
  it("turns declared room input and a confirmed brief into three canonical options", () => {
    const source = { ...common, type: "submit_source", sourceObjectPath: "local/source.jpg", fileName: "source.jpg", mimeType: "image/jpeg", byteSize: 1000, pixelWidth: 1200, pixelHeight: 800, dimensions: { widthM: 5.2, depthM: 4, heightM: 2.7 } } satisfies StudioCommand;
    let state = applyStudioCommand({}, source, crypto.randomUUID());
    state = applyStudioCommand(state, { ...common, type: "submit_brief", answers: { purpose: "Family conversation and reading", feeling: "Warm, calm, and tactile", mustKeep: "The existing sofa", improveOrAvoid: "Improve circulation and avoid clutter" } }, crypto.randomUUID());
    state = applyStudioCommand(state, { ...common, type: "generate_options" }, crypto.randomUUID());
    expect(state.options).toHaveLength(3);
    expect(state.options.every((option) => option.scene.zones[0]?.polygon[1]?.x === 5.2)).toBe(true);
    expect(state.stage).toBe("options");
  });
});
