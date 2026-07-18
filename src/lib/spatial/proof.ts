import type { SceneAction, SpatialScene } from "./schema";

type JsonPrimitive = string | number | boolean | null;
type JsonValue = JsonPrimitive | JsonValue[] | { [key: string]: JsonValue };

export type ProjectionDigest = {
  byteLength: number;
  hash: `sha256:${string}`;
};

export type AuthorityDiff = {
  factId: string;
  field: "authority";
  before: string;
  after: string;
};

export type AuthorityProof = {
  valid: boolean;
  geometry: { before: ProjectionDigest; after: ProjectionDigest; equal: boolean };
  transaction: { before: ProjectionDigest; after: ProjectionDigest; equal: boolean };
  authority: { before: ProjectionDigest; after: ProjectionDigest; equal: boolean; diff: AuthorityDiff[] };
  failureReason?: string;
};

function normalize(value: unknown): JsonValue {
  if (value === null || ["string", "number", "boolean"].includes(typeof value)) {
    return value as JsonPrimitive;
  }
  if (Array.isArray(value)) {
    const normalized = value.map(normalize);
    if (
      normalized.every(
        (item) => typeof item === "object" && item !== null && !Array.isArray(item) && "id" in item,
      )
    ) {
      return [...normalized].sort((first, second) =>
        String((first as { id: JsonValue }).id).localeCompare(String((second as { id: JsonValue }).id)),
      );
    }
    return normalized;
  }
  if (typeof value === "object") {
    const source = value as Record<string, unknown>;
    return Object.keys(source)
      .filter((key) => source[key] !== undefined)
      .sort()
      .reduce<Record<string, JsonValue>>((result, key) => {
        result[key] = normalize(source[key]);
        return result;
      }, {});
  }
  throw new Error(`Cannot canonicalize ${typeof value}.`);
}

export function canonicalBytes(value: unknown): Uint8Array {
  return new TextEncoder().encode(JSON.stringify(normalize(value)));
}

export async function projectionDigest(value: unknown): Promise<ProjectionDigest> {
  const bytes = canonicalBytes(value);
  const digestInput =
    typeof Buffer !== "undefined"
      ? Buffer.from(bytes)
      : (bytes as unknown as BufferSource);
  const buffer = await globalThis.crypto.subtle.digest("SHA-256", digestInput);
  const hex = Array.from(new Uint8Array(buffer), (byte) => byte.toString(16).padStart(2, "0")).join("");
  return { byteLength: bytes.byteLength, hash: `sha256:${hex}` };
}

function millimeters(meters: number) {
  return Math.round(meters * 1000);
}

export function geometryProjection(scene: SpatialScene) {
  const points = scene.zones.flatMap((zone) => zone.polygon);
  return {
    schemaVersion: "interiorin.geometry/1",
    sceneId: scene.id,
    envelopeMm: {
      minX: Math.min(...points.map((point) => millimeters(point.x))),
      maxX: Math.max(...points.map((point) => millimeters(point.x))),
      minZ: Math.min(...points.map((point) => millimeters(point.z))),
      maxZ: Math.max(...points.map((point) => millimeters(point.z))),
    },
    objects: scene.objects.map((object) => ({
      id: object.id,
      centerMm: {
        x: millimeters(object.transform.position.x),
        y: millimeters(object.transform.position.y),
        z: millimeters(object.transform.position.z),
      },
      sizeMm: {
        width: millimeters(object.dimensions.width),
        height: millimeters(object.dimensions.height),
        depth: millimeters(object.dimensions.depth),
      },
      protected: object.protected,
    })),
    constraints: scene.constraints.map((constraint) => ({
      id: constraint.id,
      type: constraint.type,
      relatedIds: [...constraint.relatedIds].sort(),
      thresholdMm: constraint.thresholdMeters ? millimeters(constraint.thresholdMeters) : null,
    })),
  };
}

export function transactionProjection(sceneId: string, action: SceneAction) {
  return {
    schemaVersion: "interiorin.transaction/1",
    sceneId,
    action:
      action.type === "move_object"
        ? {
            type: action.type,
            objectId: action.objectId,
            positionMm: {
              x: millimeters(action.position.x),
              y: millimeters(action.position.y),
              z: millimeters(action.position.z),
            },
          }
        : action,
  };
}

export function authorityProjection(scene: SpatialScene) {
  const table = scene.objects.find((object) => object.id === "table");
  const bookcase = scene.objects.find((object) => object.id === "bookcase");
  const path = scene.constraints.find((constraint) => constraint.id === "path-clearance");
  if (!table || !bookcase || !path) {
    throw new Error("The prepared solver dependency graph is incomplete.");
  }

  return [
    { id: "table.center_x", factId: "table.center_x", authority: table.provenance.authority },
    { id: "table.width", factId: "table.width", authority: table.dimensions.provenance.authority },
    { id: "bookcase.center_x", factId: "bookcase.center_x", authority: bookcase.provenance.authority },
    { id: "bookcase.width_mm", factId: "bookcase.width_mm", authority: (bookcase.dimensions.widthProvenance ?? bookcase.dimensions.provenance).authority },
    { id: "path.minimum_clearance", factId: "path.minimum_clearance", authority: path.provenance.authority },
  ];
}

function authorityDiff(before: ReturnType<typeof authorityProjection>, after: ReturnType<typeof authorityProjection>) {
  const afterById = new Map(after.map((fact) => [fact.factId, fact]));
  return before.flatMap<AuthorityDiff>((fact) => {
    const changed = afterById.get(fact.factId);
    return changed && changed.authority !== fact.authority
      ? [{ factId: fact.factId, field: "authority", before: fact.authority, after: changed.authority }]
      : [];
  });
}

export async function buildAuthorityProof(
  passAScene: SpatialScene,
  passBScene: SpatialScene,
  passATransaction: SceneAction,
  passBTransaction: SceneAction,
): Promise<AuthorityProof> {
  const geometryA = geometryProjection(passAScene);
  const geometryB = geometryProjection(passBScene);
  const transactionA = transactionProjection(passAScene.id, passATransaction);
  const transactionB = transactionProjection(passBScene.id, passBTransaction);
  const authorityA = authorityProjection(passAScene);
  const authorityB = authorityProjection(passBScene);
  const [geometryBefore, geometryAfter, transactionBefore, transactionAfter, authorityBefore, authorityAfter] =
    await Promise.all([
      projectionDigest(geometryA),
      projectionDigest(geometryB),
      projectionDigest(transactionA),
      projectionDigest(transactionB),
      projectionDigest(authorityA),
      projectionDigest(authorityB),
    ]);
  const diff = authorityDiff(authorityA, authorityB);
  const geometryEqual = geometryBefore.hash === geometryAfter.hash;
  const transactionEqual = transactionBefore.hash === transactionAfter.hash;
  const allowedAuthorityDiff =
    diff.length === 1 &&
    diff[0]?.factId === "bookcase.width_mm" &&
    diff[0].before === "observed_unverified" &&
    diff[0].after === "user_declared";
  const valid = geometryEqual && transactionEqual && allowedAuthorityDiff;

  return {
    valid,
    geometry: { before: geometryBefore, after: geometryAfter, equal: geometryEqual },
    transaction: { before: transactionBefore, after: transactionAfter, equal: transactionEqual },
    authority: {
      before: authorityBefore,
      after: authorityAfter,
      equal: authorityBefore.hash === authorityAfter.hash,
      diff,
    },
    failureReason: valid
      ? undefined
      : "A/B proof invalid: geometry, transaction, or the allowlisted authority transition changed.",
  };
}
