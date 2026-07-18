import { describe, expect, it } from "vitest";
import { declareObjectDimensionsForSession } from "./fact-authority";
import { preparedInteriorScene } from "./prepared-scenes";
import { buildAuthorityProof } from "./proof";
import { buildBasicReceipt } from "./receipt";
import { commitTruthContractOutcome } from "./transaction";
import { evaluateTruthContract } from "./truth-contract";

const action = {
  type: "move_object" as const,
  objectId: "table",
  position: { x: 1.32, y: 0, z: 0 },
};

describe("minimal decision receipt", () => {
  it("records provider, policy, five fact bases, review, proof, and one scene diff", async () => {
    const declared = declareObjectDimensionsForSession(preparedInteriorScene, "bookcase", {
      width: 1,
      height: 2,
      depth: 0.4,
      sourceLabel: "Tape measurement in receipt test",
    });
    const proof = await buildAuthorityProof(preparedInteriorScene, declared, action, action);
    const outcome = evaluateTruthContract(declared, action);
    const committed = commitTruthContractOutcome(declared, outcome, {
      id: () => "transaction-receipt",
      now: () => new Date("2026-07-18T12:00:00.000Z"),
    });
    const receipt = await buildBasicReceipt(
      declared,
      committed.scene,
      outcome,
      proof,
      {
        mode: "prepared_fallback",
        disclosure: "Offline deterministic parser; no model call.",
      },
      {
        id: () => "decision-receipt",
        now: () => new Date("2026-07-18T12:00:00.000Z"),
      },
    );

    expect(receipt).toMatchObject({
      id: "decision-receipt",
      decision: "limited",
      provider: { mode: "prepared_fallback" },
      policyRef: { version: "1.0.0", status: "demo_authored_unendorsed" },
      professionalReview: { required: true, status: "unreviewed" },
      sceneDiff: [{ entityId: "table", field: "position.x_mm", before: 920, after: 1100 }],
    });
    expect(receipt.factBases).toHaveLength(5);
    expect(receipt.policyRef.hash).toMatch(/^sha256:[0-9a-f]{64}$/);
    expect(receipt.beforeCommitGeometryHash).not.toBe(receipt.afterCommitGeometryHash);
  });
});
