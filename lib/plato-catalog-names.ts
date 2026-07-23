/**
 * Standardized display names for imported EPA pot saucers (platos).
 * Removes measurements and vendor noise; color/material stay in accessory attrs.
 */

const COLLECTION_LABELS: Record<string, string> = {
  santorini: "Santorini",
  "san remo": "San Remo",
  venezia: "Venezia",
  sevilla: "Sevilla",
  mónaco: "Mónaco",
  monaco: "Mónaco",
  viena: "Viena",
  pisa: "Pisa",
  thalia: "Thalia",
  florencia: "Florencia",
};

function formatCollection(value: string): string {
  const key = value.trim().toLowerCase();
  return COLLECTION_LABELS[key] || capitalizeWords(value.trim());
}

function capitalizeWords(text: string): string {
  return text
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

function collectionFromText(text: string): string | null {
  const lower = text.toLowerCase();
  for (const [key, label] of Object.entries(COLLECTION_LABELS)) {
    if (lower.includes(key)) return label;
  }
  return null;
}

/** Strip measurements and packaging noise from plato titles. */
function stripPlatoSizeNoise(rawName: string): string {
  return rawName
    .replace(/^plato\s+para\s+maceta\s+/i, "")
    .replace(/\b\d+(?:[.,]\d+)?\s*(?:cm|plg|"|''|″)\b/gi, " ")
    .replace(/\b\d+(?:[.,]\d+)?\s*x\s*\d+(?:[.,]\d+)?(?:\s*x\s*\d+(?:[.,]\d+)?)?\s*(?:cm)?\b/gi, " ")
    .replace(/\b(plástic[oa]|plastic[oa]|polietileno|cerámica|ceramica)\b/gi, " ")
    .replace(
      /\b(anthracite|antracita|blanc[oa]|terracota|taupe|marfil|negro|verde|gris|beige|dry green|dry-green)\b/gi,
      " "
    )
    .replace(/['"]/g, " ")
    .replace(/\s{2,}/g, " ")
    .trim();
}

/**
 * Build a clean, truthful plato title without repeating size or color.
 * Format: "Plato macetero · {Colección}" or "Plato macetero · {Forma}".
 */
export function resolvePlatoDisplayName(
  rawName: string,
  slug: string,
  attrs: Record<string, string> = {}
): string {
  const collection = attrs["Colección"]?.trim();
  const collectionLabel = collection
    ? formatCollection(collection)
    : collectionFromText(rawName);

  if (collectionLabel) {
    return `Plato macetero · ${collectionLabel}`;
  }

  const forma = (attrs["Forma"] || "").trim().toLowerCase();
  if (forma.includes("cuadrad")) return "Plato macetero · Cuadrado";
  if (forma.includes("redond")) return "Plato macetero · Redondo";

  const cleaned = stripPlatoSizeNoise(rawName);
  if (cleaned.length >= 3) {
    return `Plato macetero · ${capitalizeWords(cleaned)}`;
  }

  return "Plato macetero";
}

/** Curated names for every known EPA plato slug. */
export const PLATO_DISPLAY_NAMES: Record<string, string> = {
  "plato-para-maceta-venezia-plastico-2-8-x-18-x-18-cm-anthracite":
    "Plato macetero · Venezia",
  "plato-para-maceta-venezia-plastico-2-8-x-18-x-18-cm-dry-green":
    "Plato macetero · Venezia",
  "plato-para-maceta-venezia-plastico-2-8-x-18-x-18-cm-taupe":
    "Plato macetero · Venezia",
  "plato-para-maceta-venezia-plastico-3-x-22-x-22-cm-anthracite":
    "Plato macetero · Venezia",
  "plato-para-maceta-venezia-plastico-3-x-22-x-22-cm-dry-green":
    "Plato macetero · Venezia",
  "plato-para-maceta-venezia-plastico-3-x-22-x-22-cm-taupe":
    "Plato macetero · Venezia",
  "plato-para-maceta-venezia-plastico-4-3-x-30-x-30-cm-anthracite":
    "Plato macetero · Venezia",
  "plato-para-maceta-venezia-plastico-4-3-x-30-x-30-cm-dry-green":
    "Plato macetero · Venezia",
  "plato-para-maceta-venezia-plastico-4-3-x-30-x-30-cm-taupe":
    "Plato macetero · Venezia",
  "plato-para-maceta-venezia-plastico-5-1-x-40-x-40-cm-anthracite":
    "Plato macetero · Venezia",
  "plato-para-maceta-venezia-plastico-5-1-x-40-x-40-cm-dry-green":
    "Plato macetero · Venezia",
  "plato-para-maceta-venezia-plastico-5-1-x-40-x-40-cm-taupe":
    "Plato macetero · Venezia",
};

/** Resolve plato display name: curated map first, then algorithm. */
export function resolvePlatoCatalogName(
  rawName: string,
  slug: string,
  attrs: Record<string, string> = {}
): string {
  const curated = PLATO_DISPLAY_NAMES[slug];
  if (curated) return curated;
  return resolvePlatoDisplayName(rawName, slug, attrs);
}
