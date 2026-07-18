import type { SpatialScene } from "./schema";

export type DeclaredDimensions = {
  width: number;
  height: number;
  depth: number;
  sourceLabel: string;
};

export function declareObjectDimensionsForSession(
  scene: SpatialScene,
  objectId: string,
  measurement: DeclaredDimensions,
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
                authority: "user_declared",
                sourceLabel: measurement.sourceLabel,
                note: "Homeowner measurement promoted this fact from observed_unverified to user_declared for this session.",
              },
            },
          }
        : object,
    ),
    updatedAt: new Date().toISOString(),
  };
}
