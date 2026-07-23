import type { EpaRetailCategory } from "@/lib/catalog-pricing";
import type { Plant, Planter } from "@/types";
import type { Accessory } from "@/data/accessories";

export type CatalogOverrideKind =
  | "plant"
  | "planter"
  | "plato"
  | "sustrato"
  | "mulch";

export interface CatalogOverrideRow {
  product_key: string;
  source: "epa" | "curated";
  kind: CatalogOverrideKind;
  name: string | null;
  scientific_name: string | null;
  description: string | null;
  short_description: string | null;
  price_q: number | null;
  image_url: string | null;
  images: string[] | null;
  availability: "in_stock" | "out_of_stock" | null;
  hidden: boolean | null;
  attributes: Record<string, string> | null;
  updated_at: string;
  updated_by: string | null;
}

export interface CatalogOverrideInput {
  name?: string | null;
  scientificName?: string | null;
  description?: string | null;
  shortDescription?: string | null;
  priceQ?: number | null;
  imageUrl?: string | null;
  images?: string[] | null;
  availability?: "in_stock" | "out_of_stock" | null;
  hidden?: boolean | null;
  attributes?: Record<string, string> | null;
}

export function epaCategoryToRetailCategory(
  kind: CatalogOverrideKind
): EpaRetailCategory {
  if (kind === "plant") return "plant";
  if (kind === "planter") return "planter";
  if (kind === "plato") return "plato";
  if (kind === "mulch") return "mulch";
  return "sustrato";
}

export function applyOverrideToPlant(
  plant: Plant,
  override: CatalogOverrideRow | undefined
): Plant | null {
  if (override?.hidden) return null;

  if (!override) return plant;

  const images =
    override.images && override.images.length > 0
      ? override.images
      : override.image_url
        ? [override.image_url]
        : plant.images;

  return {
    ...plant,
    name: override.name ?? plant.name,
    scientificName: override.scientific_name ?? plant.scientificName,
    shortDescription: override.short_description ?? plant.shortDescription,
    description: override.description ?? plant.description,
    basePriceQ:
      override.price_q != null ? Number(override.price_q) : plant.basePriceQ,
    images,
    stock:
      override.availability === "out_of_stock"
        ? "agotado"
        : override.availability === "in_stock"
          ? "disponible"
          : plant.stock,
    stockQuantity:
      override.availability === "out_of_stock"
        ? 0
        : override.availability === "in_stock"
          ? Math.max(plant.stockQuantity ?? 1, 1)
          : plant.stockQuantity,
  };
}

export function applyOverrideToPlanter(
  planter: Planter,
  override: CatalogOverrideRow | undefined
): Planter | null {
  if (override?.hidden) return null;
  if (!override) return planter;

  const image = override.image_url ?? override.images?.[0] ?? planter.image;
  const images =
    override.images && override.images.length > 0
      ? override.images
      : image
        ? [image]
        : [planter.image];

  return {
    ...planter,
    name: override.name ?? planter.name,
    shortDescription: override.short_description ?? planter.shortDescription,
    description: override.description ?? planter.description,
    priceQ: override.price_q != null ? Number(override.price_q) : planter.priceQ,
    image,
    colorVariants: [{ color: planter.color, image }],
  };
}

export function applyOverrideToAccessory(
  accessory: Accessory,
  override: CatalogOverrideRow | undefined
): Accessory | null {
  if (override?.hidden) return null;
  if (!override) return accessory;

  const image =
    override.image_url ?? override.images?.[0] ?? accessory.image;

  return {
    ...accessory,
    name: override.name ?? accessory.name,
    description: override.description ?? accessory.description,
    priceQ:
      override.price_q != null ? Number(override.price_q) : accessory.priceQ,
    attrs: { ...accessory.attrs, ...(override.attributes ?? {}) },
    image,
  };
}
