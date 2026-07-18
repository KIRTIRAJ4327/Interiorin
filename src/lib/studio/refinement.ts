import { resolveSceneAction } from "@/lib/spatial/action-resolver";
import { applySpatialAssetVariant, availableSpatialAssetLabels, findSpatialAssetVariant } from "@/lib/spatial/assets";
import { sceneActionSchema, type ActionReceipt, type SceneAction, type SpatialScene } from "@/lib/spatial/schema";

export type ParsedRefinement =
  | { status: "ready"; action: SceneAction; summary: string }
  | { status: "needs_clarification"; question: string };

const directionDelta: Record<string, { axis: "x" | "z"; sign: number }> = {
  right: { axis: "x", sign: 1 },
  east: { axis: "x", sign: 1 },
  left: { axis: "x", sign: -1 },
  west: { axis: "x", sign: -1 },
  forward: { axis: "z", sign: 1 },
  north: { axis: "z", sign: 1 },
  back: { axis: "z", sign: -1 },
  backward: { axis: "z", sign: -1 },
  south: { axis: "z", sign: -1 },
};

function referencedObject(scene: SpatialScene, transcript: string) {
  const normalized = transcript.toLowerCase();
  return scene.objects.find((object) =>
    normalized.includes(object.id.toLowerCase()) ||
    normalized.includes(object.label.toLowerCase()) ||
    normalized.includes(object.category.toLowerCase()),
  );
}

export function parseStudioRefinement(scene: SpatialScene, transcript: string): ParsedRefinement {
  const normalized = transcript.trim().toLowerCase();
  const object = referencedObject(scene, normalized);

  if (/^(?:undo|go back|revert)(?:\s+(?:that|last change))?$/.test(normalized)) {
    return { status: "ready", action: sceneActionSchema.parse({ type: "undo" }), summary: "Undo the last committed scene change." };
  }

  const protectionMatch = normalized.match(/^(unprotect|unlock|protect|lock|keep)\s+(?:the\s+)?(.+?)(?:\s+in place)?$/);
  if (protectionMatch && object) {
    const command = protectionMatch[1];
    const protect = command !== "unprotect" && command !== "unlock";
    return {
      status: "ready",
      action: sceneActionSchema.parse({ type: "protect_object", objectId: object.id, protected: protect }),
      summary: `${protect ? "Protect" : "Unprotect"} ${object.label}.`,
    };
  }

  const environmentMatch = normalized.match(/^(?:make|set|change)\s+(?:the\s+)?(?:room|space|lighting|environment)?\s*(warm|cool|neutral)(?:\s+(?:and\s+)?(dim|normal|bright))?$/);
  if (environmentMatch) {
    const warmth = environmentMatch[1];
    const intensity = environmentMatch[2] ?? "normal";
    return {
      status: "ready",
      action: sceneActionSchema.parse({ type: "set_environment", warmth, intensity }),
      summary: `Set the scene lighting to ${warmth} and ${intensity}.`,
    };
  }

  const replacementMatch = normalized.match(/^(?:replace|swap|change)\s+(?:the\s+)?(.+?)\s+(?:with|for|to)\s+(?:a\s+|an\s+|the\s+)?(.+)$/);
  if (replacementMatch && object) {
    const variantPhrase = replacementMatch[2];
    if (!variantPhrase) return { status: "needs_clarification", question: "Name the replacement variant." };
    const variant = findSpatialAssetVariant(object.category, variantPhrase);
    if (!variant) {
      const available = availableSpatialAssetLabels(object.category);
      return { status: "needs_clarification", question: available.length ? `Available ${object.category} variants: ${available.join(" or ")}.` : `No bounded replacement variant is available for ${object.label}.` };
    }
    return {
      status: "ready",
      action: sceneActionSchema.parse({ type: "replace_object", objectId: object.id, assetId: variant.id }),
      summary: `Replace ${object.label} with ${variant.label}.`,
    };
  }

  const rotationMatch = normalized.match(/^(?:rotate|turn)\s+(?:the\s+)?(.+?)\s+(?:(left|right|clockwise|counterclockwise)\s+)?(\d+(?:\.\d+)?)\s*(?:degrees?|deg)\b/);
  if (rotationMatch && object) {
    const direction = rotationMatch[2] ?? "clockwise";
    const degreesText = rotationMatch[3];
    if (!degreesText) return { status: "needs_clarification", question: "Add a rotation in degrees." };
    const degrees = Number(degreesText);
    const sign = direction === "left" || direction === "counterclockwise" ? 1 : -1;
    const rotationY = object.transform.rotation.y + sign * degrees * Math.PI / 180;
    return {
      status: "ready",
      action: sceneActionSchema.parse({ type: "rotate_object", objectId: object.id, rotationY }),
      summary: `Rotate ${object.label} ${direction} ${degrees} degrees.`,
    };
  }
  const moveMatch = normalized.match(/(?:move|shift)\s+.+?\s+(left|right|east|west|forward|backward|back|north|south)\s+(\d+(?:\.\d+)?)\s*(cm|centimeters?|m|meters?)\b/);

  if (moveMatch && object) {
    const directionWord = moveMatch[1];
    const distanceText = moveMatch[2];
    const unit = moveMatch[3];
    if (!directionWord || !distanceText || !unit) return { status: "needs_clarification", question: "Add a direction and distance." };
    const direction = directionDelta[directionWord];
    if (!direction) return { status: "needs_clarification", question: "Use left, right, forward, or back." };
    const rawDistance = Number(distanceText);
    const meters = unit.startsWith("m") ? rawDistance : rawDistance / 100;
    const position = { ...object.transform.position };
    position[direction.axis] += direction.sign * meters;
    const action = sceneActionSchema.parse({ type: "move_object", objectId: object.id, position });
    return {
      status: "ready",
      action,
      summary: `Move ${object.label} ${directionWord} ${Math.round(meters * 1000)} mm.`,
    };
  }

  const materialMatch = normalized.match(/(?:change|set|make)\s+(?:the\s+)?(floor|yard|patio|wall)\s+(?:material\s+)?(?:to\s+)?([a-z][a-z\s-]{2,40})$/);
  if (materialMatch) {
    const surfaceName = materialMatch[1];
    const materialName = materialMatch[2];
    if (!surfaceName || !materialName) return { status: "needs_clarification", question: "Name a surface and material." };
    const zone = scene.zones.find((candidate) =>
      candidate.label.toLowerCase().includes(surfaceName) || candidate.kind.includes(surfaceName),
    );
    if (!zone) return { status: "needs_clarification", question: `This model has no ${surfaceName} surface.` };
    const materialId = materialName.trim().replace(/\s+/g, "-");
    return {
      status: "ready",
      action: sceneActionSchema.parse({ type: "set_material", zoneId: zone.id, materialId }),
      summary: `Set ${zone.label} material to ${materialName.trim()}.`,
    };
  }

  if (!object) {
    return { status: "needs_clarification", question: "Name a visible object, for example: Move the table right 30 cm." };
  }

  return { status: "needs_clarification", question: `Add a direction and distance, for example: Move ${object.label} right 30 cm.` };
}

export function applyStudioRefinement(
  scene: SpatialScene,
  parsed: Extract<ParsedRefinement, { status: "ready" }>,
): { scene: SpatialScene; receipt: ActionReceipt } {
  const receipt = resolveSceneAction(scene, parsed.action);
  if (receipt.status === "rejected") return { scene, receipt };

  const next = structuredClone(scene);
  const action = parsed.action;
  if (action.type === "move_object") {
    const object = next.objects.find((candidate) => candidate.id === action.objectId);
    if (object) object.transform.position = action.position;
  } else if (action.type === "rotate_object") {
    const object = next.objects.find((candidate) => candidate.id === action.objectId);
    if (object) object.transform.rotation.y = action.rotationY;
  } else if (action.type === "set_material") {
    const zone = next.zones.find((candidate) => candidate.id === action.zoneId);
    if (zone) zone.materialId = action.materialId;
  } else if (action.type === "protect_object") {
    const object = next.objects.find((candidate) => candidate.id === action.objectId);
    if (object) object.protected = action.protected;
  } else if (action.type === "replace_object") {
    const object = next.objects.find((candidate) => candidate.id === action.objectId);
    if (object) applySpatialAssetVariant(object, action.assetId);
  } else if (action.type === "set_environment") {
    next.environment = { warmth: action.warmth, intensity: action.intensity };
  }
  next.updatedAt = new Date().toISOString();
  return { scene: next, receipt };
}
