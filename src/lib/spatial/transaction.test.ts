import { describe, expect, it } from "vitest";
import { declareObjectWidthForSession } from "./fact-authority";
import { preparedInteriorScene } from "./prepared-scenes";
import { commitTruthContractOutcome } from "./transaction";
import { evaluateTruthContract } from "./truth-contract";

const move = {
  type: "move_object" as const,
  objectId: "table",
  position: { x: 1.32, y: 0, z: 2 },
};

describe("truth-contract commit", () => {
  it("does not commit an outcome that still requires evidence", () => {
    const outcome = evaluateTruthContract(preparedInteriorScene, move);

    expect(() => commitTruthContractOutcome(preparedInteriorScene, outcome)).toThrow(
      "Cannot commit a confirmation_required",
    );
    expect(preparedInteriorScene.objects.find((object) => object.id === "table")?.transform.position.x).toBe(0.92);
  });

  it("commits only the checked limited alternative and records both actions", () => {
    const scene = declareObjectWidthForSession(preparedInteriorScene, "bookcase", {
      width: 1,
      sourceLabel: "Measured in transaction test",
    });
    const outcome = evaluateTruthContract(scene, move);
    const committed = commitTruthContractOutcome(scene, outcome, {
      id: () => "receipt-1",
      now: () => new Date("2026-07-18T12:00:00.000Z"),
    });

    expect(committed.scene.objects.find((object) => object.id === "table")?.transform.position.x).toBe(1.1);
    expect(committed.receipt).toMatchObject({
      id: "receipt-1",
      decision: "limited",
      requestedAction: { position: { x: 1.32 } },
      committedAction: { position: { x: 1.1 } },
      professionalReviewFlagIds: ["bookcase-bounds-review"],
    });
  });
});
