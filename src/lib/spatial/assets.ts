import type { SceneObject } from "./schema";

export type SpatialAssetVariant = {
  id: string;
  label: string;
  category: SceneObject["category"];
  aliases: string[];
  dimensions: { width: number; height: number; depth: number };
  materialIds: string[];
};

export type ProceduralAssetFamily = "sofa" | "table" | "storage" | "rug" | "plant" | "tree" | "fallback";

export function proceduralAssetFamily(object: Pick<SceneObject, "assetId" | "category" | "placementClass">): ProceduralAssetFamily {
  if (object.placementClass === "floor_layer") return "rug";
  if (object.category === "plant") return "plant";
  if (object.category === "tree") return "tree";
  if (object.category === "seating" && object.assetId.startsWith("sofa-")) return "sofa";
  if (object.category === "table" && object.assetId.startsWith("table-")) return "table";
  if (object.category === "storage" && object.assetId.startsWith("storage-")) return "storage";
  return "fallback";
}

export const spatialAssetVariants: SpatialAssetVariant[] = [
  { id: "table-oak-round-compact", label: "compact round table", category: "table", aliases: ["small round table", "compact table"], dimensions: { width: 0.9, height: 0.74, depth: 0.9 }, materialIds: ["oak-mid"] },
  { id: "table-oak-rectangular-six", label: "six-seat rectangular table", category: "table", aliases: ["rectangular table", "six seat table", "long table"], dimensions: { width: 1.8, height: 0.75, depth: 0.9 }, materialIds: ["oak-mid"] },
  { id: "sofa-linen-compact", label: "compact two-seat sofa", category: "seating", aliases: ["compact sofa", "two seat sofa", "small sofa"], dimensions: { width: 1.75, height: 0.8, depth: 0.86 }, materialIds: ["linen-oat"] },
  { id: "sofa-linen-sectional", label: "large sectional sofa", category: "seating", aliases: ["sectional sofa", "large sofa"], dimensions: { width: 2.75, height: 0.82, depth: 1.55 }, materialIds: ["linen-oat"] },
  { id: "storage-bookcloth-low", label: "low storage console", category: "storage", aliases: ["low storage", "media console"], dimensions: { width: 1.6, height: 0.72, depth: 0.42 }, materialIds: ["bookcloth-walnut"] },
  { id: "storage-bookcloth-tall", label: "tall storage cabinet", category: "storage", aliases: ["tall storage", "tall cabinet"], dimensions: { width: 1.05, height: 1.9, depth: 0.48 }, materialIds: ["bookcloth-walnut"] },
  { id: "rug-wool-flatweave", label: "flatweave wool rug", category: "decor", aliases: ["rug", "wool rug", "floor rug"], dimensions: { width: 2.4, height: 0.025, depth: 1.8 }, materialIds: ["wool-sand"] },
  { id: "plant-ceramic-upright", label: "upright ceramic planter", category: "plant", aliases: ["plant", "indoor plant", "planter"], dimensions: { width: 0.48, height: 1.15, depth: 0.48 }, materialIds: ["foliage-olive", "ceramic-chalk"] },
  { id: "outdoor-bench-timber-compact", label: "compact outdoor bench", category: "seating", aliases: ["outdoor bench", "small bench"], dimensions: { width: 1.6, height: 0.78, depth: 0.72 }, materialIds: ["timber-weathered"] },
];

function normalized(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

export function findSpatialAssetVariant(category: SceneObject["category"], phrase: string) {
  const target = normalized(phrase);
  return spatialAssetVariants.find((variant) => variant.category === category && [variant.label, variant.id, ...variant.aliases].some((candidate) => target.includes(normalized(candidate)) || normalized(candidate).includes(target)));
}

export function availableSpatialAssetLabels(category: SceneObject["category"]) {
  return spatialAssetVariants.filter((variant) => variant.category === category).map((variant) => variant.label);
}

export function applySpatialAssetVariant(object: SceneObject, assetId: string) {
  const variant = spatialAssetVariants.find((candidate) => candidate.id === assetId && candidate.category === object.category);
  if (!variant) return false;
  object.assetId = variant.id;
  object.dimensions = { ...variant.dimensions, provenance: object.dimensions.provenance };
  object.materialIds = [...variant.materialIds];
  return true;
}
