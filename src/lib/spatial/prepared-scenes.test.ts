import { describe, expect, it } from "vitest";
import { preparedExteriorScene, preparedInteriorScene } from "./prepared-scenes";
import { evaluateTruthContract } from "./truth-contract";

describe("prepared truth-contract scenes", () => {
  it("limits the interior adversarial move before canonical state changes", () => {
    const outcome = evaluateTruthContract(preparedInteriorScene, {
      type: "move_object",
      objectId: "table",
      position: { x: 1.8, y: 0, z: 0 },
    });

    expect(outcome.decision).toBe("limited");
    expect(outcome.effectiveAction).toMatchObject({
      type: "move_object",
      position: { x: 1.1, y: 0, z: 0 },
    });
  });

  it("refuses the exterior replay while the property boundary is unknown", () => {
    const outcome = evaluateTruthContract(preparedExteriorScene, {
      type: "move_object",
      objectId: "planter",
      position: { x: 1.5, y: 0, z: 0 },
    });

    expect(outcome.decision).toBe("refused");
    expect(outcome.checks[0]?.code).toBe("property_boundary.unknown");
    expect(outcome.effectiveAction).toBeUndefined();
  });
});
