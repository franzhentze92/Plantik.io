/**
 * Standardized display names for imported EPA growing media (sustratos).
 * Removes bag sizes and vendor noise; type stays in accessory attrs/filters.
 */

function capitalizeWords(text: string): string {
  return text
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

function stripSustratoSizeNoise(rawName: string): string {
  return rawName
    .replace(/\bbolsa(?:s)?\b/gi, " ")
    .replace(/\b\d+(?:[.,]\d+)?\s*(?:lb|libras?|kg|g|l|lt|litros?)\b/gi, " ")
    .replace(/\b(mediano|mediana|grande|pequeño|pequeña|chico|chica)\b/gi, " ")
    .replace(/\bde\s+\d+\b/gi, " ")
    .replace(/\s{2,}/g, " ")
    .trim();
}

/** Curated names for every known EPA sustrato slug. */
export const SUSTRATO_DISPLAY_NAMES: Record<string, string> = {
  "sustrato-cactus-suculenta": "Sustrato · Cactus y suculentas",
  "sustrato-de-coco-bolsa-10-lb": "Sustrato · Fibra de coco",
  "sustrato-fertilizado-bolsa-de10-libras": "Sustrato · Fertilizado",
  "sustrato-para-orquidea-mediano": "Sustrato · Orquídeas",
};

/**
 * Build a clean sustrato title without bag weight or size labels.
 * Format: "Sustrato · {Tipo}".
 */
export function resolveSustratoDisplayName(
  rawName: string,
  slug: string,
  attrs: Record<string, string> = {}
): string {
  const curated = SUSTRATO_DISPLAY_NAMES[slug];
  if (curated) return curated;

  const text = [rawName, attrs.Tipo, attrs["Características adicionales"]]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  if (text.includes("suculent") || text.includes("cactus")) {
    return "Sustrato · Cactus y suculentas";
  }
  if (text.includes("orquídea") || text.includes("orquidea")) {
    return "Sustrato · Orquídeas";
  }
  if (text.includes("fertiliz")) return "Sustrato · Fertilizado";
  if (text.includes("coco")) return "Sustrato · Fibra de coco";
  if (text.includes("tropical")) return "Sustrato · Plantas tropicales";
  if (text.includes("siembra") || text.includes("germin")) {
    return "Sustrato · Siembra";
  }

  const cleaned = stripSustratoSizeNoise(rawName)
    .replace(/^sustrato\s+(?:de\s+|para\s+)?/i, "")
    .trim();

  if (cleaned.length >= 3) {
    return `Sustrato · ${capitalizeWords(cleaned)}`;
  }

  return "Sustrato universal";
}

export function resolveSustratoCatalogName(
  rawName: string,
  slug: string,
  attrs: Record<string, string> = {}
): string {
  return resolveSustratoDisplayName(rawName, slug, attrs);
}
