/**
 * Standardized display names for imported EPA planters.
 * Removes measurements and vendor noise; keeps material/color in card subtitles.
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

const FORMA_LABELS: Record<string, string> = {
  redondo: "Redonda",
  redonda: "Redonda",
  cuadrada: "Cuadrada",
  cilíndrica: "Cilíndrica",
  cilindrica: "Cilíndrica",
  cónica: "Cónica",
  conica: "Cónica",
  "cónica baja": "Cónica",
  "conica baja": "Cónica",
};

function formatCollection(value: string): string {
  const key = value.trim().toLowerCase();
  return COLLECTION_LABELS[key] || capitalizeWords(value.trim());
}

function formatForma(
  forma: string | undefined,
  rawName: string
): string | null {
  if (forma) {
    const key = forma.trim().toLowerCase();
    if (FORMA_LABELS[key]) return FORMA_LABELS[key];
  }

  const lower = rawName.toLowerCase();
  if (lower.includes("cilíndric") || lower.includes("cilindric")) return "Cilíndrica";
  if (lower.includes("cuadrad")) return "Cuadrada";
  if (lower.includes("cónic") || lower.includes("conic")) return "Cónica";
  return null;
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

/** Strip measurements and packaging noise from planter titles. */
export function stripPlanterSizeNoise(rawName: string): string {
  return rawName
    .replace(/\b\d+(?:[.,]\d+)?\s*(?:cm|plg|"|''|″)\b/gi, " ")
    .replace(/\(\s*\d+(?:[.,]\d+)?\s*(?:cm|plg|"|''|″)?\s*\)/gi, " ")
    .replace(/\b\d+(?:[.,]\d+)?\s*x\s*\d+(?:[.,]\d+)?(?:\s*x\s*\d+(?:[.,]\d+)?)?\s*(?:cm)?\b/gi, " ")
    .replace(/\bno\.?\s*\d+\b/gi, " ")
    .replace(/\b#\s*\d+(?:[.,]\d+)?\b/g, " ")
    .replace(/\b\d+\s*\/\s*\d+\b/g, " ")
    .replace(/\b(plástic[oa]|plastic[oa]|polietileno|cerámica|ceramica|poliresina)\b/gi, " ")
    .replace(/\b(anthracite|antracita|blanc[oa]|terracota|taupe|marfil|negro|verde|gris|beige|arena|chocolate|café|cafe|dry green)\b/gi, " ")
    .replace(/['"]/g, " ")
    .replace(/\s{2,}/g, " ")
    .replace(/\s*,\s*/g, ", ")
    .trim();
}

/**
 * Build a clean, truthful planter title without repeating size or color.
 * Material and color stay in the card subtitle.
 */
export function resolvePlanterDisplayName(
  rawName: string,
  slug: string,
  attrs: Record<string, string> = {}
): string {
  const name = rawName.toLowerCase();
  const slugLower = slug.toLowerCase();
  const collection = attrs["Colección"]?.trim();
  const forma = attrs["Forma"]?.trim();
  const tipo = attrs["Tipo"]?.trim();
  const material = (attrs["Material"] || "").toLowerCase();
  const collectionLabel = collection ? formatCollection(collection) : null;
  const formaLabel = formatForma(forma, rawName);

  if (name.includes("inserto") || slugLower.includes("inserto")) {
    return collectionLabel
      ? `Inserto ${collectionLabel}`
      : "Inserto decorativo";
  }

  if (
    name.includes("colg") ||
    slugLower.includes("colg") ||
    slugLower.includes("cesta-colg")
  ) {
    if (material.includes("coco") || material.includes("fibra")) {
      return "Maceta colgante · Fibra de coco";
    }
    return "Maceta colgante";
  }

  if (name.includes("pared") || slugLower.includes("pared")) {
    return "Maceta de pared";
  }

  if (tipo === "Para orquídeas" || name.includes("orqu")) {
    return collectionLabel
      ? `Maceta para orquídeas ${collectionLabel}`
      : "Maceta para orquídeas";
  }

  if (name.includes("jardinera") || slugLower.includes("jardinera")) {
    return "Jardinera clásica";
  }

  if (slugLower.includes("garden") || name.includes("garden")) {
    return "Maceta Garden · Cuadrada";
  }

  if (material.includes("poliresina") || name.includes("poliresina")) {
    return "Maceta de poliresina";
  }

  if (name.includes("clásica") || name.includes("clasica")) {
    return "Maceta clásica con plato";
  }

  if (name.includes("estilo madera") || slugLower.includes("estilo-madera")) {
    return "Maceta cuadrada · Estilo madera";
  }

  if (name.includes("ratan") || slugLower.includes("ratan")) {
    return "Maceta estilo ratán";
  }

  if (
    name.includes("megaplast") ||
    name.includes("megaplats") ||
    slugLower.includes("megaplast") ||
    slugLower.includes("megaplats")
  ) {
    return "Maceta Megaplast";
  }

  if (name.includes("viena") || slugLower.includes("viena")) {
    return "Maceta Viena";
  }

  if (name.includes("de piso") || slugLower.includes("de-piso")) {
    if (collectionLabel) return `Maceta ${collectionLabel}`;
    const inferred = collectionFromText(rawName);
    if (inferred) return `Maceta ${inferred}`;
    return "Maceta de piso";
  }

  if (tipo === "Decorativa" || name.includes("decorativa")) {
    const line = collectionLabel || collectionFromText(rawName);
    if (line && formaLabel) return `Maceta ${line} · ${formaLabel}`;
    if (line) return `Maceta decorativa ${line}`;
    return "Maceta decorativa";
  }

  if (name.includes("cuadrada") || formaLabel === "Cuadrada") {
    if (collectionLabel) return `Maceta ${collectionLabel} · Cuadrada`;
    return "Maceta cuadrada";
  }

  if (collectionLabel) {
    return `Maceta ${collectionLabel}`;
  }

  const inferredCollection = collectionFromText(rawName);
  if (inferredCollection) {
    return `Maceta ${inferredCollection}`;
  }

  if (/maceta\s+[\d#]/.test(name) || /^maceta-\d/.test(slugLower)) {
    return "Maceta clásica";
  }

  if (name.includes("plástica") || slugLower.includes("plastica")) {
    return "Maceta clásica";
  }

  const cleaned = stripPlanterSizeNoise(rawName);
  if (cleaned.length >= 8) return capitalizeWords(cleaned);

  return "Maceta";
}
