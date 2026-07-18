import { describe, expect, it } from "vitest";
import { generateStudioOptions } from "./generator";
import { studioProjectSchema } from "./schema";
import { validateScene } from "@/lib/spatial/validation";

function project(kind: "interior" | "exterior") {
  return studioProjectSchema.parse({
    id: `project-${kind}`,
    name: `${kind} test`,
    kind,
    condition: "existing",
    intent: "Create a flexible place for everyday use and small gatherings.",
    dimensions: { widthM: 6, depthM: 4.5, heightM: 2.8 },
    source: { mode: "guided_measurements", authority: "user_declared" },
    createdAt: "2026-07-18T12:00:00.000Z",
  });
}

describe("instant studio option generation", () => {
  it("creates three materially distinct interior directions from one entered envelope", () => {
    const options = generateStudioOptions(project("interior"));

    expect(options).toHaveLength(3);
    expect(new Set(options.map((option) => option.name)).size).toBe(3);
    expect(options.every((option) => option.scene.kind === "interior")).toBe(true);
    expect(options.every((option) => option.scene.calibration.status === "calibrated")).toBe(true);
    expect(options[0]?.scene.zones[0]?.polygon[1]?.x).toBe(6);
    const tablePositions = options.map((option) => option.scene.objects.find((object) => object.id === "table")?.transform.position);
    expect(new Set(tablePositions.map((position) => JSON.stringify(position))).size).toBe(3);
    expect(options[0]?.scene.zones[0]?.provenance.authority).toBe("user_declared");
    expect(options[0]?.scene.objects[0]?.provenance.authority).toBe("observed_unverified");
    expect(options.every((option) => option.scene.objects.map((object) => object.id).sort().join(",") === "plant,rug,sofa,storage,table")).toBe(true);
    expect(options.every((option) => option.scene.objects.some((object) => object.id === "rug" && object.placementClass === "floor_layer"))).toBe(true);
    expect(new Set(options.map((option) => option.scene.zones.find((zone) => zone.id === "floor")?.materialId)).size).toBeGreaterThan(1);
    expect(new Set(options.map((option) => option.scene.objects.find((object) => object.id === "sofa")?.transform.rotation.y)).size).toBeGreaterThan(1);
  });

  it.each([
    [2, 2, 2.4],
    [5.2, 4, 2.7],
    [7.5, 5.8, 3.1],
  ])("keeps every canonical object inside a %s × %s m entered envelope", (widthM, depthM, heightM) => {
    const sized = studioProjectSchema.parse({ ...project("interior"), dimensions: { widthM, depthM, heightM } });
    const reports = generateStudioOptions(sized).map((option) => validateScene(option.scene));
    expect(reports.flatMap((report) => report.findings.filter((finding) => finding.severity === "blocking"))).toEqual([]);
  });

  it("creates exterior directions while preserving the professional boundary blocker", () => {
    const options = generateStudioOptions(project("exterior"));

    expect(options).toHaveLength(3);
    expect(options.every((option) => option.scene.kind === "exterior")).toBe(true);
    expect(options.every((option) => option.scene.constraints.some((constraint) => constraint.type === "property_boundary" && constraint.severity === "blocking"))).toBe(true);
    expect(options.flatMap((option) => option.tradeoffs).join(" ")).toMatch(/survey|drainage|utilities/i);
  });

  it("turns analyzed openings and retained objects into unverified canonical scene evidence", () => {
    const analyzed = studioProjectSchema.parse({
      ...project("interior"),
      source: {
        mode: "photo_with_measurements",
        fileName: "actual-room.jpg",
        fileSize: 1024,
        authority: "user_declared",
        analysisDisclosure: "Visible cues only.",
        analysisModel: "gemini-test",
        analysis: {
          spaceKind: "interior",
          spaceType: "living room",
          summary: "A living room with a window, fixed banquette, and low storage.",
          confidence: "medium",
          openings: [{ kind: "window", label: "Wide rear window", position: "center", confidence: "high" }],
          retainedObjects: [
            { label: "Fixed banquette", category: "seating", position: "left", confidence: "high", likelyMovable: false },
            { label: "Low media cabinet", category: "storage", position: "right", confidence: "medium", likelyMovable: true },
          ],
          styleCues: [{ label: "warm timber", confidence: "medium" }],
          naturalLight: { level: "high", note: "Daylight is visible through the rear window.", confidence: "high" },
          reviewRisks: ["Window dimensions are unknown."],
          clarificationQuestions: ["Measure the window width and sill height."],
          metricWarning: "No metric dimensions were inferred from the uncalibrated source.",
        },
      },
    });

    const scene = generateStudioOptions(analyzed)[0]?.scene;
    expect(scene?.openings[0]?.label).toBe("Wide rear window");
    expect(scene?.openings[0]?.provenance.authority).toBe("observed_unverified");
    expect(scene?.objects.find((object) => object.id === "sofa")).toMatchObject({ label: "Fixed banquette", protected: true });
    expect(scene?.objects.find((object) => object.id === "storage")).toMatchObject({ label: "Low media cabinet", protected: false });
    expect(scene?.constraints.some((constraint) => constraint.message === "Measure the window width and sill height.")).toBe(true);
  });
});
