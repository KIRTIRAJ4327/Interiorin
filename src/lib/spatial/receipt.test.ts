import { describe, expect, it } from "vitest";
import { declareObjectWidthForSession } from "./fact-authority";
import { preparedInteriorScene } from "./prepared-scenes";
import { buildAuthorityProof } from "./proof";
import { buildBasicReceipt } from "./receipt";
import { freezeSceneAction } from "./schema";
import { commitTruthContractOutcome } from "./transaction";
import { evaluateTruthContract } from "./truth-contract";

const action = {
  type: "move_object" as const,
  objectId: "table",
  position: { x: 1.32, y: 0, z: 2 },
};

describe("minimal decision receipt", () => {
  it("records provider, policy, five fact bases, review, proof, and one scene diff", async () => {
    const declared = declareObjectWidthForSession(preparedInteriorScene, "bookcase", {
      width: 1,
      sourceLabel: "Tape measurement in receipt test",
    });
    const selected = freezeSceneAction(action);
    const proof = await buildAuthorityProof(preparedInteriorScene, declared, selected, selected);
    const outcome = evaluateTruthContract(declared, selected);
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
    expect(outcome.requestedAction).toBe(selected);
    expect(committed.receipt.requestedAction).toBe(selected);
    expect(receipt.requestedAction).toBe(selected);
    expect(receipt.factBases.map((fact) => fact.factId)).toEqual([
      "bookcase.center_x_mm",
      "bookcase.width_mm",
      "path.minimum_clearance_mm",
      "table.center_x_mm",
      "table.width_mm",
    ]);
    expect(receipt.factBases.map((fact) => fact.basis)).toEqual([
      "initial_source",
      "authority_event",
      "initial_source",
      "initial_source",
      "initial_source",
    ]);
    expect(receipt).toMatchObject({
      schemaVersion: "interiorin.receipt/2",
      versionId: "prepared-dining-room/session-v1",
      requestedDeltaMm: 400,
      committedDeltaMm: 180,
      relationships: { geometry: "MATCH", transaction: "MATCH", authority: "1 FIELD" },
      sessionAttestation: {
        factId: "bookcase.width_mm",
        statement: "I measured this 100 cm value for this session",
      },
    });
    expect(receipt.policyRef.hash).toMatch(/^sha256:[0-9a-f]{64}$/);
    expect(receipt.beforeCommitGeometryHash).not.toBe(receipt.afterCommitGeometryHash);
  });
});
