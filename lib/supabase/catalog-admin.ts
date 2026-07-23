import { supabase } from "../supabase";
import {
  applyEpaRetailMarkup,
  EPA_MARKUP_RATE,
  type EpaRetailCategory,
} from "@/lib/catalog-pricing";
import {
  CATALOG_ID_PREFIX,
  isCatalogProductId,
  stripCatalogIdPrefix,
  toCatalogProductId,
} from "@/lib/catalog-ids";
import {
  formatPlantCatalogTitle,
  resolvePlantDisplayName,
} from "@/lib/plant-catalog-names";
import { resolvePlantDescription } from "@/lib/plant-catalog-descriptions";
import { resolvePlanterDisplayName } from "@/lib/planter-catalog-names";
import { resolvePlanterDescription } from "@/lib/planter-catalog-descriptions";
import { resolvePlatoCatalogName } from "@/lib/plato-catalog-names";
import { resolvePlatoDescription } from "@/lib/plato-catalog-descriptions";
import { resolveSustratoCatalogName } from "@/lib/sustrato-catalog-names";
import { resolveSustratoDescription } from "@/lib/sustrato-catalog-descriptions";
import { resolveMulchCatalogName } from "@/lib/mulch-catalog-names";
import { resolveMulchDescription } from "@/lib/mulch-catalog-descriptions";
import type {
  CatalogOverrideInput,
  CatalogOverrideKind,
  CatalogOverrideRow,
} from "@/lib/catalog-overrides";

const PLACEHOLDER_IMAGE = "/images/plant-placeholder.svg";

const MULCH_MATERIAL_RE =
  /\bfibra\b|corteza|musgo|piedra|grava|guijarro|arcilla|mulch|cubierta/;

export type AdminCatalogKind = CatalogOverrideKind;

export interface AdminCatalogProduct {
  id: string;
  productKey: string;
  source: "epa" | "curated";
  kind: AdminCatalogKind;
  epaCategory: string;
  slug: string;
  name: string;
  scientificName?: string;
  description: string;
  shortDescription: string;
  imageUrl: string;
  images: string[];
  wholesalePriceQ: number;
  retailPriceQ: number;
  defaultRetailPriceQ: number;
  markupRate: number;
  availability: "in_stock" | "out_of_stock";
  hidden: boolean;
  hasOverrides: boolean;
  attributes: Record<string, string>;
  updatedAt?: string;
}

export interface AdminCatalogStats {
  total: number;
  plant: number;
  planter: number;
  plato: number;
  sustrato: number;
  mulch: number;
  inStock: number;
  outOfStock: number;
  hidden: number;
  withOverrides: number;
}

export interface AdminCatalogFilter {
  kind?: AdminCatalogKind | "all";
  search?: string;
  availability?: "all" | "in_stock" | "out_of_stock";
  hidden?: "all" | "visible" | "hidden";
  page?: number;
  limit?: number;
}

export interface AdminCatalogResult {
  products: AdminCatalogProduct[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  stats: AdminCatalogStats;
}

interface EpaProductRow {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  category: string;
  price_q: number;
  regular_price_q: number | null;
  on_sale: boolean | null;
  image_url: string | null;
  availability: string;
  attributes: Record<string, string> | null;
  updated_at?: string;
  epa_product_images?: Array<{
    image_url: string;
    is_main: boolean;
    display_order: number;
  }>;
}

function cleanCatalogText(text: string): string {
  return text
    .replace(/\s*\([^)]*[Rr]etiro en [Tt]ienda\)\s*/g, " ")
    .replace(
      /\s*[Dd]isponibles?\s+exclusivamente\s+para\s+retiro\s+en\s+tienda[^.]*\.?/gi,
      " "
    )
    .replace(/\s{2,}/g, " ")
    .trim();
}

function epaIsPlato(name: string): boolean {
  return /^plato\b/.test((name || "").trim().toLowerCase());
}

function epaIsMulch(name: string, attrs: Record<string, string>): boolean {
  const text = [name, attrs.Tipo, attrs["Características adicionales"]]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return MULCH_MATERIAL_RE.test(text);
}

export function classifyEpaProduct(
  category: string,
  name: string,
  attrs: Record<string, string>
): AdminCatalogKind | null {
  if (category === "plantas-naturales") return "plant";
  if (category === "macetas") {
    return epaIsPlato(name) ? "plato" : "planter";
  }
  if (category === "sustratos") {
    return epaIsMulch(name, attrs) ? "mulch" : "sustrato";
  }
  return null;
}

function retailCategoryForKind(kind: AdminCatalogKind): EpaRetailCategory {
  if (kind === "plant") return "plant";
  if (kind === "planter") return "planter";
  if (kind === "plato") return "plato";
  if (kind === "mulch") return "mulch";
  return "sustrato";
}

function extractImages(row: EpaProductRow): string[] {
  const gallery = (row.epa_product_images || [])
    .slice()
    .sort((a, b) => {
      if (a.is_main !== b.is_main) return a.is_main ? -1 : 1;
      return (a.display_order ?? 0) - (b.display_order ?? 0);
    })
    .map((img) => img.image_url)
    .filter(Boolean);

  if (gallery.length > 0) return gallery;
  if (row.image_url) return [row.image_url];
  return [PLACEHOLDER_IMAGE];
}

function buildEpaDisplayName(
  row: EpaProductRow,
  kind: AdminCatalogKind,
  attrs: Record<string, string>
): { name: string; scientificName?: string } {
  if (kind === "plant") {
    const { common, scientific } = resolvePlantDisplayName(
      row.name,
      row.slug,
      attrs
    );
    return {
      name: formatPlantCatalogTitle(common, scientific),
      scientificName: scientific,
    };
  }
  if (kind === "planter") {
    return { name: resolvePlanterDisplayName(row.name, row.slug, attrs) };
  }
  if (kind === "plato") {
    return { name: resolvePlatoCatalogName(row.name, row.slug, attrs) };
  }
  if (kind === "sustrato") {
    return { name: resolveSustratoCatalogName(row.name, row.slug, attrs) };
  }
  return { name: resolveMulchCatalogName(row.name, row.slug, attrs) };
}

function buildEpaDescription(
  row: EpaProductRow,
  kind: AdminCatalogKind,
  attrs: Record<string, string>
): string {
  if (kind === "plant") {
    return resolvePlantDescription(row.slug, row.description || "", cleanCatalogText);
  }
  if (kind === "planter") {
    return resolvePlanterDescription(row.name, row.slug, attrs);
  }
  if (kind === "plato") {
    return resolvePlatoDescription(row.name, row.slug, attrs);
  }
  if (kind === "sustrato") {
    return resolveSustratoDescription(row.name, row.slug, attrs);
  }
  return resolveMulchDescription(row.name, row.slug, attrs);
}

function mapEpaRowToAdminProduct(
  row: EpaProductRow,
  override?: CatalogOverrideRow
): AdminCatalogProduct | null {
  const attrs = row.attributes ?? {};
  const kind = classifyEpaProduct(row.category, row.name, attrs);
  if (!kind) return null;

  const retailCategory = retailCategoryForKind(kind);
  const wholesalePriceQ = Number(row.price_q) || 0;
  const defaultRetailPriceQ = applyEpaRetailMarkup(wholesalePriceQ, retailCategory);
  const markupRate = EPA_MARKUP_RATE[retailCategory] ?? 0;
  const images = extractImages(row);
  const display = buildEpaDisplayName(row, kind, attrs);
  const description = buildEpaDescription(row, kind, attrs);
  const shortDescription =
    description.length > 140 ? `${description.slice(0, 137)}...` : description;

  const base: AdminCatalogProduct = {
    id: toCatalogProductId(row.id),
    productKey: row.id,
    source: "epa",
    kind,
    epaCategory: row.category,
    slug: `${CATALOG_ID_PREFIX}${row.slug}`,
    name: display.name,
    scientificName: display.scientificName,
    description,
    shortDescription,
    imageUrl: images[0] ?? PLACEHOLDER_IMAGE,
    images,
    wholesalePriceQ,
    retailPriceQ: defaultRetailPriceQ,
    defaultRetailPriceQ,
    markupRate,
    availability:
      row.availability === "in_stock" ? "in_stock" : "out_of_stock",
    hidden: false,
    hasOverrides: Boolean(override),
    attributes: attrs,
    updatedAt: override?.updated_at ?? row.updated_at,
  };

  if (!override) return base;

  const overrideImages =
    override.images && override.images.length > 0
      ? override.images
      : override.image_url
        ? [override.image_url]
        : base.images;

  return {
    ...base,
    name: override.name ?? base.name,
    scientificName: override.scientific_name ?? base.scientificName,
    description: override.description ?? base.description,
    shortDescription: override.short_description ?? base.shortDescription,
    imageUrl: overrideImages[0] ?? base.imageUrl,
    images: overrideImages,
    retailPriceQ:
      override.price_q != null ? Number(override.price_q) : base.retailPriceQ,
    availability: override.availability ?? base.availability,
    hidden: override.hidden ?? false,
    hasOverrides: true,
    attributes: { ...base.attributes, ...(override.attributes ?? {}) },
    updatedAt: override.updated_at,
  };
}

async function fetchOverridesMap(): Promise<Map<string, CatalogOverrideRow>> {
  const { data, error } = await supabase.from("catalog_overrides").select("*");
  if (error) {
    console.error("Error fetching catalog overrides:", error);
    throw error;
  }
  return new Map((data ?? []).map((row) => [row.product_key, row as CatalogOverrideRow]));
}

function computeStats(products: AdminCatalogProduct[]): AdminCatalogStats {
  const stats: AdminCatalogStats = {
    total: products.length,
    plant: 0,
    planter: 0,
    plato: 0,
    sustrato: 0,
    mulch: 0,
    inStock: 0,
    outOfStock: 0,
    hidden: 0,
    withOverrides: 0,
  };

  for (const product of products) {
    stats[product.kind] += 1;
    if (product.availability === "in_stock") stats.inStock += 1;
    else stats.outOfStock += 1;
    if (product.hidden) stats.hidden += 1;
    if (product.hasOverrides) stats.withOverrides += 1;
  }

  return stats;
}

function filterProducts(
  products: AdminCatalogProduct[],
  filters: AdminCatalogFilter
): AdminCatalogProduct[] {
  const search = filters.search?.trim().toLowerCase();

  return products.filter((product) => {
    if (filters.kind && filters.kind !== "all" && product.kind !== filters.kind) {
      return false;
    }
    if (
      filters.availability &&
      filters.availability !== "all" &&
      product.availability !== filters.availability
    ) {
      return false;
    }
    if (filters.hidden === "visible" && product.hidden) return false;
    if (filters.hidden === "hidden" && !product.hidden) return false;
    if (search) {
      const haystack = [
        product.name,
        product.scientificName,
        product.id,
        product.slug,
        product.description,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      if (!haystack.includes(search)) return false;
    }
    return true;
  });
}

export async function getAllCatalogProductsAdmin(
  filters: AdminCatalogFilter = {}
): Promise<AdminCatalogResult> {
  const page = Math.max(1, filters.page ?? 1);
  const limit = Math.min(100, Math.max(1, filters.limit ?? 24));

  const [epaResult, overridesMap] = await Promise.all([
    supabase
      .from("epa_products")
      .select(
        `
        id,
        slug,
        name,
        description,
        category,
        price_q,
        regular_price_q,
        on_sale,
        image_url,
        availability,
        attributes,
        updated_at,
        epa_product_images(image_url, is_main, display_order)
      `
      )
      .order("name"),
    fetchOverridesMap(),
  ]);

  if (epaResult.error) {
    console.error("Error fetching EPA products:", epaResult.error);
    throw epaResult.error;
  }

  const allProducts = (epaResult.data ?? [])
    .map((row) =>
      mapEpaRowToAdminProduct(
        row as EpaProductRow,
        overridesMap.get((row as EpaProductRow).id)
      )
    )
    .filter(Boolean) as AdminCatalogProduct[];

  const stats = computeStats(allProducts);
  const filtered = filterProducts(allProducts, filters);
  const total = filtered.length;
  const offset = (page - 1) * limit;
  const products = filtered.slice(offset, offset + limit);

  return {
    products,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    },
    stats,
  };
}

export async function getCatalogProductAdmin(
  publicId: string
): Promise<AdminCatalogProduct | null> {
  const productKey = isCatalogProductId(publicId)
    ? stripCatalogIdPrefix(publicId)
    : publicId;

  const [epaResult, overrideResult] = await Promise.all([
    supabase
      .from("epa_products")
      .select(
        `
        id,
        slug,
        name,
        description,
        category,
        price_q,
        regular_price_q,
        on_sale,
        image_url,
        availability,
        attributes,
        updated_at,
        epa_product_images(image_url, is_main, display_order)
      `
      )
      .eq("id", productKey)
      .maybeSingle(),
    supabase
      .from("catalog_overrides")
      .select("*")
      .eq("product_key", productKey)
      .maybeSingle(),
  ]);

  if (epaResult.error) {
    console.error("Error fetching catalog product:", epaResult.error);
    throw epaResult.error;
  }

  if (!epaResult.data) return null;

  return mapEpaRowToAdminProduct(
    epaResult.data as EpaProductRow,
    (overrideResult.data as CatalogOverrideRow | null) ?? undefined
  );
}

export async function upsertCatalogOverride(
  publicId: string,
  input: CatalogOverrideInput,
  updatedBy: string
): Promise<AdminCatalogProduct> {
  const productKey = isCatalogProductId(publicId)
    ? stripCatalogIdPrefix(publicId)
    : publicId;

  const existing = await getCatalogProductAdmin(publicId);
  if (!existing) {
    throw new Error("Producto no encontrado.");
  }

  const payload = {
    product_key: productKey,
    source: existing.source,
    kind: existing.kind,
    name: input.name ?? existing.name,
    scientific_name: input.scientificName ?? existing.scientificName ?? null,
    description: input.description ?? existing.description,
    short_description: input.shortDescription ?? existing.shortDescription,
    price_q: input.priceQ ?? existing.retailPriceQ,
    image_url: input.imageUrl ?? existing.imageUrl,
    images: input.images ?? existing.images,
    availability: input.availability ?? existing.availability,
    hidden: input.hidden ?? existing.hidden,
    attributes: input.attributes ?? existing.attributes,
    updated_at: new Date().toISOString(),
    updated_by: updatedBy,
  };

  const { error } = await supabase
    .from("catalog_overrides")
    .upsert(payload, { onConflict: "product_key" });

  if (error) {
    console.error("Error saving catalog override:", error);
    throw error;
  }

  const updated = await getCatalogProductAdmin(publicId);
  if (!updated) throw new Error("No se pudo cargar el producto actualizado.");
  return updated;
}

export async function resetCatalogOverride(publicId: string): Promise<void> {
  const productKey = isCatalogProductId(publicId)
    ? stripCatalogIdPrefix(publicId)
    : publicId;

  const { error } = await supabase
    .from("catalog_overrides")
    .delete()
    .eq("product_key", productKey);

  if (error) {
    console.error("Error resetting catalog override:", error);
    throw error;
  }
}

export async function getCatalogOverridesMapAdmin(): Promise<
  Map<string, CatalogOverrideRow>
> {
  return fetchOverridesMap();
}
