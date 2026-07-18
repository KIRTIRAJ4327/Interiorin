import type { ProposalProviderMode } from "@/lib/ai/proposal";
import type { SceneAction, SpatialScene } from "./schema";
import {
  authorityProjection,
  geometryProjection,
  projectionDigest,
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
  requiredFactIds: [
    "table.center_x",
    "table.width",
    "bookcase.center_x",
    "bookcase.width_mm",
    "path.minimum_clearance",
  ] as const,
  ruleIds: ["ordered_edge_clearance_v1"] as const,
  disclaimer:
    "Early decision support only; not survey, code, structural, or construction certification.",
};

type FactBasis = {
  factId: string;
  authority: string;
  basis: "initial_source" | "session_attestation";
  sourceLabel: string;
};

export type BasicReceipt = {
  schemaVersion: "interiorin.receipt/1";
  id: string;
  sceneId: string;
  decision: "accepted" | "limited";
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
    statement: "I measured this value for this session";
    sourceLabel: string;
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
  const sources: Record<string, string | undefined> = {
    "table.center_x": table?.provenance.sourceLabel,
    "table.width": table?.dimensions.provenance.sourceLabel,
    "bookcase.center_x": bookcase?.provenance.sourceLabel,
    "bookcase.width_mm": (bookcase?.dimensions.widthProvenance ?? bookcase?.dimensions.provenance)?.sourceLabel,
    "path.minimum_clearance": path?.provenance.sourceLabel,
  };
  return sources[factId] ?? "Unknown source";
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

  return {
    schemaVersion: "interiorin.receipt/1",
    id: context.id?.() ?? crypto.randomUUID(),
    sceneId: beforeCommitScene.id,
    decision: outcome.decision,
    requestedAction: outcome.requestedAction,
    committedAction: outcome.effectiveAction,
    provider,
    policyRef: { ...policyBody, hash: policy.hash },
    factBases: facts.map((fact) => ({
      factId: fact.factId,
      authority: fact.authority,
      basis: fact.factId === "bookcase.width_mm" ? "session_attestation" : "initial_source",
      sourceLabel: sourceForFact(beforeCommitScene, fact.factId),
    })),
    sessionAttestation: {
      factId: "bookcase.width_mm",
      statement: "I measured this value for this session",
      sourceLabel:
        (bookcase?.dimensions.widthProvenance ?? bookcase?.dimensions.provenance)?.sourceLabel ??
        "Missing source",
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
    createdAt: (context.now?.() ?? new Date()).toISOString(),
  };
}
