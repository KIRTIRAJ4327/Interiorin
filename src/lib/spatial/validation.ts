import type { SceneObject, SpatialScene } from "./schema";

export type SceneValidationFinding = {
  id: string;
  severity: "blocking" | "review";
  type: "envelope" | "overlap" | "clearance";
  message: string;
  relatedIds: string[];
  measuredMeters?: number;
  requiredMeters?: number;
};

export type SceneValidationReport = {
  status: "clear" | "review" | "blocked";
  findings: SceneValidationFinding[];
};

type Footprint = { minX: number; maxX: number; minZ: number; maxZ: number };

function footprint(object: SceneObject): Footprint {
  const scaledWidth = object.dimensions.width * Math.abs(object.transform.scale.x);
  const scaledDepth = object.dimensions.depth * Math.abs(object.transform.scale.z);
  const cosine = Math.abs(Math.cos(object.transform.rotation.y));
  const sine = Math.abs(Math.sin(object.transform.rotation.y));
  const halfWidth = (scaledWidth * cosine + scaledDepth * sine) / 2;
  const halfDepth = (scaledWidth * sine + scaledDepth * cosine) / 2;
  return {
    minX: object.transform.position.x - halfWidth,
    maxX: object.transform.position.x + halfWidth,
    minZ: object.transform.position.z - halfDepth,
    maxZ: object.transform.position.z + halfDepth,
  };
}

function envelope(scene: SpatialScene) {
  const horizontalZones = scene.zones.filter((zone) => ["floor", "yard", "patio"].includes(zone.kind));
  const points = (horizontalZones.length ? horizontalZones : scene.zones).flatMap((zone) => zone.polygon);
  return {
    minX: Math.min(...points.map((point) => point.x)),
    maxX: Math.max(...points.map((point) => point.x)),
    minZ: Math.min(...points.map((point) => point.z)),
    maxZ: Math.max(...points.map((point) => point.z)),
  };
}

function footprintGap(first: Footprint, second: Footprint) {
  const gapX = Math.max(0, first.minX - second.maxX, second.minX - first.maxX);
  const gapZ = Math.max(0, first.minZ - second.maxZ, second.minZ - first.maxZ);
  return Math.hypot(gapX, gapZ);
}

function overlapDepth(first: Footprint, second: Footprint) {
  return {
    x: Math.min(first.maxX, second.maxX) - Math.max(first.minX, second.minX),
    z: Math.min(first.maxZ, second.maxZ) - Math.max(first.minZ, second.minZ),
  };
}

function isFloorLayerSolidPair(first: SceneObject, second: SceneObject) {
  return first.placementClass !== second.placementClass
    && (first.placementClass === "floor_layer" || second.placementClass === "floor_layer");
}

export function validateScene(scene: SpatialScene): SceneValidationReport {
  const findings: SceneValidationFinding[] = [];
  const bounds = envelope(scene);
  const footprints = new Map(scene.objects.map((object) => [object.id, footprint(object)]));
  const tolerance = 0.01;

  for (const object of scene.objects) {
    const box = footprints.get(object.id)!;
    if (box.minX < bounds.minX - tolerance || box.maxX > bounds.maxX + tolerance || box.minZ < bounds.minZ - tolerance || box.maxZ > bounds.maxZ + tolerance) {
      findings.push({
        id: `envelope:${object.id}`,
        severity: "blocking",
        type: "envelope",
        message: `${object.label} extends outside the entered space envelope.`,
        relatedIds: [object.id],
      });
    }
  }

  for (let firstIndex = 0; firstIndex < scene.objects.length; firstIndex += 1) {
    const first = scene.objects[firstIndex];
    if (!first) continue;
    for (let secondIndex = firstIndex + 1; secondIndex < scene.objects.length; secondIndex += 1) {
      const second = scene.objects[secondIndex];
      if (!second) continue;
      if (isFloorLayerSolidPair(first, second)) continue;
      const firstBox = footprints.get(first.id)!;
      const secondBox = footprints.get(second.id)!;
      const overlap = overlapDepth(firstBox, secondBox);
      const pair = [first.id, second.id].sort();
      if (overlap.x > tolerance && overlap.z > tolerance) {
        findings.push({
          id: `overlap:${pair.join(":")}`,
          severity: "blocking",
          type: "overlap",
          message: `${first.label} overlaps ${second.label} by approximately ${Math.round(Math.min(overlap.x, overlap.z) * 1000)} mm.`,
          relatedIds: pair,
          measuredMeters: Math.min(overlap.x, overlap.z),
        });
      }
    }
  }

  for (const constraint of scene.constraints.filter((candidate) => candidate.type === "clearance" && candidate.thresholdMeters)) {
    const related = scene.objects.filter((object) => constraint.relatedIds.includes(object.id));
    for (let firstIndex = 0; firstIndex < related.length; firstIndex += 1) {
      const first = related[firstIndex];
      if (!first) continue;
      for (let secondIndex = firstIndex + 1; secondIndex < related.length; secondIndex += 1) {
        const second = related[secondIndex];
        if (!second) continue;
        if (isFloorLayerSolidPair(first, second)) continue;
        const pair = [first.id, second.id].sort();
        if (findings.some((finding) => finding.type === "overlap" && finding.relatedIds.join(":") === pair.join(":"))) continue;
        const gap = footprintGap(footprints.get(first.id)!, footprints.get(second.id)!);
        if (gap + tolerance < constraint.thresholdMeters!) {
          findings.push({
            id: `clearance:${constraint.id}:${pair.join(":")}`,
            severity: "review",
            type: "clearance",
            message: `${first.label} and ${second.label} have approximately ${Math.round(gap * 1000)} mm clear; review against the ${Math.round(constraint.thresholdMeters! * 1000)} mm target.`,
            relatedIds: pair,
            measuredMeters: gap,
            requiredMeters: constraint.thresholdMeters,
          });
        }
      }
    }
  }

  return {
    status: findings.some((finding) => finding.severity === "blocking") ? "blocked" : findings.length ? "review" : "clear",
    findings,
  };
}
