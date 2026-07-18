import type {
  Authority,
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
  factAuthority?: Authority;
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

const authorizingStates = new Set<Authority>(["verified", "user_declared"]);

function supportingProvenance(scene: SpatialScene, action: SceneAction): Provenance[] {
  const target = targetProvenance(scene, action);
  if (!("objectId" in action)) return target ? [target] : [];

  const constraints = scene.constraints.filter((constraint) =>
    constraint.relatedIds.includes(action.objectId),
  );
  const relatedObjects = scene.objects.filter((object) =>
    constraints.some((constraint) => constraint.relatedIds.includes(object.id)),
  );

  return [
    ...(target ? [target] : []),
    ...constraints.map((constraint) => constraint.provenance),
    ...relatedObjects.map(
      (object) => object.dimensions.widthProvenance ?? object.dimensions.provenance,
    ),
  ];
}

function authorityCheck(
  scene: SpatialScene,
  action: SceneAction,
  provenance: Provenance | undefined,
): TruthContractCheck | undefined {
  if (!fitSensitiveActions.has(action.type) || !provenance) return undefined;
  const unauthorized = supportingProvenance(scene, action).find(
    (source) => !authorizingStates.has(source.authority),
  );
  if (unauthorized) {
    return {
      code: "authority.evidence_required",
      status: "warning",
      message: "This fit-sensitive change depends on a fact that has not been verified or declared by the user.",
      factEvidence: unauthorized.evidence,
      factConfidence: unauthorized.confidence,
      factAuthority: unauthorized.authority,
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
      factAuthority: provenance.authority,
      relatedIds: [scene.id],
    };
  }
  return {
    code: "fact.authorized",
    status: "pass",
    message: "The target fact is sufficiently grounded for this operation.",
    factEvidence: provenance.evidence,
    factConfidence: provenance.confidence,
    factAuthority: provenance.authority,
    relatedIds: "objectId" in action ? [action.objectId] : [],
  };
}

type ClearanceAlternative = {
  action: SceneAction;
  check: TruthContractCheck;
};

function clearanceAlternative(
  scene: SpatialScene,
  action: Extract<SceneAction, { type: "move_object" }>,
): ClearanceAlternative | undefined {
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

  const movingObject = scene.objects.find((object) => object.id === action.objectId);
  if (!movingObject) return undefined;

  const toMillimeters = (meters: number) => Math.round(meters * 1000);
  const anchorLeftEdgeMm =
    toMillimeters(protectedAnchor.transform.position.x) -
    toMillimeters(protectedAnchor.dimensions.width) / 2;
  const maximumCenterMm =
    anchorLeftEdgeMm -
    toMillimeters(clearance.thresholdMeters) -
    toMillimeters(movingObject.dimensions.width) / 2;
  if (toMillimeters(action.position.x) <= maximumCenterMm) return undefined;

  const limitedPosition = clampToEnvelope(
    { x: maximumCenterMm / 1000, y: action.position.y, z: action.position.z },
    scene,
  );
  return {
    action: { ...action, position: limitedPosition },
    check: {
      code: "clearance.maximum_valid",
      status: "warning",
      message: `The requested move conflicts with ${clearance.message} Interiorin limited it to the nearest checked position.`,
      factEvidence: clearance.provenance.evidence,
      factConfidence: clearance.provenance.confidence,
      relatedIds: clearance.relatedIds,
    },
  };
}

export type TruthContractDependencies = {
  findClearanceAlternative?: typeof clearanceAlternative;
};

export function evaluateTruthContract(
  scene: SpatialScene,
  requestedAction: SceneAction,
  dependencies: TruthContractDependencies = {},
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
          factAuthority: unknownPropertyBoundary.provenance.authority,
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
          factAuthority: "observed_unverified",
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
  const authority = authorityCheck(scene, requestedAction, provenance);
  if (authority) checks.push(authority);

  if (authority?.code === "authority.evidence_required") {
    return {
      ...base,
      decision: "confirmation_required",
      checks,
      summary: "The proposal remains blocked until the supporting fact is deliberately declared or verified.",
    };
  }

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
    const clearance = (dependencies.findClearanceAlternative ?? clearanceAlternative)(
      scene,
      effectiveAction as Extract<SceneAction, { type: "move_object" }>,
    );
    if (clearance) {
      effectiveAction = clearance.action;
      limited = true;
      checks.push(clearance.check);
    }
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
