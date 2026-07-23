/**
 * Rewritten catalog descriptions for EPA pot saucers (platos).
 * Same facts as source listings, different wording.
 */

type PlatoProfileContext = {
  material: string;
  color: string;
  placement: "interior" | "exterior" | "ambos";
  collection?: string | null;
  forma?: string | null;
  diameterCm: number;
};

function placementLabel(placement: PlatoProfileContext["placement"]): string {
  if (placement === "ambos") return "interior y exterior";
  if (placement === "exterior") return "exteriores";
  return "interiores";
}

function normalizePlacement(
  attrs: Record<string, string>
): PlatoProfileContext["placement"] {
  const use = (attrs["Uso recomendado"] || "").toLowerCase();
  const interior = use.includes("interior");
  const exterior =
    use.includes("exterior") ||
    use.includes("jardín") ||
    use.includes("jardin");
  if (interior && exterior) return "ambos";
  if (exterior) return "exterior";
  if (interior) return "interior";
  return "ambos";
}

function parseDiameterCm(attrs: Record<string, string>): number {
  const dims =
    attrs["Armado (AltoxAnchoxLargo) (cm)"] ||
    attrs["Dimensión del empaque (cm)"] ||
    "";
  const nums = (dims.match(/[\d.]+/g) || []).map(Number).filter((n) => !isNaN(n));
  return nums.length ? Math.round(Math.max(...nums)) : 0;
}

function getPlatoDescriptionKey(
  rawName: string,
  slug: string,
  attrs: Record<string, string>,
  diameterCm: number
): string {
  const collection = (attrs["Colección"] || "").trim().toLowerCase();
  if (collection === "venezia" || slug.includes("venezia")) {
    if (diameterCm <= 18) return "plato-venezia-s";
    if (diameterCm <= 22) return "plato-venezia-m";
    if (diameterCm <= 30) return "plato-venezia-l";
    return "plato-venezia-xl";
  }
  if (collection) return `plato-${collection.replace(/\s+/g, "-")}`;
  return "plato-generico";
}

const PLATO_DESCRIPTION_TEMPLATES: Record<
  string,
  (ctx: PlatoProfileContext) => string
> = {
  "plato-venezia-s": (ctx) =>
    `Plato de drenaje Venezia en ${ctx.material.toLowerCase()}, de perfil bajo y borde liso. Diámetro de ${ctx.diameterCm} cm, pensado para macetas compactas de la misma línea; retiene el agua sobrante y protege mesas, repisas y baldosas en ${placementLabel(ctx.placement)}.`,

  "plato-venezia-m": (ctx) =>
    `Plato macetero Venezia en ${ctx.material.toLowerCase()}, formato redondo de ${ctx.diameterCm} cm. Acompaña macetas medianas de la colección, recoge el drenaje y mantiene limpias las superficies; rinde en ${placementLabel(ctx.placement)}.`,

  "plato-venezia-l": (ctx) =>
    `Plato Venezia de ${ctx.diameterCm} cm de diámetro, en ${ctx.material.toLowerCase()} resistente al uso frecuente. Recoge el agua de riego bajo macetas amplias y prolonga la vida de suelos y muebles; diseño liso que combina con la serie Venezia.`,

  "plato-venezia-xl": (ctx) =>
    `Plato de gran formato Venezia, ${ctx.diameterCm} cm de diámetro en ${ctx.material.toLowerCase()}. Ideal bajo macetas de piso grandes; canaliza el drenaje sin mojar el entorno y funciona en ${placementLabel(ctx.placement)}.`,

  "plato-generico": (ctx) => {
    const forma = ctx.forma ? `, forma ${ctx.forma.toLowerCase()}` : "";
    const size =
      ctx.diameterCm > 0 ? ` de ${ctx.diameterCm} cm de diámetro` : "";
    return `Plato macetero en ${ctx.material.toLowerCase()}${size}${forma}. Recoge el exceso de agua del riego y protege suelos y muebles; recomendado para ${placementLabel(ctx.placement)}.`;
  },
};

/** Build an enriched, rewritten plato description. */
export function resolvePlatoDescription(
  rawName: string,
  slug: string,
  attrs: Record<string, string> = {}
): string {
  const diameterCm = parseDiameterCm(attrs);
  const key = getPlatoDescriptionKey(rawName, slug, attrs, diameterCm);
  const template =
    PLATO_DESCRIPTION_TEMPLATES[key] || PLATO_DESCRIPTION_TEMPLATES["plato-generico"];

  return template({
    material: attrs["Material"] || "Plástico",
    color: attrs["Color"] || "Natural",
    placement: normalizePlacement(attrs),
    collection: attrs["Colección"] || null,
    forma: attrs["Forma"] || null,
    diameterCm,
  });
}

/** Short card blurb derived from the full description. */
export function platoShortDescription(description: string): string {
  if (description.length <= 140) return description;
  const cut = description.slice(0, 137);
  const lastSpace = cut.lastIndexOf(" ");
  return `${(lastSpace > 80 ? cut.slice(0, lastSpace) : cut).trim()}...`;
}
