import { describe, expect, it } from "vitest";
import { generateStudioOptions } from "./generator";
import { studioProjectSchema } from "./schema";

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
  });

  it("creates exterior directions while preserving the professional boundary blocker", () => {
    const options = generateStudioOptions(project("exterior"));

    expect(options).toHaveLength(3);
    expect(options.every((option) => option.scene.kind === "exterior")).toBe(true);
    expect(options.every((option) => option.scene.constraints.some((constraint) => constraint.type === "property_boundary" && constraint.severity === "blocking"))).toBe(true);
    expect(options.flatMap((option) => option.tradeoffs).join(" ")).toMatch(/survey|drainage|utilities/i);
  });
});
