import { z } from "zod";
import type { SceneAction, SpatialScene } from "@/lib/spatial/schema";

export const clarifiedProposalSchema = z.discriminatedUnion("status", [
  z.object({
    status: z.literal("resolved"),
    summary: z.string().trim().min(1).max(220),
    operation: z.literal("move_object"),
    targetId: z.string().min(1),
    requestedDeltaCm: z.number().finite().min(-200).max(200),
    axis: z.enum(["x", "z"]),
    constraintIds: z.array(z.string().min(1)).max(8),
  }),
  z.object({
    status: z.literal("needs_clarification"),
    question: z.string().trim().min(1).max(220),
  }),
]);
export type ClarifiedProposal = z.infer<typeof clarifiedProposalSchema>;

export const proposalRequestSchema = z.object({
  request: z.string().trim().min(3).max(500),
});

export type ProposalProviderMode = "gpt-5.6" | "prepared_fallback";

export type ProposalEnvelope = {
  mode: ProposalProviderMode;
  model?: string;
  result: ClarifiedProposal;
  disclosure: string;
};

export function preparedProposalFallback(request: string): ClarifiedProposal {
  const normalized = request.toLowerCase();
  const mentionsTable = normalized.includes("table");
  const mentionsMove = normalized.includes("move") || normalized.includes("shift");
  const mentionsForty = normalized.includes("40") || normalized.includes("forty");

  if (!mentionsTable || !mentionsMove || !mentionsForty) {
    return {
      status: "needs_clarification",
      question: "For the prepared proof, ask to move the dining table 40 cm toward the bookcase.",
    };
  }

  return {
    status: "resolved",
    summary: "Move the dining table 40 cm toward the bookcase while retaining the path and protected object.",
    operation: "move_object",
    targetId: "table",
    requestedDeltaCm: 40,
    axis: "x",
    constraintIds: ["path-clearance", "bookcase-bounds-review"],
  };
}

export function proposalToSceneAction(
  scene: SpatialScene,
  proposal: Extract<ClarifiedProposal, { status: "resolved" }>,
): SceneAction {
  const target = scene.objects.find((object) => object.id === proposal.targetId);
  if (!target) throw new Error(`The proposal targeted an unknown scene object: ${proposal.targetId}`);

  const position = { ...target.transform.position };
  position[proposal.axis] += proposal.requestedDeltaCm / 100;
  return { type: "move_object", objectId: target.id, position };
}

export function proposalContext(scene: SpatialScene) {
  return {
    sceneId: scene.id,
    objects: scene.objects.map((object) => ({
      id: object.id,
      label: object.label,
      protected: object.protected,
    })),
    constraints: scene.constraints.map((constraint) => ({
      id: constraint.id,
      type: constraint.type,
      message: constraint.message,
      relatedIds: constraint.relatedIds,
    })),
    allowedOperations: ["move_object"],
    note: "Clarify intent only. Do not judge authority, geometry, safety, or commit eligibility.",
  };
}
