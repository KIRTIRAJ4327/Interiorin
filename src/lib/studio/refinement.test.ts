import { describe, expect, it } from "vitest";
import { generateStudioOptions } from "./generator";
import { applyStudioRefinement, parseStudioRefinement } from "./refinement";
import { studioProjectSchema } from "./schema";

const project = studioProjectSchema.parse({
  id: "refine-project",
  name: "Refinement test",
  kind: "interior",
  condition: "existing",
  intent: "Create a calm flexible place for everyday use.",
  dimensions: { widthM: 5.2, depthM: 4, heightM: 2.7 },
  source: { mode: "guided_measurements", authority: "user_declared" },
  createdAt: "2026-07-18T12:00:00.000Z",
});

describe("bounded studio refinement", () => {
  it("compiles a relative command and mutates only after explicit application", () => {
    const scene = generateStudioOptions(project)[0]!.scene;
    const before = scene.objects.find((object) => object.id === "table")!.transform.position.x;
    const parsed = parseStudioRefinement(scene, "Move the table right 30 cm");

    expect(parsed.status).toBe("ready");
    expect(scene.objects.find((object) => object.id === "table")!.transform.position.x).toBe(before);
    if (parsed.status !== "ready") throw new Error("Expected a ready action.");
    const result = applyStudioRefinement(scene, parsed);
    expect(result.receipt.status).toBe("accepted");
    expect(result.scene.objects.find((object) => object.id === "table")!.transform.position.x).toBeCloseTo(before + 0.3);
    expect(scene.objects.find((object) => object.id === "table")!.transform.position.x).toBe(before);
  });

  it("rejects movement of an existing protected object and asks for incomplete details", () => {
    const scene = generateStudioOptions(project)[0]!.scene;
    const parsed = parseStudioRefinement(scene, "Move the sofa left 20 cm");
    if (parsed.status !== "ready") throw new Error("Expected a ready action.");
    const result = applyStudioRefinement(scene, parsed);
    expect(result.receipt.status).toBe("rejected");
    expect(result.receipt.message).toMatch(/protected/i);

    expect(parseStudioRefinement(scene, "Move the table")).toEqual({
      status: "needs_clarification",
      question: "Add a direction and distance, for example: Move Central table right 30 cm.",
    });
  });

  it("changes a known surface material through the same checked boundary", () => {
    const scene = generateStudioOptions({ ...project, condition: "empty" })[0]!.scene;
    const parsed = parseStudioRefinement(scene, "Change the floor to limestone");
    if (parsed.status !== "ready") throw new Error("Expected a ready action.");
    const result = applyStudioRefinement(scene, parsed);
    expect(result.receipt.status).toBe("accepted");
    expect(result.scene.zones.find((zone) => zone.id === "floor")?.materialId).toBe("limestone");
  });

  it("compiles protection, lighting, and undo commands through typed actions", () => {
    const scene = generateStudioOptions({ ...project, condition: "empty" })[0]!.scene;
    expect(parseStudioRefinement(scene, "Lock the sofa")).toEqual(expect.objectContaining({
      status: "ready",
      action: { type: "protect_object", objectId: "sofa", protected: true },
    }));

    const lighting = parseStudioRefinement(scene, "Make the room warm and bright");
    expect(lighting).toEqual(expect.objectContaining({
      status: "ready",
      action: { type: "set_environment", warmth: "warm", intensity: "bright" },
    }));
    if (lighting.status !== "ready") throw new Error("Expected a ready lighting action.");
    const result = applyStudioRefinement(scene, lighting);
    expect(result.scene.environment).toEqual({ warmth: "warm", intensity: "bright" });

    expect(parseStudioRefinement(scene, "Undo that")).toEqual(expect.objectContaining({
      status: "ready",
      action: { type: "undo" },
    }));
  });

  it("replaces an object only with a bounded, footprint-checked variant", () => {
    const scene = generateStudioOptions({ ...project, condition: "empty" })[0]!.scene;
    const compact = parseStudioRefinement(scene, "Replace the sofa with a compact two-seat sofa");
    expect(compact).toEqual(expect.objectContaining({ status: "ready", action: expect.objectContaining({ type: "replace_object", assetId: "sofa-linen-compact" }) }));
    if (compact.status !== "ready") throw new Error("Expected a ready replacement.");
    const compactResult = applyStudioRefinement(scene, compact);
    expect(compactResult.receipt.status).toBe("accepted");
    expect(compactResult.scene.objects.find((object) => object.id === "sofa")?.dimensions.width).toBe(1.75);

    const sectional = parseStudioRefinement(scene, "Replace the sofa with a large sectional sofa");
    if (sectional.status !== "ready") throw new Error("Expected a ready replacement.");
    const sectionalResult = applyStudioRefinement(scene, sectional);
    expect(sectionalResult.receipt.status).toBe("rejected");
    expect(sectionalResult.receipt.message).toMatch(/outside the entered space envelope/i);
  });

  it("compiles relative rotation and mutates the canonical angle only after commit", () => {
    const scene = generateStudioOptions({ ...project, condition: "empty" })[0]!.scene;
    const parsed = parseStudioRefinement(scene, "Rotate the table left 15 degrees");
    expect(parsed).toEqual(expect.objectContaining({ status: "ready", action: expect.objectContaining({ type: "rotate_object", objectId: "table" }) }));
    if (parsed.status !== "ready") throw new Error("Expected a ready rotation.");
    expect(scene.objects.find((object) => object.id === "table")?.transform.rotation.y).toBe(0);
    const result = applyStudioRefinement(scene, parsed);
    expect(result.receipt.status).toBe("accepted");
    expect(result.scene.objects.find((object) => object.id === "table")?.transform.rotation.y).toBeCloseTo(Math.PI / 12);
  });
});
