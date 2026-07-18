import type { SpatialScene } from "./schema";

export type VerifiedDimensions = {
  width: number;
  height: number;
  depth: number;
  sourceLabel: string;
};

export function recordVerifiedObjectDimensions(
  scene: SpatialScene,
  objectId: string,
  measurement: VerifiedDimensions,
): SpatialScene {
  const exists = scene.objects.some((object) => object.id === objectId);
  if (!exists) throw new Error(`Cannot verify unknown object: ${objectId}`);

  return {
    ...scene,
    objects: scene.objects.map((object) =>
      object.id === objectId
        ? {
            ...object,
            dimensions: {
              width: measurement.width,
              height: measurement.height,
              depth: measurement.depth,
              provenance: {
                evidence: "user_entered",
                confidence: "high",
                authority: "verified",
                sourceLabel: measurement.sourceLabel,
                note: "Measured value promoted this fact from observed_unverified to verified.",
              },
            },
          }
        : object,
    ),
    updatedAt: new Date().toISOString(),
  };
}
