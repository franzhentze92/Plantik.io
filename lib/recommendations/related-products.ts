import { Plant, Planter } from "@/types";
import type { Accessory, AccessoryCategory, AccessoryIconKey } from "@/data/accessories";
import { getCompatiblePlanters } from "@/lib/plant-planter-compat";
import { isCatalogProductId } from "@/lib/catalog-ids";

// Cross-sell recommendations shown on product detail pages. When you view one
// product we suggest up to 4 of every *other* catalog category (e.g. viewing a
// plant → macetas, sustratos, platos, mulch). Fully data-driven from Supabase.

export type RelatedMode = "marketing" | "app";

export type RelatedItem = {
  key: string;
  kind: "plant" | "planter" | "accessory";
  href: string;
  name: string;
  priceQ: number;
  image?: string;
  /** True when product photos should use object-contain on white. */
  useContain: boolean;
  swatch?: string;
  iconKey?: AccessoryIconKey;
};

export type RelatedGroup = {
  key: string;
  title: string;
  items: RelatedItem[];
};

export type CurrentProduct =
  | { kind: "plant"; product: Plant }
  | { kind: "planter"; product: Planter }
  | { kind: "accessory"; product: Accessory };

export type CatalogData = {
  plants: Plant[];
  planters: Planter[];
  accessories: Accessory[];
};

const ITEMS_PER_GROUP = 4;

const ACCESSORY_GROUP_TITLE: Record<AccessoryCategory, string> = {
  plato: "Platos maceteros",
  sustrato: "Sustratos recomendados",
  mulch: "Cubiertas para maceta",
};

function plantHref(mode: RelatedMode, p: Plant): string {
  return mode === "marketing"
    ? `/productos/plantas/${p.slug}`
    : `/app/plantas/${p.slug}`;
}

function planterHref(mode: RelatedMode, p: Planter): string {
  return mode === "marketing"
    ? `/productos/macetas/${p.id}`
    : `/app/macetas/${p.id}`;
}

function accessoryHref(mode: RelatedMode, a: Accessory): string {
  return mode === "marketing"
    ? `/productos/accesorios/${a.id}`
    : `/app/accesorios/${a.id}`;
}

function plantToItem(mode: RelatedMode, p: Plant): RelatedItem {
  return {
    key: `plant-${p.id}`,
    kind: "plant",
    href: plantHref(mode, p),
    name: p.name,
    priceQ: p.basePriceQ,
    image: p.images[0],
    useContain: isCatalogProductId(p.id),
  };
}

function planterToItem(mode: RelatedMode, p: Planter): RelatedItem {
  return {
    key: `planter-${p.id}`,
    kind: "planter",
    href: planterHref(mode, p),
    name: p.name,
    priceQ: p.priceQ,
    image: p.image,
    useContain: isCatalogProductId(p.id),
  };
}

function accessoryToItem(mode: RelatedMode, a: Accessory): RelatedItem {
  return {
    key: `accessory-${a.id}`,
    kind: "accessory",
    href: accessoryHref(mode, a),
    name: a.name,
    priceQ: a.priceQ,
    image: a.image,
    useContain: isCatalogProductId(a.id),
    swatch: a.swatch,
    iconKey: a.iconKey,
  };
}

// Deterministic rotation so each product surfaces a stable but varied slice of
// the catalog (avoids always showing the same first N items).
function seededPick<T>(list: T[], n: number, seed: string): T[] {
  if (list.length <= n) return list.slice();
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  }
  const start = h % list.length;
  const out: T[] = [];
  for (let i = 0; i < n; i++) out.push(list[(start + i) % list.length]);
  return out;
}

function recommendedPlanters(
  plant: Plant,
  planters: Planter[]
): Planter[] {
  const compatible = getCompatiblePlanters(plant.potDiameterCm, planters);
  const chosen = compatible.slice(0, ITEMS_PER_GROUP);
  if (chosen.length < ITEMS_PER_GROUP) {
    const chosenIds = new Set(chosen.map((p) => p.id));
    const rest = planters.filter((p) => !chosenIds.has(p.id));
    chosen.push(...seededPick(rest, ITEMS_PER_GROUP - chosen.length, plant.id));
  }
  return chosen.slice(0, ITEMS_PER_GROUP);
}

function recommendedPlants(planter: Planter, plants: Plant[]): Plant[] {
  const fits = plants
    .filter((pl) => {
      const margin = planter.diameterCm - pl.potDiameterCm;
      return pl.potDiameterCm > 0 && margin >= 1 && margin <= 10;
    })
    .sort((a, b) => b.potDiameterCm - a.potDiameterCm);
  const chosen = fits.slice(0, ITEMS_PER_GROUP);
  if (chosen.length < ITEMS_PER_GROUP) {
    const chosenIds = new Set(chosen.map((p) => p.id));
    const rest = plants.filter((p) => !chosenIds.has(p.id));
    chosen.push(...seededPick(rest, ITEMS_PER_GROUP - chosen.length, planter.id));
  }
  return chosen.slice(0, ITEMS_PER_GROUP);
}

function accessoryGroup(
  mode: RelatedMode,
  category: AccessoryCategory,
  accessories: Accessory[],
  seed: string
): RelatedGroup | null {
  const items = seededPick(
    accessories.filter((a) => a.category === category),
    ITEMS_PER_GROUP,
    seed
  ).map((a) => accessoryToItem(mode, a));
  if (items.length === 0) return null;
  return { key: category, title: ACCESSORY_GROUP_TITLE[category], items };
}

export function buildRelatedProducts(
  current: CurrentProduct,
  data: CatalogData,
  mode: RelatedMode
): RelatedGroup[] {
  const groups: RelatedGroup[] = [];
  const currentId =
    current.kind === "plant"
      ? current.product.id
      : current.kind === "planter"
        ? current.product.id
        : current.product.id;

  const ACCESSORY_CATEGORIES: AccessoryCategory[] = ["sustrato", "plato", "mulch"];

  if (current.kind === "plant") {
    const planters = recommendedPlanters(current.product, data.planters);
    if (planters.length) {
      groups.push({
        key: "macetas",
        title: "Macetas recomendadas",
        items: planters.map((p) => planterToItem(mode, p)),
      });
    }
    for (const cat of ACCESSORY_CATEGORIES) {
      const g = accessoryGroup(mode, cat, data.accessories, currentId);
      if (g) groups.push(g);
    }
  } else if (current.kind === "planter") {
    const plants = recommendedPlants(current.product, data.plants);
    if (plants.length) {
      groups.push({
        key: "plantas",
        title: "Plantas que combinan",
        items: plants.map((p) => plantToItem(mode, p)),
      });
    }
    for (const cat of ACCESSORY_CATEGORIES) {
      const g = accessoryGroup(mode, cat, data.accessories, currentId);
      if (g) groups.push(g);
    }
  } else {
    // Viewing an accessory → suggest plants, planters, and the other accessory
    // categories (skip its own).
    const plants = seededPick(data.plants, ITEMS_PER_GROUP, currentId).map((p) =>
      plantToItem(mode, p)
    );
    if (plants.length) {
      groups.push({ key: "plantas", title: "Plantas que combinan", items: plants });
    }
    const planters = seededPick(data.planters, ITEMS_PER_GROUP, currentId).map((p) =>
      planterToItem(mode, p)
    );
    if (planters.length) {
      groups.push({ key: "macetas", title: "Macetas recomendadas", items: planters });
    }
    for (const cat of ACCESSORY_CATEGORIES) {
      if (cat === current.product.category) continue;
      const g = accessoryGroup(mode, cat, data.accessories, currentId);
      if (g) groups.push(g);
    }
  }

  return groups;
}
