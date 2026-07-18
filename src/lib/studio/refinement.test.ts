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
});
