import type { ActionReceipt, SceneAction, SpatialScene } from "./schema";
import { applySpatialAssetVariant } from "./assets";
import { validateScene } from "./validation";

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
    const candidate = structuredClone(scene);
    const candidateObject = candidate.objects.find((item) => item.id === object.id);
    if (!candidateObject || !applySpatialAssetVariant(candidateObject, action.assetId)) {
      return rejected(action, "That replacement is not a bounded variant for this object category.", context);
    }
    const beforeReport = validateScene(scene);
    const candidateReport = validateScene(candidate);
    const blocking = candidateReport.findings.find((finding) => finding.severity === "blocking" && finding.relatedIds.includes(object.id) && !beforeReport.findings.some((previous) => previous.id === finding.id));
    if (blocking) return rejected(action, blocking.message, context);
    const warnings = candidateReport.findings.filter((finding) => finding.severity === "review" && finding.relatedIds.includes(object.id)).map((finding) => finding.message);
    return accepted(action, `${object.label} can be replaced with the checked variant.`, [object.id], warnings, context);
  }

  const candidate = structuredClone(scene);
  const candidateObject = candidate.objects.find((item) => item.id === object.id);
  if (candidateObject) candidateObject.transform.position = action.position;
  const beforeReport = validateScene(scene);
  const candidateReport = validateScene(candidate);
  const blocking = candidateReport.findings.find((finding) => {
    if (finding.severity !== "blocking" || !finding.relatedIds.includes(object.id)) return false;
    const previous = beforeReport.findings.find((candidateFinding) => candidateFinding.id === finding.id);
    if (!previous) return true;
    if (finding.measuredMeters === undefined || previous.measuredMeters === undefined) return true;
    return finding.measuredMeters >= previous.measuredMeters - 0.001;
  });
  if (blocking) return rejected(action, blocking.message, context);

  const warnings = candidateReport.findings
    .filter((finding) => finding.severity === "review" && finding.relatedIds.includes(object.id))
    .map((finding) => finding.message);
  if (
    scene.calibration.status === "approximate"
  ) warnings.push("Fit is approximate until the space is calibrated with a known measurement.");
  return accepted(action, `${object.label} can move to the requested position.`, [object.id], warnings, context);
}
