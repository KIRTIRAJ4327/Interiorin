import type { SceneObject, SpatialConstraint, SpatialScene, SpatialZone, Vector3 } from "./schema";

type ValueChange<T> = {
  id: string;
  label: string;
  before: T;
  after: T;
};

export type SemanticSceneDiff = {
  addedObjects: SceneObject[];
  removedObjects: SceneObject[];
  movedObjects: ValueChange<Vector3>[];
  replacedObjects: ValueChange<string>[];
  protectionChanges: ValueChange<boolean>[];
  materialChanges: ValueChange<string>[];
  addedConstraints: SpatialConstraint[];
  resolvedConstraints: SpatialConstraint[];
};

function keyed<T extends { id: string }>(items: T[]): Map<string, T> {
  return new Map(items.map((item) => [item.id, item]));
}

function vectorsDiffer(first: Vector3, second: Vector3): boolean {
  return first.x !== second.x || first.y !== second.y || first.z !== second.z;
}

function objectChanges(before: SpatialScene, after: SpatialScene) {
  const beforeObjects = keyed(before.objects);
  const afterObjects = keyed(after.objects);
  const addedObjects = after.objects.filter((object) => !beforeObjects.has(object.id));
  const removedObjects = before.objects.filter((object) => !afterObjects.has(object.id));
  const movedObjects: ValueChange<Vector3>[] = [];
  const replacedObjects: ValueChange<string>[] = [];
  const protectionChanges: ValueChange<boolean>[] = [];

  for (const previous of before.objects) {
    const next = afterObjects.get(previous.id);
    if (!next) continue;
    if (vectorsDiffer(previous.transform.position, next.transform.position)) {
      movedObjects.push({
        id: previous.id,
        label: previous.label,
        before: previous.transform.position,
        after: next.transform.position,
      });
    }
    if (previous.assetId !== next.assetId) {
      replacedObjects.push({
        id: previous.id,
        label: previous.label,
        before: previous.assetId,
        after: next.assetId,
      });
    }
    if (previous.protected !== next.protected) {
      protectionChanges.push({
        id: previous.id,
        label: previous.label,
        before: previous.protected,
        after: next.protected,
      });
    }
  }
  return { addedObjects, removedObjects, movedObjects, replacedObjects, protectionChanges };
}

function zoneChanges(before: SpatialZone[], after: SpatialZone[]): ValueChange<string>[] {
  const afterZones = keyed(after);
  return before.flatMap((previous) => {
    const next = afterZones.get(previous.id);
    if (!next || previous.materialId === next.materialId) return [];
    return [
      {
        id: previous.id,
        label: previous.label,
        before: previous.materialId,
        after: next.materialId,
      },
    ];
  });
}

export function compareScenes(before: SpatialScene, after: SpatialScene): SemanticSceneDiff {
  const objects = objectChanges(before, after);
  const beforeConstraints = keyed(before.constraints);
  const afterConstraints = keyed(after.constraints);
  return {
    ...objects,
    materialChanges: zoneChanges(before.zones, after.zones),
    addedConstraints: after.constraints.filter((constraint) => !beforeConstraints.has(constraint.id)),
    resolvedConstraints: before.constraints.filter((constraint) => !afterConstraints.has(constraint.id)),
  };
}
