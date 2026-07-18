import { describe, expect, it } from "vitest";
import { declareObjectWidthForSession } from "./fact-authority";
import { preparedExteriorScene, preparedInteriorScene } from "./prepared-scenes";
import { evaluateTruthContract } from "./truth-contract";

describe("prepared truth-contract scenes", () => {
  it("requires evidence, then limits the identical move after measurement", () => {
    const action = {
      type: "move_object" as const,
      objectId: "table",
      position: { x: 1.32, y: 0, z: 2 },
    };
    const before = evaluateTruthContract(preparedInteriorScene, action);

    expect(before.decision).toBe("confirmation_required");
    expect(before.checks[0]).toMatchObject({
      code: "authority.evidence_required",
      factAuthority: "observed_unverified",
    });
    expect(before.effectiveAction).toBeUndefined();

    const measuredScene = declareObjectWidthForSession(preparedInteriorScene, "bookcase", {
      width: 1,
      sourceLabel: "Measured by homeowner with tape",
    });
    const after = evaluateTruthContract(measuredScene, action);

    expect(after.decision).toBe("limited");
    expect(measuredScene.objects.find((object) => object.id === "bookcase")?.dimensions.widthProvenance?.authority).toBe("user_declared");
    expect(measuredScene.objects.find((object) => object.id === "bookcase")?.dimensions.provenance.authority).toBe("observed_unverified");
    expect(after.effectiveAction).toMatchObject({
      type: "move_object",
      position: { x: 1.1, y: 0, z: 2 },
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
