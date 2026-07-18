import { describe, expect, it, vi } from "vitest";
import { generateStudioOptions } from "./generator";
import { studioProjectSchema, studioVersionSchema } from "./schema";
import { readStoredVersions, versionStorageKey, writeStoredVersions } from "./storage";

const project = studioProjectSchema.parse({
  id: "storage-project",
  name: "Storage test",
  kind: "interior",
  condition: "empty",
  intent: "Create a flexible place for everyday use.",
  dimensions: { widthM: 5, depthM: 4, heightM: 2.7 },
  source: { mode: "guided_measurements", authority: "user_declared" },
  createdAt: "2026-07-18T12:00:00.000Z",
});

describe("local version persistence", () => {
  it("round-trips validated versions and ignores malformed storage", () => {
    const version = studioVersionSchema.parse({
      id: "v1",
      projectId: project.id,
      optionId: "clear-passage",
      name: "Clear passage",
      scene: generateStudioOptions(project)[0]!.scene,
      receipts: [],
      createdAt: "2026-07-18T12:01:00.000Z",
    });
    const storage = { getItem: vi.fn(), setItem: vi.fn() };
    writeStoredVersions(storage, [version]);
    const written = storage.setItem.mock.calls[0]?.[1];
    expect(storage.setItem).toHaveBeenCalledWith(versionStorageKey, expect.any(String));
    storage.getItem.mockReturnValue(written);
    expect(readStoredVersions(storage)).toEqual([version]);
    storage.getItem.mockReturnValue("{broken");
    expect(readStoredVersions(storage)).toEqual([]);
  });
});
