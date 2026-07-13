import { Placement } from "@/types";

export type AccessoryCategory = "plato" | "sustrato" | "mulch";

export type AccessoryIconKey =
  | "circle-dot"
  | "circle-dashed"
  | "layers"
  | "sprout"
  | "droplets"
  | "leaf"
  | "shell"
  | "mountain"
  | "tree-pine";

export interface Accessory {
  id: string;
  category: AccessoryCategory;
  name: string;
  description: string;
  priceQ: number;
  swatch: string;
  iconKey: AccessoryIconKey;
  placement: Placement;
  attrs: Record<string, string>;
  tags: string[];
  image?: string;
}
