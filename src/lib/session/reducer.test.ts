import { describe, expect, it } from "vitest";
import { applyStudioCommand } from "./reducer";
import type { StudioCommand } from "./schema";
import { parseStudioRefinement } from "@/lib/studio/refinement";

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

    state = applyStudioCommand(state, { ...common, type: "select_option", optionId: state.options[0]!.id }, crypto.randomUUID());
    const before = state.options[0]!.scene.objects.find((object) => object.id === "table")!.transform.position.x;
    const parsed = parseStudioRefinement(state.options[0]!.scene, "Move the table right 30 cm");
    expect(parsed.status).toBe("ready");
    if (parsed.status !== "ready") return;
    const proposalId = crypto.randomUUID();
    state = applyStudioCommand(state, { ...common, idempotencyKey: proposalId, type: "request_refinement", transcript: "Move the table right 30 cm", interpretation: { mode: "local_parser", action: parsed.action, summary: parsed.summary, disclosure: "Local parser.", latencyMs: 0 } }, crypto.randomUUID());
    expect(state.proposals.at(-1)?.status).toBe("awaiting_approval");
    expect(state.options[0]!.scene.objects.find((object) => object.id === "table")!.transform.position.x).toBe(before);
    state = applyStudioCommand(state, { ...common, type: "confirm_proposal", proposalId }, crypto.randomUUID());
    expect(state.proposals.at(-1)?.status).toBe("committed");
    expect(state.options[0]!.scene.objects.find((object) => object.id === "table")!.transform.position.x).toBeCloseTo(before + 0.3);
  });
});
