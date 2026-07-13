import {
  CircleDashed,
  CircleDot,
  Droplets,
  Layers,
  Leaf,
  Mountain,
  Shell,
  Sprout,
  TreePine,
  type LucideIcon,
} from "lucide-react";
import type { AccessoryIconKey } from "@/data/accessories";

export const ACCESSORY_ICONS: Record<AccessoryIconKey, LucideIcon> = {
  "circle-dot": CircleDot,
  "circle-dashed": CircleDashed,
  layers: Layers,
  sprout: Sprout,
  droplets: Droplets,
  leaf: Leaf,
  shell: Shell,
  mountain: Mountain,
  "tree-pine": TreePine,
};
