import { describe, expect, it } from "vitest";
import { declareObjectDimensionsForSession } from "./fact-authority";
import { preparedInteriorScene } from "./prepared-scenes";
import { buildAuthorityProof } from "./proof";

const action = {
  type: "move_object" as const,
  objectId: "table",
  position: { x: 1.32, y: 0, z: 0 },
};

describe("A/B authority proof", () => {
  it("proves geometry and transaction equality with one authority-only diff", async () => {
    const passB = declareObjectDimensionsForSession(preparedInteriorScene, "bookcase", {
      width: 1,
      height: 2,
      depth: 0.4,
      sourceLabel: "Tape measurement in proof test",
    });
    const proof = await buildAuthorityProof(preparedInteriorScene, passB, action, action);

    expect(proof.valid).toBe(true);
    expect(proof.geometry.equal).toBe(true);
    expect(proof.transaction.equal).toBe(true);
    expect(proof.authority.equal).toBe(false);
    expect(proof.authority.diff).toEqual([
      {
        factId: "bookcase.dimensions",
        field: "authority",
        before: "observed_unverified",
        after: "user_declared",
      },
    ]);
    expect(proof.geometry.before.hash).toMatch(/^sha256:[0-9a-f]{64}$/);
  });

  it("fails closed when a measurement changes geometry", async () => {
    const corrected = declareObjectDimensionsForSession(preparedInteriorScene, "bookcase", {
      width: 1.1,
      height: 2,
      depth: 0.4,
      sourceLabel: "Different measurement in proof test",
    });
    const proof = await buildAuthorityProof(preparedInteriorScene, corrected, action, action);

    expect(proof.valid).toBe(false);
    expect(proof.geometry.equal).toBe(false);
    expect(proof.failureReason).toMatch(/proof invalid/i);
  });
});
