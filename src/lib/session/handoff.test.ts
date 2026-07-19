import { describe, expect, it } from "vitest";
import { buildArchitectReviewPayload } from "@/components/paired/wall-session";
import { applyStudioCommand } from "./reducer";
import type { StudioCommand } from "./schema";

const sessionId = "11111111-1111-4111-8111-111111111111";
const at = "2026-07-18T20:00:00.000Z";
const base = () => ({ idempotencyKey: crypto.randomUUID(), expectedRevision: 0, clientTimestamp: at });

describe("architect concept review payload", () => {
  it("keeps the selected canonical scene, schedules, validation, alternatives, and honest boundary in parity", () => {
    const source = { ...base(), type: "submit_source", sourceObjectPath: "local/source.jpg", fileName: "source.jpg", mimeType: "image/jpeg", byteSize: 1000, pixelWidth: 1200, pixelHeight: 800, dimensions: { widthM: 5.2, depthM: 4, heightM: 2.7 } } satisfies StudioCommand;
    let state = applyStudioCommand({}, source, sessionId);
    state = applyStudioCommand(state, { ...base(), type: "submit_brief", answers: { purpose: "Family conversation and reading", feeling: "Warm and calm", mustKeep: "Existing sofa", improveOrAvoid: "Improve circulation" } }, sessionId);
    state = applyStudioCommand(state, { ...base(), type: "generate_options" }, sessionId);
    state = applyStudioCommand(state, { ...base(), type: "select_option", optionId: state.options[0]!.id }, sessionId);
    const selectedId = crypto.randomUUID();
    state = applyStudioCommand(state, { ...base(), idempotencyKey: selectedId, type: "save_version", name: "Architect direction" }, sessionId);
    state = applyStudioCommand(state, { ...base(), type: "save_version", name: "Alternative" }, sessionId);
    state = applyStudioCommand(state, { ...base(), type: "select_review_version", versionId: selectedId }, sessionId);
    const version = state.versions.find((candidate) => candidate.id === state.selectedReviewVersionId)!;
    const payload = buildArchitectReviewPayload(sessionId, state, version);

    expect(payload.packageType).toBe("architect_concept_review");
    expect(payload.selectedVersion.id).toBe(selectedId);
    expect(payload.objectSchedule.map((item) => item.id)).toEqual(version.scene.objects.map((object) => object.id));
    expect(payload.surfaceSchedule.filter((item) => "materialId" in item)).toHaveLength(version.scene.zones.length);
    expect(payload.alternatives).toHaveLength(1);
    expect(payload.validation.status).toMatch(/clear|review|blocked/);
    expect(payload.unresolvedChecks.join(" ")).toContain("Field-verify");
    expect(payload.disclosure).toContain("not construction documentation");
  });
});
