import { CircleDashed, type LucideIcon } from "lucide-react";
import type { Accessory, AccessoryCategory } from "./accessories";
import { ACCESSORY_ICONS } from "@/lib/accessory-icons";

export interface BuildOption {
  id: string;
  name: string;
  description: string;
  priceQ: number;
  swatch: string;
  icon: LucideIcon;
  image?: string;
}

function toBuildOption(a: Accessory): BuildOption {
  return {
    id: a.id,
    name: a.name,
    description: a.description,
    priceQ: a.priceQ,
    swatch: a.swatch,
    icon: ACCESSORY_ICONS[a.iconKey],
    image: a.image,
  };
}

const SIN_PLATO: BuildOption = {
  id: "sin-plato",
  name: "Sin plato",
  description: "Ideal si tu maceta ya tiene base o va en exterior.",
  priceQ: 0,
  swatch: "#E8E2D4",
  icon: CircleDashed,
};

const SIN_MULCH: BuildOption = {
  id: "sin-mulch",
  name: "Sin cubierta",
  description: "Deja el sustrato a la vista.",
  priceQ: 0,
  swatch: "#E8E2D4",
  icon: CircleDashed,
};

export function buildSaucers(accessories: Accessory[]): BuildOption[] {
  return [
    SIN_PLATO,
    ...accessories.filter((a) => a.category === "plato").map(toBuildOption),
  ];
}

export function buildSoils(accessories: Accessory[]): BuildOption[] {
  return accessories
    .filter((a) => a.category === "sustrato")
    .map(toBuildOption);
}

export function buildMulches(accessories: Accessory[]): BuildOption[] {
  return [
    SIN_MULCH,
    ...accessories.filter((a) => a.category === "mulch").map(toBuildOption),
  ];
}

export function getBuildOption(
  list: BuildOption[],
  id: string | null
): BuildOption | undefined {
  return id ? list.find((o) => o.id === id) : undefined;
}

export function findAccessory(
  accessories: Accessory[],
  category: AccessoryCategory,
  id: string | null
): Accessory | undefined {
  if (!id) return undefined;
  return accessories.find((a) => a.id === id && a.category === category);
}
