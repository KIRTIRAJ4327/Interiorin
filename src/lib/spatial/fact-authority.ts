import type { SpatialScene } from "./schema";

export type DeclaredWidth = {
  width: number;
  sourceLabel: string;
  sourceRef?: string;
  eventId?: string;
  recordedAt?: string;
};

export function declareObjectWidthForSession(
  scene: SpatialScene,
  objectId: string,
  measurement: DeclaredWidth,
): SpatialScene {
  const exists = scene.objects.some((object) => object.id === objectId);
  if (!exists) throw new Error(`Cannot declare width for unknown object: ${objectId}`);

  return {
    ...scene,
    objects: scene.objects.map((object) =>
      object.id === objectId
        ? {
            ...object,
            dimensions: {
              ...object.dimensions,
              width: measurement.width,
              widthProvenance: {
                evidence: "user_entered",
                confidence: "high",
                authority: "user_declared",
                sourceLabel: measurement.sourceLabel,
                sourceRef: measurement.sourceRef ?? "session.homeowner-tape-measurement",
                sourceEventId: measurement.eventId ?? "session-width-attestation",
                capturedAt: measurement.recordedAt ?? new Date().toISOString(),
                note: "Homeowner measurement promoted width only from observed_unverified to user_declared for this session.",
              },
            },
          }
        : object,
    ),
    updatedAt: new Date().toISOString(),
  };
}
