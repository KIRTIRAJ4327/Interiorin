import { describe, expect, it } from "vitest";
import { generateStudioOptions } from "@/lib/studio/generator";
import { studioProjectSchema } from "@/lib/studio/schema";
import { validateScene } from "./validation";

const project = studioProjectSchema.parse({
  id: "validation-project",
  name: "Validation room",
  kind: "interior",
  condition: "empty",
  intent: "Create a flexible room for living and gathering.",
  dimensions: { widthM: 5.2, depthM: 4, heightM: 2.7 },
  source: { mode: "guided_measurements", authority: "user_declared" },
  createdAt: "2026-07-18T12:00:00.000Z",
});

describe("canonical scene spatial validation", () => {
  it("detects overlap using full object footprints", () => {
    const scene = structuredClone(generateStudioOptions(project)[0]!.scene);
    const sofa = scene.objects.find((object) => object.id === "sofa")!;
    const table = scene.objects.find((object) => object.id === "table")!;
    table.transform.position = { ...sofa.transform.position };
    const report = validateScene(scene);
    expect(report.status).toBe("blocked");
    expect(report.findings.some((finding) => finding.type === "overlap" && finding.relatedIds.includes("sofa") && finding.relatedIds.includes("table"))).toBe(true);
  });

  it("keeps every generated starting direction free of blocking footprint conflicts", () => {
    const reports = generateStudioOptions(project).map((option) => validateScene(option.scene));
    expect(reports.map((report) => ({ status: report.status, blockers: report.findings.filter((finding) => finding.severity === "blocking").map((finding) => finding.message) }))).toEqual([
      { status: "review", blockers: [] },
      { status: "review", blockers: [] },
      { status: "review", blockers: [] },
    ]);
  });

  it("detects an object whose center is inside but footprint leaves the envelope", () => {
    const scene = structuredClone(generateStudioOptions(project)[0]!.scene);
    const table = scene.objects.find((object) => object.id === "table")!;
    table.transform.position.x = 5.1;
    const report = validateScene(scene);
    expect(report.findings).toContainEqual(expect.objectContaining({ id: "envelope:table", severity: "blocking" }));
  });

  it("returns measured clearance review findings separately from blockers", () => {
    const scene = generateStudioOptions(project)[0]!.scene;
    const report = validateScene(scene);
    const clearance = report.findings.find((finding) => finding.type === "clearance");
    expect(clearance).toEqual(expect.objectContaining({ severity: "review", requiredMeters: 0.9 }));
  });

  it("uses the rotated axis-aligned footprint instead of the unrotated box", () => {
    const scene = structuredClone(generateStudioOptions(project)[0]!.scene);
    const table = scene.objects.find((object) => object.id === "table")!;
    table.dimensions.width = 1.8;
    table.dimensions.depth = 0.9;
    table.transform.position = { x: 3.4, y: 0, z: 0.6 };
    table.transform.rotation.y = Math.PI / 2;
    const report = validateScene(scene);
    expect(report.findings).toContainEqual(expect.objectContaining({ id: "envelope:table", severity: "blocking" }));
  });

  it("allows solid furniture on a floor layer without hiding real solid collisions", () => {
    const scene = structuredClone(generateStudioOptions(project)[0]!.scene);
    const rug = scene.objects.find((object) => object.placementClass === "floor_layer")!;
    const sofa = scene.objects.find((object) => object.id === "sofa")!;
    const table = scene.objects.find((object) => object.id === "table")!;
    expect(rug).toBeDefined();
    rug.transform.position = { ...sofa.transform.position };
    let report = validateScene(scene);
    expect(report.findings.some((finding) => finding.type === "overlap" && finding.relatedIds.includes(rug.id) && finding.relatedIds.includes(sofa.id))).toBe(false);

    table.transform.position = { ...sofa.transform.position };
    report = validateScene(scene);
    expect(report.findings.some((finding) => finding.type === "overlap" && finding.relatedIds.includes("sofa") && finding.relatedIds.includes("table"))).toBe(true);
  });
});
