/**
 * Standardized display names for imported EPA mulch / cubiertas.
 * Removes bag sizes and vendor noise; type stays in accessory attrs/filters.
 */

function capitalizeWords(text: string): string {
  return text
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

function stripMulchSizeNoise(rawName: string): string {
  return rawName
    .replace(/\bbolsa(?:s)?\b/gi, " ")
    .replace(/\b\d+(?:[.,]\d+)?\s*(?:lb|libras?|kg|g|l|lt|litros?)\b/gi, " ")
    .replace(/\b(mediano|mediana|grande|pequeño|pequeña|chico|chica)\b/gi, " ")
    .replace(/\s{2,}/g, " ")
    .trim();
}

/** Curated names for every known EPA mulch slug. */
export const MULCH_DISPLAY_NAMES: Record<string, string> = {
  "fibra-de-coco-mixta-bolsa-4-lb": "Cubierta · Fibra de coco mixta",
};

function inferMulchLabel(rawName: string, attrs: Record<string, string>): string {
  const text = [rawName, attrs.Tipo, attrs["Características adicionales"]]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  if (text.includes("coco") || text.includes("fibra")) {
    return text.includes("mixt") ? "Fibra de coco mixta" : "Fibra de coco";
  }
  if (text.includes("corteza")) return "Corteza decorativa";
  if (text.includes("musgo")) return "Musgo natural";
  if (
    text.includes("piedra") ||
    text.includes("grava") ||
    text.includes("guijarro")
  ) {
    return "Piedra decorativa";
  }
  if (text.includes("arcilla")) return "Arcilla expandida";
  return "Cubierta decorativa";
}

/** Build a clean mulch title without bag weight or size labels. */
export function resolveMulchDisplayName(
  rawName: string,
  slug: string,
  attrs: Record<string, string> = {}
): string {
  const curated = MULCH_DISPLAY_NAMES[slug];
  if (curated) return curated;

  const label = inferMulchLabel(rawName, attrs);
  if (label !== "Cubierta decorativa") {
    return `Cubierta · ${label}`;
  }

  const cleaned = stripMulchSizeNoise(rawName);
  if (cleaned.length >= 3) {
    return `Cubierta · ${capitalizeWords(cleaned)}`;
  }

  return "Cubierta para maceta";
}

export function resolveMulchCatalogName(
  rawName: string,
  slug: string,
  attrs: Record<string, string> = {}
): string {
  return resolveMulchDisplayName(rawName, slug, attrs);
}
