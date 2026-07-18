import type { ActionReceipt, SceneAction, SpatialScene, Vector3 } from "./schema";

type ResolverContext = {
  now?: () => Date;
  id?: () => string;
};

function rejected(action: SceneAction, message: string, context: ResolverContext): ActionReceipt {
  return {
    id: context.id?.() ?? crypto.randomUUID(),
    action,
    status: "rejected",
    message,
    changedIds: [],
    warnings: [],
    createdAt: (context.now?.() ?? new Date()).toISOString(),
  };
}

function accepted(
  action: SceneAction,
  message: string,
  changedIds: string[],
  warnings: string[],
  context: ResolverContext,
): ActionReceipt {
  return {
    id: context.id?.() ?? crypto.randomUUID(),
    action,
    status: "accepted",
    message,
    changedIds,
    warnings,
    createdAt: (context.now?.() ?? new Date()).toISOString(),
  };
}

function insideZoneEnvelope(position: Vector3, scene: SpatialScene): boolean {
  const points = scene.zones.flatMap((zone) => zone.polygon);
  if (points.length === 0) return false;
  const xs = points.map((point) => point.x);
  const zs = points.map((point) => point.z);
  return (
    position.x >= Math.min(...xs) &&
    position.x <= Math.max(...xs) &&
    position.z >= Math.min(...zs) &&
    position.z <= Math.max(...zs)
  );
}

export function resolveSceneAction(
  scene: SpatialScene,
  action: SceneAction,
  context: ResolverContext = {},
): ActionReceipt {
  if (action.type === "undo") {
    return accepted(action, "Undo requested.", [], [], context);
  }

  if (action.type === "save_version") {
    return accepted(action, `${action.name} is ready to capture.`, [], [], context);
  }

  if (action.type === "compare_versions") {
    return accepted(action, "Two saved versions are ready to compare.", [], [], context);
  }

  if (action.type === "set_environment") {
    return accepted(
      action,
      `Environment set to ${action.warmth}, ${action.intensity}.`,
      [scene.id],
      [],
      context,
    );
  }

  if (action.type === "set_material") {
    const zone = scene.zones.find((candidate) => candidate.id === action.zoneId);
    if (!zone) return rejected(action, "That surface is not in this spatial model.", context);
    if (zone.protected) {
      return rejected(action, `${zone.label} is protected. Unprotect it before changing material.`, context);
    }
    return accepted(action, `${zone.label} material can change.`, [zone.id], [], context);
  }

  const object = scene.objects.find((candidate) => candidate.id === action.objectId);
  if (!object) return rejected(action, "That object is not in this spatial model.", context);

  if (action.type === "protect_object") {
    return accepted(
      action,
      `${object.label} ${action.protected ? "protected" : "unprotected"}.`,
      [object.id],
      [],
      context,
    );
  }

  if (object.protected) {
    return rejected(action, `${object.label} is protected. Unprotect it before changing it.`, context);
  }

  if (action.type === "replace_object") {
    return accepted(action, `${object.label} can be replaced.`, [object.id], [], context);
  }

  if (!insideZoneEnvelope(action.position, scene)) {
    return rejected(action, `${object.label} would move outside the known space.`, context);
  }

  const warnings =
    scene.calibration.status === "approximate"
      ? ["Fit is approximate until the space is calibrated with a known measurement."]
      : [];
  return accepted(action, `${object.label} can move to the requested position.`, [object.id], warnings, context);
}
