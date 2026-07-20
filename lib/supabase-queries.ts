import { supabase } from "./supabase";
import { Plant, Planter } from "@/types";
import type { Accessory, AccessoryCategory } from "@/data/accessories";
import {
  CATALOG_ID_PREFIX,
  catalogStyleLabel,
  isCatalogProductId,
  stripCatalogIdPrefix,
} from "@/lib/catalog-ids";

const PLANT_PLACEHOLDER_IMAGE = "/images/plant-placeholder.svg";

// Below this many units in stock a product is flagged as "few units left".
const LOW_STOCK_THRESHOLD = 5;

/** Strip source-vendor pickup-only disclaimers from product titles and descriptions. */
function cleanCatalogText(text: string): string {
  return text
    .replace(/\s*\([^)]*[Rr]etiro en [Tt]ienda\)\s*/g, " ")
    .replace(
      /\s*[Dd]isponibles?\s+exclusivamente\s+para\s+retiro\s+en\s+tienda[^.]*\.?/gi,
      " "
    )
    .replace(/\s*[ÚúUu]nicamente\s+para\s+retiro\s+en\s+tienda[^.]*\.?/gi, " ")
    .replace(/\s{2,}/g, " ")
    .replace(/\s+\./g, ".")
    .trim();
}

function cleanCatalogName(name: string): string {
  return cleanCatalogText(name);
}

const PLANT_SELECT = `
  id,
  slug,
  commercial_name,
  scientific_name,
  short_description,
  description,
  price_q,
  mature_height_cm,
  current_size_cm,
  pot_diameter_cm,
  light_level,
  care_difficulty,
  watering_frequency_days,
  pet_friendly,
  indoor_outdoor,
  categories,
  smart_care_compatible,
  available,
  stock_quantity,
  plant_images(image_url, display_order),
  plant_variants(id, size_label, height_cm, price_q, stock_quantity)
`;

function stockLevel(
  available: boolean,
  quantity: number
): Plant["stock"] {
  if (!available || quantity <= 0) return "agotado";
  if (quantity <= LOW_STOCK_THRESHOLD) return "pocas_unidades";
  return "disponible";
}

function mapPlantRow(p: any): Plant {
  const currentHeightCm = p.current_size_cm || 0;
  const stockQuantity = p.stock_quantity ?? 0;
  const sizes = (p.plant_variants || [])
    .map((v: any) => ({
      id: v.id,
      label: v.size_label,
      priceQ: Number(v.price_q),
      heightCm: v.height_cm ?? undefined,
      stock: v.stock_quantity ?? undefined,
    }))
    .sort((a: any, b: any) => a.priceQ - b.priceQ);

  const orderedImages = (p.plant_images || [])
    .slice()
    .sort((a: any, b: any) => (a.display_order ?? 0) - (b.display_order ?? 0))
    .map((img: any) => img.image_url)
    .filter(Boolean);

  return {
    id: p.id,
    slug: p.slug,
    name: p.commercial_name,
    scientificName: p.scientific_name,
    shortDescription: p.short_description || "",
    description: p.description || "",
    category: (p.categories || "").split(",").filter(Boolean),
    sizes,
    basePriceQ: Number(p.price_q),
    light: p.light_level || "media",
    care: p.care_difficulty || "facil",
    wateringFrequencyDays: p.watering_frequency_days || 7,
    petFriendly: p.pet_friendly || false,
    placement: p.indoor_outdoor || "interior",
    currentHeightCm,
    matureHeightCm: p.mature_height_cm || 0,
    potDiameterCm: p.pot_diameter_cm || 0,
    smartCareCompatible: p.smart_care_compatible || false,
    stock: stockLevel(p.available ?? true, stockQuantity),
    stockQuantity,
    tags: (p.categories || "")
      .split(",")
      .filter(Boolean)
      .concat(p.pet_friendly ? ["pet-friendly"] : []),
    images: orderedImages.length > 0 ? orderedImages : [PLANT_PLACEHOLDER_IMAGE],
  };
}

// ─────────────────── Imported catalog → Plant mapping ───────────────────
const IMPORTED_PLANT_CATEGORY = "plantas-naturales";

const IMPORTED_PLANT_SELECT = `
  id,
  name,
  slug,
  description,
  price_q,
  regular_price_q,
  on_sale,
  image_url,
  availability,
  attributes,
  epa_product_images(image_url, is_main, display_order)
`;

function epaParseMaxDimensionCm(attrs: Record<string, string>): number {
  const dims = attrs?.["Dimensión del empaque (cm)"] || "";
  const nums = (dims.match(/[\d.]+/g) || []).map(Number).filter((n) => !isNaN(n));
  return nums.length ? Math.round(Math.max(...nums)) : 0;
}

function epaPlantLight(attrs: Record<string, string>): Plant["light"] {
  const text = [
    attrs["Características adicionales"],
    attrs["Luz"],
    attrs["Tipo"],
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  if (text.includes("luz baja") || text.includes("poca luz")) return "baja";
  if (
    text.includes("luz alta") ||
    text.includes("mucho sol") ||
    text.includes("pleno sol")
  ) {
    return "alta";
  }
  return "media";
}

function epaPlantCare(attrs: Record<string, string>): Plant["care"] {
  const text = (attrs["Tipo"] || attrs["Riego"] || "").toLowerCase();
  if (text.includes("fácil") || text.includes("facil") || text.includes("bajo")) {
    return "facil";
  }
  if (text.includes("exigente") || text.includes("alto")) return "exigente";
  return "moderado";
}

function epaPlantPlacement(attrs: Record<string, string>): Plant["placement"] {
  const use = (attrs?.["Uso recomendado"] || "").toLowerCase();
  const interior = use.includes("interior");
  const exterior =
    use.includes("exterior") || use.includes("jardín") || use.includes("jardin");
  if (interior && exterior) return "ambos";
  if (exterior) return "exterior";
  if (interior) return "interior";
  return "ambos";
}

function epaScientificName(attrs: Record<string, string>): string {
  return (
    attrs["Nombre científico"] ||
    attrs["Nombre botánico"] ||
    attrs["Especie"] ||
    "Planta natural"
  );
}

function mapEpaProductToPlant(p: any): Plant {
  const attrs: Record<string, string> = p.attributes || {};
  const sizeCm = epaParseMaxDimensionCm(attrs);
  const images = (p.epa_product_images || [])
    .slice()
    .sort((a: any, b: any) => {
      if (a.is_main !== b.is_main) return a.is_main ? -1 : 1;
      return (a.display_order ?? 0) - (b.display_order ?? 0);
    })
    .map((img: any) => img.image_url)
    .filter(Boolean);
  if (images.length === 0 && p.image_url) images.push(p.image_url);

  const description = cleanCatalogText(p.description || "");
  const shortDescription =
    description.length > 140 ? `${description.slice(0, 137)}...` : description;

  return {
    id: `${CATALOG_ID_PREFIX}${p.id}`,
    slug: `${CATALOG_ID_PREFIX}${p.slug}`,
    name: cleanCatalogName(p.name),
    scientificName: epaScientificName(attrs),
    shortDescription,
    description,
    category: ["plantas-naturales"],
    sizes: [],
    basePriceQ: Number(p.price_q),
    light: epaPlantLight(attrs),
    care: epaPlantCare(attrs),
    wateringFrequencyDays: 7,
    petFriendly: false,
    placement: epaPlantPlacement(attrs),
    currentHeightCm: sizeCm,
    matureHeightCm: sizeCm,
    potDiameterCm: sizeCm > 0 ? Math.min(sizeCm, 40) : 0,
    smartCareCompatible: false,
    stock: p.availability === "in_stock" ? "disponible" : "agotado",
    stockQuantity: p.availability === "in_stock" ? 10 : 0,
    tags: ["plantas-naturales"],
    images: images.length > 0 ? images : [PLANT_PLACEHOLDER_IMAGE],
  };
}

async function getEpaPlantRow(filter: { id?: string; slug?: string }) {
  let query = supabase
    .from("epa_products")
    .select(IMPORTED_PLANT_SELECT)
    .eq("category", IMPORTED_PLANT_CATEGORY);

  if (filter.id) query = query.eq("id", filter.id);
  if (filter.slug) query = query.eq("slug", filter.slug);

  const { data, error } = await query.maybeSingle();
  if (error) {
    console.error("Error fetching catalog plant:", error);
    return null;
  }
  return data;
}

async function getEpaPlants(): Promise<Plant[]> {
  const { data, error } = await supabase
    .from("epa_products")
    .select(IMPORTED_PLANT_SELECT)
    .eq("category", IMPORTED_PLANT_CATEGORY)
    .eq("availability", "in_stock")
    .order("name");

  if (error) {
    console.error("Error fetching catalog plants:", error);
    return [];
  }

  return (data || [])
    .filter((p: any) => p.image_url || (p.epa_product_images || []).length > 0)
    .map(mapEpaProductToPlant);
}

export async function getPlantsFromDB(): Promise<Plant[]> {
  const [curatedResult, epaPlants] = await Promise.all([
    supabase.from("plants").select(PLANT_SELECT),
    getEpaPlants(),
  ]);

  if (curatedResult.error) {
    console.error("Error fetching plants:", curatedResult.error);
    return epaPlants;
  }

  const curated = (curatedResult.data || []).map(mapPlantRow);
  return [...curated, ...epaPlants];
}

// Client-side in-memory cache so re-entering the catalog doesn't re-query
// Supabase on every mount. The promise is reused for the lifetime of the tab.
let plantsCachePromise: Promise<Plant[]> | null = null;

export function getPlantsCached(): Promise<Plant[]> {
  if (!plantsCachePromise) {
    plantsCachePromise = getPlantsFromDB().catch((error) => {
      plantsCachePromise = null;
      throw error;
    });
  }
  return plantsCachePromise;
}

export async function getAllPlantSlugs(): Promise<string[]> {
  const [curatedResult, epaResult] = await Promise.all([
    supabase.from("plants").select("slug"),
    supabase
      .from("epa_products")
      .select("slug")
      .eq("category", IMPORTED_PLANT_CATEGORY)
      .eq("availability", "in_stock"),
  ]);

  if (curatedResult.error) {
    console.error("Error fetching plant slugs:", curatedResult.error);
  }
  if (epaResult.error) {
    console.error("Error fetching catalog plant slugs:", epaResult.error);
  }

  const curated = (curatedResult.data || [])
    .map((row: { slug: string }) => row.slug)
    .filter(Boolean);
  const epa = (epaResult.data || [])
    .map((row: { slug: string }) => `${CATALOG_ID_PREFIX}${row.slug}`)
    .filter(Boolean);

  return [...curated, ...epa];
}

export async function getPlantById(id: string): Promise<Plant | null> {
  if (isCatalogProductId(id)) {
    const catalogId = stripCatalogIdPrefix(id);
    const data = await getEpaPlantRow({ id: catalogId });
    return data ? mapEpaProductToPlant(data) : null;
  }

  const { data: plant, error } = await supabase
    .from("plants")
    .select(PLANT_SELECT)
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("Error fetching plant by id:", error);
    return null;
  }

  if (!plant) {
    return getPlantBySlug(id);
  }

  return mapPlantRow(plant);
}

export async function getPlantBySlug(slug: string): Promise<Plant | null> {
  if (isCatalogProductId(slug)) {
    const catalogSlug = stripCatalogIdPrefix(slug);
    const data = await getEpaPlantRow({ slug: catalogSlug });
    return data ? mapEpaProductToPlant(data) : null;
  }

  const { data: plant, error } = await supabase
    .from("plants")
    .select(PLANT_SELECT)
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    console.error("Error fetching plant:", error);
    return null;
  }

  if (!plant) return null;

  return mapPlantRow(plant);
}

export async function searchPlants(filters: {
  light?: string;
  petFriendly?: boolean;
  care?: string;
  category?: string;
}): Promise<Plant[]> {
  let query = supabase.from("plants").select(PLANT_SELECT);

  if (filters.light) {
    query = query.eq("light_level", filters.light);
  }
  if (filters.petFriendly) {
    query = query.eq("pet_friendly", true);
  }
  if (filters.care) {
    query = query.eq("care_difficulty", filters.care);
  }
  if (filters.category) {
    query = query.ilike("categories", `%${filters.category}%`);
  }

  const { data: plants, error } = await query.eq("available", true);

  if (error) {
    console.error("Error searching plants:", error);
    return [];
  }

  return (plants || []).map(mapPlantRow);
}

const PLANTER_SELECT = `
  id,
  name,
  material,
  color,
  size,
  diameter_cm,
  style,
  price_q,
  drainage,
  indoor_outdoor,
  image_url,
  planter_color_variants(color, image_url)
`;

function mapPlanterRow(p: any): Planter {
  const variants = (p.planter_color_variants || []).map((v: any) => ({
    color: v.color,
    image: v.image_url,
  }));

  return {
    id: p.id,
    name: p.name,
    material: p.material,
    color: p.color,
    size: p.size,
    diameterCm: p.diameter_cm,
    style: p.style,
    priceQ: Number(p.price_q),
    drainage: p.drainage,
    placement: p.indoor_outdoor || "interior",
    image: p.image_url,
    colorVariants:
      variants.length > 0
        ? variants
        : [{ color: p.color, image: p.image_url }],
  };
}

// ─────────────────── Imported catalog → Planter mapping ───────────────────
// Public ids use a neutral `pk-` prefix so routes don't expose the source vendor.

const IMPORTED_PLANTER_SELECT =
  "id, name, price_q, regular_price_q, on_sale, image_url, availability, attributes";

function epaParseDiameterCm(attrs: Record<string, string>): number {
  const dims =
    attrs?.["Armado (AltoxAnchoxLargo) (cm)"] ||
    attrs?.["Dimensión del empaque (cm)"] ||
    "";
  const nums = (dims.match(/[\d.]+/g) || []).map(Number).filter((n) => !isNaN(n));
  return nums.length ? Math.round(Math.max(...nums)) : 0;
}

function epaTalla(diameterCm: number): string {
  if (diameterCm <= 0) return "M";
  if (diameterCm <= 18) return "S";
  if (diameterCm <= 35) return "M";
  return "L";
}

function epaPlacement(attrs: Record<string, string>): Planter["placement"] {
  const use = (attrs?.["Uso recomendado"] || "").toLowerCase();
  const interior = use.includes("interior");
  const exterior = use.includes("exterior");
  if (interior && exterior) return "ambos";
  if (exterior) return "exterior";
  if (interior) return "interior";
  return "ambos";
}

function mapEpaProductToPlanter(p: any): Planter {
  const attrs: Record<string, string> = p.attributes || {};
  const diameterCm = epaParseDiameterCm(attrs);
  const color = attrs["Color"] || "Natural";
  const image = p.image_url;

  return {
    id: `${CATALOG_ID_PREFIX}${p.id}`,
    name: cleanCatalogName(p.name),
    material: attrs["Material"] || "Plástico",
    color,
    size: epaTalla(diameterCm),
    diameterCm,
    style: catalogStyleLabel(attrs["Colección"], attrs["Diseño"]),
    priceQ: Number(p.price_q),
    drainage: true,
    placement: epaPlacement(attrs),
    image,
    colorVariants: [{ color, image }],
  };
}

async function getEpaPlanters(): Promise<Planter[]> {
  const { data, error } = await supabase
    .from("epa_products")
    .select(IMPORTED_PLANTER_SELECT)
    .eq("category", "macetas")
    .eq("availability", "in_stock")
    .order("name");

  if (error) {
    console.error("Error fetching catalog planters:", error);
    return [];
  }

  return (data || [])
    .filter((p: any) => p.image_url && !epaIsPlato(p.name))
    .map(mapEpaProductToPlanter);
}

export async function getPlantersFromDB(): Promise<Planter[]> {
  const [curatedResult, epaPlanters] = await Promise.all([
    supabase.from("planters").select(PLANTER_SELECT).eq("available", true).order("name"),
    getEpaPlanters(),
  ]);

  if (curatedResult.error) {
    console.error("Error fetching planters:", curatedResult.error);
    return epaPlanters;
  }

  const curated = (curatedResult.data || []).map(mapPlanterRow);
  return [...curated, ...epaPlanters];
}

let plantersCachePromise: Promise<Planter[]> | null = null;

export function getPlantersCached(): Promise<Planter[]> {
  if (!plantersCachePromise) {
    plantersCachePromise = getPlantersFromDB().catch((error) => {
      plantersCachePromise = null;
      throw error;
    });
  }
  return plantersCachePromise;
}

export async function getPlanterById(id: string): Promise<Planter | null> {
  if (isCatalogProductId(id)) {
    const catalogId = stripCatalogIdPrefix(id);
    const { data, error } = await supabase
      .from("epa_products")
      .select(IMPORTED_PLANTER_SELECT)
      .eq("id", catalogId)
      .maybeSingle();

    if (error) {
      console.error("Error fetching catalog planter:", error);
      return null;
    }

    return data ? mapEpaProductToPlanter(data) : null;
  }

  const { data, error } = await supabase
    .from("planters")
    .select(PLANTER_SELECT)
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("Error fetching planter:", error);
    return null;
  }

  return data ? mapPlanterRow(data) : null;
}

function mapAccessoryRow(a: any): Accessory {
  return {
    id: a.id,
    category: a.category as AccessoryCategory,
    name: a.name,
    description: a.description,
    priceQ: Number(a.price_q),
    swatch: a.swatch,
    iconKey: a.icon_key,
    placement: a.indoor_outdoor || "ambos",
    attrs: a.attrs || {},
    tags: a.tags || [],
  };
}

// ───────────────── EPA imported catalog → Accessory mapping ─────────────────
// EPA has no "mulch" or "platos" listings, so those products live inside other
// EPA listings: mulch (cubierta) inside "sustratos", and pot saucers ("platos")
// inside "macetas". We pull those EPA categories here and classify each product
// into our "sustrato", "mulch" or "plato" accessory category.
const IMPORTED_ACCESSORY_SOURCE_CATEGORIES = ["sustratos", "macetas"];

const IMPORTED_ACCESSORY_SELECT = `
  id,
  name,
  category,
  description,
  price_q,
  image_url,
  availability,
  attributes,
  epa_product_images(image_url, is_main, display_order)
`;

function epaAccessoryPlacement(attrs: Record<string, string>): Accessory["placement"] {
  const use = (attrs?.["Uso recomendado"] || "").toLowerCase();
  const interior = use.includes("interior");
  const exterior =
    use.includes("exterior") ||
    use.includes("jardín") ||
    use.includes("jardin") ||
    use.includes("jardines");
  if (interior && exterior) return "ambos";
  if (exterior) return "exterior";
  if (interior) return "interior";
  return "ambos";
}

// EPA has no dedicated "platos" listing: pot saucers live inside the EPA
// "macetas" catalog. We only treat a product as a saucer when its name *starts*
// with "plato" (e.g. "Plato para maceta …"); this avoids false positives such
// as "Maceta clásica … con plato", which is a planter that ships with a saucer.
function epaIsPlato(name: string): boolean {
  return /^plato\b/.test((name || "").trim().toLowerCase());
}

function epaPlatoMaterial(attrs: Record<string, string>): string {
  const m = (attrs?.["Material"] || "").toLowerCase();
  if (m.includes("cerámic") || m.includes("ceramic") || m.includes("cerám")) {
    return "ceramica";
  }
  if (m.includes("barro") || m.includes("terracota")) return "barro";
  if (m.includes("bamb")) return "bambu";
  if (m.includes("metal") || m.includes("acero") || m.includes("hierro")) {
    return "metal";
  }
  return "plastico";
}

const PLATO_COLOR_SWATCH: Record<string, string> = {
  blanco: "#F5F1E8",
  negro: "#2A2A2A",
  terracota: "#B5734A",
  crema: "#E8DCC0",
  gris: "#9C9C94",
  madera: "#C9A66B",
  transparente: "#DCE6E4",
};

function epaPlatoColor(
  name: string,
  attrs: Record<string, string>
): string | undefined {
  const text = [name, attrs?.["Color"]].filter(Boolean).join(" ").toLowerCase();
  if (text.includes("blanc") || text.includes("white")) return "blanco";
  if (
    text.includes("negr") ||
    text.includes("anthracite") ||
    text.includes("antracita") ||
    text.includes("black")
  ) {
    return "negro";
  }
  if (text.includes("terracota") || text.includes("teja") || text.includes("rojo")) {
    return "terracota";
  }
  if (
    text.includes("crema") ||
    text.includes("beige") ||
    text.includes("marfil") ||
    text.includes("cream")
  ) {
    return "crema";
  }
  if (text.includes("transparente")) return "transparente";
  if (
    text.includes("madera") ||
    text.includes("café") ||
    text.includes("cafe") ||
    text.includes("marrón") ||
    text.includes("marron") ||
    text.includes("chocolate") ||
    text.includes("wood")
  ) {
    return "madera";
  }
  if (
    text.includes("gris") ||
    text.includes("gray") ||
    text.includes("grey") ||
    text.includes("taupe")
  ) {
    return "gris";
  }
  return undefined;
}

function epaSustratoTipo(name: string, attrs: Record<string, string>): string {
  const text = [name, attrs.Tipo, attrs["Características adicionales"]]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  if (text.includes("suculent") || text.includes("cactus")) return "suculentas";
  if (text.includes("orquídea") || text.includes("orquidea")) return "orquideas";
  if (text.includes("tropical")) return "tropical";
  if (text.includes("siembra") || text.includes("germin")) return "siembra";
  return "universal";
}

function epaSustratoAditivo(
  name: string,
  attrs: Record<string, string>
): string | undefined {
  const text = [name, attrs.Tipo, attrs["Características adicionales"]]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  if (text.includes("coco")) return "coco";
  if (text.includes("humus") || text.includes("lombri")) return "humus";
  if (text.includes("perlita")) return "perlita";
  if (text.includes("corteza")) return "corteza";
  if (text.includes("turba")) return "turba";
  return undefined;
}

// A product from the EPA "sustratos" listing is treated as mulch (cubierta)
// when its material is a surface-cover material rather than a growing medium.
const MULCH_MATERIAL_RE =
  /\bfibra\b|corteza|musgo|piedra|grava|guijarro|arcilla|mulch|cubierta/;

function epaIsMulch(name: string, attrs: Record<string, string>): boolean {
  const text = [name, attrs.Tipo, attrs["Características adicionales"]]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return MULCH_MATERIAL_RE.test(text);
}

function epaMulchTipo(name: string, attrs: Record<string, string>): string {
  const text = [name, attrs.Tipo].filter(Boolean).join(" ").toLowerCase();
  if (text.includes("corteza")) return "corteza";
  if (text.includes("musgo")) return "musgo";
  if (
    text.includes("piedra") ||
    text.includes("grava") ||
    text.includes("guijarro")
  ) {
    return "piedra";
  }
  if (text.includes("arcilla")) return "arcilla";
  return "fibra";
}

function epaMulchColor(name: string): string | undefined {
  const text = name.toLowerCase();
  if (
    text.includes("coco") ||
    text.includes("café") ||
    text.includes("cafe") ||
    text.includes("marrón") ||
    text.includes("marron")
  ) {
    return "cafe";
  }
  if (text.includes("blanc")) return "blanco";
  if (text.includes("negr")) return "negro";
  if (text.includes("gris")) return "gris";
  if (text.includes("verde") || text.includes("musgo")) return "verde";
  if (text.includes("terracota") || text.includes("rojo")) return "terracota";
  return undefined;
}

function epaMulchFuncion(name: string, attrs: Record<string, string>): string {
  const text = [name, attrs["Características adicionales"], attrs.Tipo]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  if (
    text.includes("humedad") ||
    text.includes("retien") ||
    text.includes("retenc") ||
    text.includes("fibra") ||
    text.includes("coco")
  ) {
    return "humedad";
  }
  return "decorativo";
}

function epaAccessoryIconKey(
  category: AccessoryCategory,
  name: string,
  attrs: Record<string, string>
): Accessory["iconKey"] {
  if (category === "mulch") {
    const tipo = epaMulchTipo(name, attrs);
    if (tipo === "corteza") return "tree-pine";
    if (tipo === "piedra" || tipo === "arcilla") return "mountain";
    if (tipo === "musgo") return "leaf";
    if (tipo === "fibra") return "shell";
    return "layers";
  }
  const aditivo = epaSustratoAditivo(name, attrs);
  if (aditivo === "coco") return "shell";
  if (aditivo === "humus") return "leaf";
  return "layers";
}

function epaAccessorySwatch(name: string): string {
  const text = name.toLowerCase();
  if (text.includes("coco")) return "#C9A66B";
  if (text.includes("turba")) return "#4A3728";
  if (text.includes("perlita")) return "#E8E4DC";
  return "#8B7355";
}

function mapEpaProductToAccessory(p: any): Accessory {
  const attrs: Record<string, string> = p.attributes || {};
  const category: AccessoryCategory = epaIsPlato(p.name)
    ? "plato"
    : epaIsMulch(p.name, attrs)
      ? "mulch"
      : "sustrato";
  const accessoryAttrs: Record<string, string> = {};
  let swatch: string;

  if (category === "plato") {
    accessoryAttrs.material = epaPlatoMaterial(attrs);
    accessoryAttrs.talla = epaTalla(epaParseDiameterCm(attrs));
    const color = epaPlatoColor(p.name, attrs);
    if (color) accessoryAttrs.color = color;
    swatch = (color && PLATO_COLOR_SWATCH[color]) || "#9C9C94";
  } else if (category === "mulch") {
    accessoryAttrs.tipo = epaMulchTipo(p.name, attrs);
    const color = epaMulchColor(p.name);
    if (color) accessoryAttrs.color = color;
    accessoryAttrs.funcion = epaMulchFuncion(p.name, attrs);
    swatch = epaAccessorySwatch(p.name);
  } else {
    accessoryAttrs.tipo = epaSustratoTipo(p.name, attrs);
    const aditivo = epaSustratoAditivo(p.name, attrs);
    if (aditivo) accessoryAttrs.aditivo = aditivo;
    swatch = epaAccessorySwatch(p.name);
  }

  const images = (p.epa_product_images || [])
    .slice()
    .sort((a: any, b: any) => {
      if (a.is_main !== b.is_main) return a.is_main ? -1 : 1;
      return (a.display_order ?? 0) - (b.display_order ?? 0);
    })
    .map((img: any) => img.image_url)
    .filter(Boolean);
  const image = images[0] || p.image_url || undefined;

  return {
    id: `${CATALOG_ID_PREFIX}${p.id}`,
    category,
    name: cleanCatalogName(p.name),
    description: cleanCatalogText(p.description || ""),
    priceQ: Number(p.price_q),
    swatch,
    iconKey:
      category === "plato"
        ? "circle-dot"
        : epaAccessoryIconKey(category, p.name, attrs),
    placement: epaAccessoryPlacement(attrs),
    attrs: accessoryAttrs,
    tags: [p.category].filter(Boolean),
    image,
  };
}

async function getEpaAccessoryRow(id: string) {
  const { data, error } = await supabase
    .from("epa_products")
    .select(IMPORTED_ACCESSORY_SELECT)
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("Error fetching catalog accessory:", error);
    return null;
  }
  return data;
}

async function getEpaAccessories(): Promise<Accessory[]> {
  const { data, error } = await supabase
    .from("epa_products")
    .select(IMPORTED_ACCESSORY_SELECT)
    .in("category", IMPORTED_ACCESSORY_SOURCE_CATEGORIES)
    .order("name");

  if (error) {
    console.error("Error fetching catalog accessories:", error);
    return [];
  }

  return (data || [])
    .filter(
      (p: any) => p.image_url || (p.epa_product_images || []).length > 0
    )
    .filter((p: any) => {
      // From the "macetas" listing we only want pot saucers; everything else in
      // that category stays a planter. EPA has all saucers flagged out of stock,
      // so we still surface them (marked out of stock) instead of hiding them.
      if (p.category === "macetas") return epaIsPlato(p.name);
      return p.availability === "in_stock";
    })
    .map(mapEpaProductToAccessory);
}

export async function getAccessoriesFromDB(): Promise<Accessory[]> {
  const [curatedResult, epaAccessories] = await Promise.all([
    supabase
      .from("accessories")
      .select("*")
      .eq("available", true)
      .order("category")
      .order("name"),
    getEpaAccessories(),
  ]);

  if (curatedResult.error) {
    console.error("Error fetching accessories:", curatedResult.error);
    return epaAccessories;
  }

  const curated = (curatedResult.data || []).map(mapAccessoryRow);
  return [...curated, ...epaAccessories];
}

let accessoriesCachePromise: Promise<Accessory[]> | null = null;

export function getAccessoriesCached(): Promise<Accessory[]> {
  if (!accessoriesCachePromise) {
    accessoriesCachePromise = getAccessoriesFromDB().catch((error) => {
      accessoriesCachePromise = null;
      throw error;
    });
  }
  return accessoriesCachePromise;
}

export async function getAccessoryById(id: string): Promise<Accessory | null> {
  if (isCatalogProductId(id)) {
    const catalogId = stripCatalogIdPrefix(id);
    const data = await getEpaAccessoryRow(catalogId);
    return data ? mapEpaProductToAccessory(data) : null;
  }

  const { data, error } = await supabase
    .from("accessories")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("Error fetching accessory:", error);
    return null;
  }

  return data ? mapAccessoryRow(data) : null;
}

export function getAccessoriesByCategory(
  accessories: Accessory[],
  category: AccessoryCategory
): Accessory[] {
  return accessories.filter((a) => a.category === category);
}
