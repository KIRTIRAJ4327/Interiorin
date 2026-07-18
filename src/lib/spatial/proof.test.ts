import { describe, expect, it } from "vitest";
import { declareObjectWidthForSession } from "./fact-authority";
import { preparedInteriorScene } from "./prepared-scenes";
import { authorityProjection, buildAuthorityProof, canonicalBytes } from "./proof";

const action = {
  type: "move_object" as const,
  objectId: "table",
  position: { x: 1.32, y: 0, z: 0 },
};

describe("A/B authority proof", () => {
  it("enumerates exactly the five numeric facts consumed by the solver", () => {
    expect(authorityProjection(preparedInteriorScene).map((fact) => fact.factId)).toEqual([
      "table.center_x_mm",
      "table.width_mm",
      "bookcase.center_x_mm",
      "bookcase.width_mm",
      "path.minimum_clearance_mm",
    ]);
  });

  it("proves geometry and transaction equality with one authority-only diff", async () => {
    const passB = declareObjectWidthForSession(preparedInteriorScene, "bookcase", {
      width: 1,
      sourceLabel: "Tape measurement in proof test",
    });
    const proof = await buildAuthorityProof(preparedInteriorScene, passB, action, action);

    expect(proof.valid).toBe(true);
    expect(proof.geometry.equal).toBe(true);
    expect(proof.transaction.equal).toBe(true);
    expect(proof.authority.equal).toBe(false);
    expect(proof.authority.diff).toEqual([
      {
        factId: "bookcase.width_mm",
        field: "authority",
        before: "observed_unverified",
        after: "user_declared",
      },
    ]);
    expect(proof.geometry.before.hash).toMatch(/^sha256:[0-9a-f]{64}$/);

    const beforeBookcase = preparedInteriorScene.objects.find((object) => object.id === "bookcase");
    const afterBookcase = passB.objects.find((object) => object.id === "bookcase");
    const untouchedBefore = {
      height: beforeBookcase?.dimensions.height,
      depth: beforeBookcase?.dimensions.depth,
      provenance: beforeBookcase?.dimensions.provenance,
    };
    const untouchedAfter = {
      height: afterBookcase?.dimensions.height,
      depth: afterBookcase?.dimensions.depth,
      provenance: afterBookcase?.dimensions.provenance,
    };
    expect(Array.from(canonicalBytes(untouchedAfter))).toEqual(Array.from(canonicalBytes(untouchedBefore)));
  });

  it.each([0.999, 1.001, 1.1])("fails closed when width changes to %s m", async (width) => {
    const corrected = declareObjectWidthForSession(preparedInteriorScene, "bookcase", {
      width,
      sourceLabel: "Different measurement in proof test",
    });
    const proof = await buildAuthorityProof(preparedInteriorScene, corrected, action, action);

    expect(proof.valid).toBe(false);
    expect(proof.geometry.equal).toBe(false);
    expect(proof.failureReason).toMatch(/proof invalid/i);
  });

  it("fails closed when pass B receives a different transaction", async () => {
    const passB = declareObjectWidthForSession(preparedInteriorScene, "bookcase", {
      width: 1,
      sourceLabel: "Tape measurement in proof test",
    });
    const differentAction = { ...action, position: { x: 1.31, y: 0, z: 0 } };
    const proof = await buildAuthorityProof(preparedInteriorScene, passB, action, differentAction);

    expect(proof.valid).toBe(false);
    expect(proof.transaction.equal).toBe(false);
  });
});
