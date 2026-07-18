import type { ProposalProviderMode } from "@/lib/ai/proposal";
import type { SceneAction, SpatialScene } from "./schema";
import {
  authorityProjection,
  geometryProjection,
  projectionDigest,
  solverFactIds,
  type AuthorityProof,
  type ProjectionDigest,
} from "./proof";
import type { TruthContractOutcome } from "./truth-contract";

const policyBody = {
  schemaVersion: "interiorin.policy/1" as const,
  id: "interiorin.interior-fit" as const,
  version: "1.0.0" as const,
  status: "demo_authored_unendorsed" as const,
  authorizingStates: ["verified", "user_declared"] as const,
  requiredFactIds: solverFactIds,
  ruleIds: ["ordered_edge_clearance_v1"] as const,
  disclaimer:
    "Early decision support only; not survey, code, structural, or construction certification.",
};

export type FactBasis = {
  factId: string;
  valueMm: number;
  authority: string;
  basis: "initial_source" | "authority_event";
  sourceRef: string;
  sourceLabel: string;
  sourceEventId?: string;
  capturedAt?: string;
};

export type BasicReceipt = {
  schemaVersion: "interiorin.receipt/2";
  id: string;
  versionId: "prepared-dining-room/session-v1";
  sceneId: string;
  decision: "accepted" | "limited";
  requestedDeltaMm: number;
  committedDeltaMm: number;
  requestedAction: SceneAction;
  committedAction: SceneAction;
  provider: {
    mode: ProposalProviderMode;
    model?: string;
    requestId?: string;
    disclosure: string;
  };
  policyRef: typeof policyBody & { hash: `sha256:${string}` };
  factBases: FactBasis[];
  sessionAttestation: {
    factId: "bookcase.width_mm";
    eventId: string;
    statement: "I measured this 100 cm value for this session";
    sourceLabel: string;
    recordedAt: string;
  };
  proof: {
    geometryBefore: ProjectionDigest;
    geometryAfterAuthorityEvent: ProjectionDigest;
    transactionBefore: ProjectionDigest;
    transactionAfterAuthorityEvent: ProjectionDigest;
    authorityBefore: ProjectionDigest;
    authorityAfter: ProjectionDigest;
  };
  professionalReview: {
    required: true;
    status: "unreviewed";
    reason: string;
  };
  beforeCommitGeometryHash: `sha256:${string}`;
  afterCommitGeometryHash: `sha256:${string}`;
  sceneDiff: [{ entityId: "table"; field: "position.x_mm"; before: number; after: number }];
  relationships: {
    geometry: "MATCH";
    transaction: "MATCH";
    authority: "1 FIELD";
  };
  limitation: "Early decision support; not survey, code, structural, or construction certification.";
  timeZone: "UTC";
  createdAt: string;
};

type ReceiptContext = {
  id?: () => string;
  now?: () => Date;
};

function sourceForFact(scene: SpatialScene, factId: string) {
  const table = scene.objects.find((object) => object.id === "table");
  const bookcase = scene.objects.find((object) => object.id === "bookcase");
  const path = scene.constraints.find((constraint) => constraint.id === "path-clearance");
  const sources = {
    "table.center_x_mm": table?.provenance,
    "table.width_mm": table?.dimensions.provenance,
    "bookcase.center_x_mm": bookcase?.provenance,
    "bookcase.width_mm": bookcase?.dimensions.widthProvenance ?? bookcase?.dimensions.provenance,
    "path.minimum_clearance_mm": path?.provenance,
  };
  return sources[factId as keyof typeof sources];
}

function xMillimeters(scene: SpatialScene, objectId: string) {
  const object = scene.objects.find((candidate) => candidate.id === objectId);
  if (!object) throw new Error(`Missing receipt object: ${objectId}`);
  return Math.round(object.transform.position.x * 1000);
}

export async function buildBasicReceipt(
  beforeCommitScene: SpatialScene,
  afterCommitScene: SpatialScene,
  outcome: TruthContractOutcome,
  proof: AuthorityProof,
  provider: BasicReceipt["provider"],
  context: ReceiptContext = {},
): Promise<BasicReceipt> {
  if (!proof.valid) throw new Error("Cannot issue a receipt for an invalid A/B proof.");
  if (
    !outcome.effectiveAction ||
    (outcome.decision !== "accepted" && outcome.decision !== "limited")
  ) {
    throw new Error(`Cannot issue a commit receipt for ${outcome.decision}.`);
  }

  const [policy, beforeCommit, afterCommit] = await Promise.all([
    projectionDigest(policyBody),
    projectionDigest(geometryProjection(beforeCommitScene)),
    projectionDigest(geometryProjection(afterCommitScene)),
  ]);
  const facts = authorityProjection(beforeCommitScene);
  const bookcase = beforeCommitScene.objects.find((object) => object.id === "bookcase");
  const tableBeforeMm = xMillimeters(beforeCommitScene, "table");
  const requestedPositionMm =
    outcome.requestedAction.type === "move_object"
      ? Math.round(outcome.requestedAction.position.x * 1000)
      : tableBeforeMm;
  const committedPositionMm =
    outcome.effectiveAction.type === "move_object"
      ? Math.round(outcome.effectiveAction.position.x * 1000)
      : tableBeforeMm;
  const createdAt = (context.now?.() ?? new Date()).toISOString();
  const widthSource = bookcase?.dimensions.widthProvenance ?? bookcase?.dimensions.provenance;

  return {
    schemaVersion: "interiorin.receipt/2",
    id: context.id?.() ?? crypto.randomUUID(),
    versionId: "prepared-dining-room/session-v1",
    sceneId: beforeCommitScene.id,
    decision: outcome.decision,
    requestedDeltaMm: requestedPositionMm - tableBeforeMm,
    committedDeltaMm: committedPositionMm - tableBeforeMm,
    requestedAction: outcome.requestedAction,
    committedAction: outcome.effectiveAction,
    provider,
    policyRef: { ...policyBody, hash: policy.hash },
    factBases: facts.map((fact) => {
      const source = sourceForFact(beforeCommitScene, fact.factId);
      return {
        factId: fact.factId,
        valueMm: fact.valueMm,
        authority: fact.authority,
        basis: fact.factId === "bookcase.width_mm" ? "authority_event" : "initial_source",
        sourceRef: source?.sourceRef ?? "prepared.unknown-source",
        sourceLabel: source?.sourceLabel ?? "Unknown prepared source",
        sourceEventId: source?.sourceEventId,
        capturedAt: source?.capturedAt,
      };
    }),
    sessionAttestation: {
      factId: "bookcase.width_mm",
      eventId: widthSource?.sourceEventId ?? "missing-session-event",
      statement: "I measured this 100 cm value for this session",
      sourceLabel: widthSource?.sourceLabel ?? "Missing source",
      recordedAt: widthSource?.capturedAt ?? createdAt,
    },
    proof: {
      geometryBefore: proof.geometry.before,
      geometryAfterAuthorityEvent: proof.geometry.after,
      transactionBefore: proof.transaction.before,
      transactionAfterAuthorityEvent: proof.transaction.after,
      authorityBefore: proof.authority.before,
      authorityAfter: proof.authority.after,
    },
    professionalReview: {
      required: true,
      status: "unreviewed",
      reason: "User-declared dimension requires professional review before purchase or construction.",
    },
    beforeCommitGeometryHash: beforeCommit.hash,
    afterCommitGeometryHash: afterCommit.hash,
    sceneDiff: [
      {
        entityId: "table",
        field: "position.x_mm",
        before: xMillimeters(beforeCommitScene, "table"),
        after: xMillimeters(afterCommitScene, "table"),
      },
    ],
    relationships: { geometry: "MATCH", transaction: "MATCH", authority: "1 FIELD" },
    limitation: "Early decision support; not survey, code, structural, or construction certification.",
    timeZone: "UTC",
    createdAt,
  };
}
