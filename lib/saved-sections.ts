import type { AccessoryCategory } from "@/data/accessories";
import type { SavedPlant } from "@/lib/store";

export type SavedSectionKey = "plant" | "planter" | AccessoryCategory;

export const SAVED_SECTIONS: { key: SavedSectionKey; title: string }[] = [
  { key: "plant", title: "Plantas" },
  { key: "planter", title: "Macetas" },
  { key: "plato", title: "Platos" },
  { key: "sustrato", title: "Sustratos" },
  { key: "mulch", title: "Mulch y cubiertas" },
];

export function resolveSavedSection(item: SavedPlant): SavedSectionKey {
  if (item.kind === "planter") return "planter";
  if (item.kind === "accesorio") {
    if (item.accessoryCategory) return item.accessoryCategory;
    const sub = (item.subtitle ?? "").toLowerCase();
    if (sub.includes("plato")) return "plato";
    if (sub.includes("sustrato")) return "sustrato";
    if (sub.includes("cubierta") || sub.includes("mulch")) return "mulch";
    return "plato";
  }
  return "plant";
}

export function groupSavedBySection(
  items: SavedPlant[]
): Partial<Record<SavedSectionKey, SavedPlant[]>> {
  const groups: Partial<Record<SavedSectionKey, SavedPlant[]>> = {};
  for (const item of items) {
    const key = resolveSavedSection(item);
    if (!groups[key]) groups[key] = [];
    groups[key]!.push(item);
  }
  return groups;
}
