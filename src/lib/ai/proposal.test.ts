import { describe, expect, it } from "vitest";
import { preparedInteriorScene } from "@/lib/spatial/prepared-scenes";
import { preparedProposalFallback, proposalToSceneAction } from "./proposal";

describe("typed proposal boundary", () => {
  it("turns the prepared request into the exact 40 cm scene action", () => {
    const proposal = preparedProposalFallback(
      "Move the dining table 40 cm toward the bookcase and preserve the path.",
    );
    expect(proposal.status).toBe("resolved");
    if (proposal.status !== "resolved") throw new Error("Expected resolved proposal");

    expect(proposalToSceneAction(preparedInteriorScene, proposal)).toEqual({
      type: "move_object",
      objectId: "table",
      position: { x: 1.32, y: 0, z: 0 },
    });
  });

  it("asks for clarification instead of inventing an unsupported action", () => {
    expect(preparedProposalFallback("Make it better")).toEqual({
      status: "needs_clarification",
      question: "For the prepared proof, ask to move the dining table 40 cm toward the bookcase.",
    });
  });
});
