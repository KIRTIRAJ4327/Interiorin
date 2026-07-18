import { describe, expect, it } from "vitest";
import { preparedInteriorScene } from "@/lib/spatial/prepared-scenes";
import { preparedProposalFallback, proposalEnvelopeSchema, proposalToSceneAction } from "./proposal";
import { freezeSceneAction } from "@/lib/spatial/schema";

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
      position: { x: 1.32, y: 0, z: 2 },
    });
  });

  it("asks for clarification instead of inventing an unsupported action", () => {
    expect(preparedProposalFallback("Make it better")).toEqual({
      status: "needs_clarification",
      question: "For the prepared proof, ask to move the dining table 40 cm toward the bookcase.",
    });
  });

  it("deep-freezes the selected move transaction at the provider boundary", () => {
    const selected = freezeSceneAction({
      type: "move_object",
      objectId: "table",
      position: { x: 1.32, y: 0, z: 0 },
    });

    expect(Object.isFrozen(selected)).toBe(true);
    expect(selected.type === "move_object" && Object.isFrozen(selected.position)).toBe(true);
  });

  it.each([
    { mode: "gpt-5.6-terra", model: "gpt-5.6-terra" },
    { mode: "gpt-5.6-terra", model: "some-other-model", requestId: "response-id" },
    { mode: "gpt-5.6", model: "gpt-5.6-terra", requestId: "response-id" },
  ])("rejects live provider provenance that is incomplete or aliased", (provider) => {
    expect(proposalEnvelopeSchema.safeParse({
      ...provider,
      disclosure: "Typed intent only.",
      result: preparedProposalFallback("Move the table 40 cm."),
    }).success).toBe(false);
  });
});
