import type {
  Confidence,
  Provenance,
  SceneAction,
  SpatialConstraint,
  SpatialScene,
  Vector3,
} from "./schema";

export type TruthContractDecision =
  | "accepted"
  | "limited"
  | "confirmation_required"
  | "refused";

export type TruthContractCheck = {
  code: string;
  status: "pass" | "warning" | "fail";
  message: string;
  factEvidence?: Provenance["evidence"];
  factConfidence?: Confidence;
  relatedIds: string[];
};

export type TruthContractOutcome = {
  decision: TruthContractDecision;
  requestedAction: SceneAction;
  effectiveAction?: SceneAction;
  checks: TruthContractCheck[];
  professionalReviewFlags: SpatialConstraint[];
  verificationQueueCount: number;
  summary: string;
};

const fitSensitiveActions = new Set<SceneAction["type"]>([
  "move_object",
  "replace_object",
]);

function envelope(scene: SpatialScene) {
  const points = scene.zones.flatMap((zone) => zone.polygon);
  return {
    minX: Math.min(...points.map((point) => point.x)),
    maxX: Math.max(...points.map((point) => point.x)),
    minZ: Math.min(...points.map((point) => point.z)),
    maxZ: Math.max(...points.map((point) => point.z)),
  };
}

function clampToEnvelope(position: Vector3, scene: SpatialScene): Vector3 {
  const bounds = envelope(scene);
  return {
    x: Math.min(bounds.maxX, Math.max(bounds.minX, position.x)),
    y: position.y,
    z: Math.min(bounds.maxZ, Math.max(bounds.minZ, position.z)),
  };
}

function samePosition(first: Vector3, second: Vector3): boolean {
  return first.x === second.x && first.y === second.y && first.z === second.z;
}

function targetProvenance(scene: SpatialScene, action: SceneAction): Provenance | undefined {
  if ("objectId" in action) {
    return scene.objects.find((object) => object.id === action.objectId)?.provenance;
  }
  if (action.type === "set_material") {
    return scene.zones.find((zone) => zone.id === action.zoneId)?.provenance;
  }
  return undefined;
}

function targetIsProtected(scene: SpatialScene, action: SceneAction): string | undefined {
  if (action.type === "protect_object" || !("objectId" in action)) return undefined;
  const object = scene.objects.find((candidate) => candidate.id === action.objectId);
  return object?.protected ? object.label : undefined;
}

function confidenceCheck(
  scene: SpatialScene,
  action: SceneAction,
  provenance: Provenance | undefined,
): TruthContractCheck | undefined {
  if (!fitSensitiveActions.has(action.type) || !provenance) return undefined;
  if (provenance.evidence === "inferred" && ["low", "unverified"].includes(provenance.confidence)) {
    return {
      code: "fact.confirmation_required",
      status: "warning",
      message: "This fit-sensitive change depends on a low-confidence inferred fact.",
      factEvidence: provenance.evidence,
      factConfidence: provenance.confidence,
      relatedIds: "objectId" in action ? [action.objectId] : [],
    };
  }
  if (scene.calibration.status === "approximate") {
    return {
      code: "scene.approximate",
      status: "warning",
      message: "Fit remains approximate until one known measurement calibrates the space.",
      factEvidence: provenance.evidence,
      factConfidence: provenance.confidence,
      relatedIds: [scene.id],
    };
  }
  return {
    code: "fact.authorized",
    status: "pass",
    message: "The target fact is sufficiently grounded for this operation.",
    factEvidence: provenance.evidence,
    factConfidence: provenance.confidence,
    relatedIds: "objectId" in action ? [action.objectId] : [],
  };
}

function clearanceAlternative(
  scene: SpatialScene,
  action: Extract<SceneAction, { type: "move_object" }>,
): { action: SceneAction; check: TruthContractCheck } | undefined {
  const clearance = scene.constraints.find(
    (constraint) =>
      constraint.type === "clearance" &&
      constraint.relatedIds.includes(action.objectId) &&
      constraint.thresholdMeters,
  );
  if (!clearance?.thresholdMeters) return undefined;

  const protectedAnchor = scene.objects.find(
    (object) => object.protected && clearance.relatedIds.includes(object.id),
  );
  if (!protectedAnchor) return undefined;

  const deltaX = action.position.x - protectedAnchor.transform.position.x;
  const deltaZ = action.position.z - protectedAnchor.transform.position.z;
  const distance = Math.hypot(deltaX, deltaZ);
  if (distance >= clearance.thresholdMeters) return undefined;

  const fallbackX = distance === 0 ? 1 : deltaX / distance;
  const fallbackZ = distance === 0 ? 0 : deltaZ / distance;
  const limitedPosition = clampToEnvelope(
    {
      x: protectedAnchor.transform.position.x + fallbackX * clearance.thresholdMeters,
      y: action.position.y,
      z: protectedAnchor.transform.position.z + fallbackZ * clearance.thresholdMeters,
    },
    scene,
  );
  return {
    action: { ...action, position: limitedPosition },
    check: {
      code: "clearance.maximum_valid",
      status: "warning",
      message: `The requested move conflicts with ${clearance.message} Groundline limited it to the nearest checked position.`,
      factEvidence: clearance.provenance.evidence,
      factConfidence: clearance.provenance.confidence,
      relatedIds: clearance.relatedIds,
    },
  };
}

export function evaluateTruthContract(
  scene: SpatialScene,
  requestedAction: SceneAction,
): TruthContractOutcome {
  const professionalReviewFlags = scene.constraints.filter(
    (constraint) => constraint.requiresProfessionalReview,
  );
  const base = {
    requestedAction,
    professionalReviewFlags,
    verificationQueueCount: professionalReviewFlags.length,
  };

  const unknownPropertyBoundary = scene.constraints.find(
    (constraint) =>
      scene.kind === "exterior" &&
      requestedAction.type === "move_object" &&
      constraint.type === "property_boundary" &&
      constraint.severity === "blocking" &&
      (constraint.relatedIds.length === 0 ||
        constraint.relatedIds.includes(requestedAction.objectId)),
  );
  if (unknownPropertyBoundary) {
    return {
      ...base,
      decision: "refused",
      checks: [
        {
          code: "property_boundary.unknown",
          status: "fail",
          message: unknownPropertyBoundary.message,
          factEvidence: unknownPropertyBoundary.provenance.evidence,
          factConfidence: unknownPropertyBoundary.provenance.confidence,
          relatedIds: unknownPropertyBoundary.relatedIds,
        },
      ],
      summary: "The exterior move was refused until the property boundary is entered by an authorized person.",
    };
  }

  const protectedLabel = targetIsProtected(scene, requestedAction);
  if (protectedLabel) {
    return {
      ...base,
      decision: "refused",
      checks: [
        {
          code: "target.protected",
          status: "fail",
          message: `${protectedLabel} is protected and cannot be changed without explicit unprotection.`,
          factEvidence: "observed",
          factConfidence: "high",
          relatedIds: "objectId" in requestedAction ? [requestedAction.objectId] : [],
        },
      ],
      summary: "The request was refused before it could mutate canonical scene state.",
    };
  }

  const provenance = targetProvenance(scene, requestedAction);
  if ("objectId" in requestedAction && !provenance) {
    return {
      ...base,
      decision: "refused",
      checks: [
        {
          code: "target.unknown",
          status: "fail",
          message: "The requested object is not part of the known scene.",
          relatedIds: [requestedAction.objectId],
        },
      ],
      summary: "The request targeted an unknown object and was refused.",
    };
  }

  const checks: TruthContractCheck[] = [];
  const confidence = confidenceCheck(scene, requestedAction, provenance);
  if (confidence) checks.push(confidence);

  let effectiveAction = requestedAction;
  let limited = false;
  if (requestedAction.type === "move_object") {
    const boundedPosition = clampToEnvelope(requestedAction.position, scene);
    if (!samePosition(boundedPosition, requestedAction.position)) {
      effectiveAction = { ...requestedAction, position: boundedPosition };
      limited = true;
      checks.push({
        code: "boundary.maximum_valid",
        status: "warning",
        message: "The requested point was outside the known space and was limited to its boundary.",
        relatedIds: [requestedAction.objectId],
      });
    }
    const clearance = clearanceAlternative(
      scene,
      effectiveAction as Extract<SceneAction, { type: "move_object" }>,
    );
    if (clearance) {
      effectiveAction = clearance.action;
      limited = true;
      checks.push(clearance.check);
    }
  }

  if (confidence?.code === "fact.confirmation_required") {
    return {
      ...base,
      decision: "confirmation_required",
      effectiveAction,
      checks,
      summary: "The proposal remains a preview until the inferred fact is confirmed.",
    };
  }

  return {
    ...base,
    decision: limited ? "limited" : "accepted",
    effectiveAction,
    checks,
    summary: limited
      ? "The request was limited to the maximum valid alternative before commit."
      : "The request satisfies the current truth contract and may be committed.",
  };
}
