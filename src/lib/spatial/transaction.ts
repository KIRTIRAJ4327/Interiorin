import type { SceneAction, SpatialScene } from "./schema";
import type { TruthContractCheck, TruthContractOutcome } from "./truth-contract";

export type SpatialCommitReceipt = {
  id: string;
  sceneId: string;
  decision: "accepted" | "limited";
  requestedAction: SceneAction;
  committedAction: SceneAction;
  checks: TruthContractCheck[];
  professionalReviewFlagIds: string[];
  createdAt: string;
};

type CommitContext = {
  now?: () => Date;
  id?: () => string;
};

function applyCommittedAction(scene: SpatialScene, action: SceneAction): SpatialScene {
  if (action.type !== "move_object") {
    throw new Error(`The submission transaction path cannot commit ${action.type}.`);
  }

  const targetExists = scene.objects.some((object) => object.id === action.objectId);
  if (!targetExists) throw new Error(`Cannot commit a move for unknown object: ${action.objectId}`);

  return {
    ...scene,
    objects: scene.objects.map((object) =>
      object.id === action.objectId
        ? {
            ...object,
            transform: { ...object.transform, position: action.position },
          }
        : object,
    ),
  };
}

export function commitTruthContractOutcome(
  scene: SpatialScene,
  outcome: TruthContractOutcome,
  context: CommitContext = {},
): { scene: SpatialScene; receipt: SpatialCommitReceipt } {
  if (
    !outcome.effectiveAction ||
    (outcome.decision !== "accepted" && outcome.decision !== "limited")
  ) {
    throw new Error(`Cannot commit a ${outcome.decision} truth-contract outcome.`);
  }

  const now = context.now?.() ?? new Date();
  const committedScene = {
    ...applyCommittedAction(scene, outcome.effectiveAction),
    updatedAt: now.toISOString(),
  };

  return {
    scene: committedScene,
    receipt: {
      id: context.id?.() ?? crypto.randomUUID(),
      sceneId: scene.id,
      decision: outcome.decision,
      requestedAction: outcome.requestedAction,
      committedAction: outcome.effectiveAction,
      checks: outcome.checks,
      professionalReviewFlagIds: outcome.professionalReviewFlags.map((flag) => flag.id),
      createdAt: now.toISOString(),
    },
  };
}
