import { studioVersionSchema, type StudioVersion } from "./schema";

export const versionStorageKey = "interiorin.studio.versions.v1";

export function readStoredVersions(storage: Pick<Storage, "getItem">): StudioVersion[] {
  const raw = storage.getItem(versionStorageKey);
  if (!raw) return [];
  try {
    const parsed = studioVersionSchema.array().safeParse(JSON.parse(raw));
    return parsed.success ? parsed.data : [];
  } catch {
    return [];
  }
}

export function writeStoredVersions(storage: Pick<Storage, "setItem">, versions: StudioVersion[]) {
  storage.setItem(versionStorageKey, JSON.stringify(studioVersionSchema.array().parse(versions)));
}
