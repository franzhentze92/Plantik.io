/**
 * Rewritten catalog descriptions for EPA planters.
 * Same facts as source listings, different wording. Grouped by product profile.
 */

type PlanterProfileContext = {
  material: string;
  color: string;
  placement: "interior" | "exterior" | "ambos";
  forma?: string | null;
  collection?: string | null;
  diameterCm?: number;
};

const PLANTER_DESCRIPTION_TEMPLATES: Record<
  string,
  (ctx: PlanterProfileContext) => string
> = {
  "inserto-santorini": (ctx) =>
    `Recipiente interior de la línea ${ctx.collection || "Santorini"}, pensado para encajar dentro de la maceta decorativa y facilitar el riego. Fabricado en ${ctx.material.toLowerCase()}, mantiene el sustrato contenido y protege la pieza exterior.`,

  "maceta-colgante-coco": () =>
    "Canasta tejida en fibra de coco, ligera y con buena ventilación para raíces. Ideal para composiciones colgantes en balcones, porches o interiores luminosos; aporta textura natural al follaje.",

  "maceta-clasica": (ctx) =>
    `Maceta básica de ${ctx.material.toLowerCase()} para uso cotidiano. Formato versátil con drenaje incluido, recomendada para plantas pequeñas en ${placementLabel(ctx.placement)}.`,

  "maceta-clasica-con-plato": (ctx) =>
    `Maceta tradicional en ${ctx.material.toLowerCase()} con plato integrado para recoger el exceso de agua. Buena opción para exteriores o interiores donde se busca practicidad y un acabado cálido.`,

  "maceta-cuadrada": (ctx) =>
    `Maceta cuadrada de ${ctx.material.toLowerCase()} con líneas definidas. Encaja bien en repisas, esquinas y jardineras; incluye drenaje y rinde en ${placementLabel(ctx.placement)}.`,

  "maceta-cuadrada-estilo-madera": (ctx) =>
    `Maceta cuadrada con acabado tipo madera en tono ${ctx.color.toLowerCase()}. Combina aspecto cálido con la resistencia del plástico; apta para ${placementLabel(ctx.placement)}.`,

  "maceta-de-pared": (ctx) =>
    `Solución vertical de ${ctx.material.toLowerCase()} para aprovechar muros y barandales. Permite sembrar sin ocupar piso; recomendada para ${placementLabel(ctx.placement)} con buena luz.`,

  "maceta-de-piso": (ctx) =>
    `Maceta de piso en ${ctx.material.toLowerCase()}, estable y con drenaje. Pensada para plantas de mayor porte en ${placementLabel(ctx.placement)}.`,

  "maceta-de-poliresina": (ctx) =>
    `Pieza de poliresina con acabado mate en tono ${ctx.color.toLowerCase()}. Material liviano y resistente a la intemperie; funciona como punto focal en ${placementLabel(ctx.placement)}.`,

  "maceta-estilo-ratan": (ctx) =>
    `Maceta con textura trenzada inspirada en ratán, hecha en ${ctx.material.toLowerCase()}. Aporta calidez decorativa y drena bien; ideal para interiores luminosos o terrazas cubiertas.`,

  "maceta-garden": () =>
    "Maceta cuadrada tipo garden de gran capacidad. Formato amplio para arreglos mixtos o plantas de raíz extensa; incluye drenaje y rinde en exteriores.",

  "maceta-megaplast": (ctx) =>
    `Maceta Megaplast de ${ctx.material.toLowerCase()}, resistente y de uso frecuente. Perfil clásico con drenaje; recomendada para ${placementLabel(ctx.placement)}.`,

  "maceta-orquideas-florencia": () =>
    "Maceta cónica transparente de la línea Florencia, diseñada para orquídeas. Permite observar humedad y raíces; la forma favorece buen drenaje y circulación de aire.",

  "maceta-pisa-cuadrada": (ctx) =>
    `Maceta cuadrada de la colección Pisa en ${ctx.material.toLowerCase()}. Silueta geométrica y base estable para exteriores; incluye drenaje y acabado en ${ctx.color.toLowerCase()}.`,

  "maceta-san-remo": (ctx) =>
    `Línea San Remo con diseño sobrio y bordes suaves. Maceta de piso en ${ctx.material.toLowerCase()}, con drenaje y uso en ${placementLabel(ctx.placement)}.`,

  "maceta-santorini": (ctx) =>
    `Colección Santorini de líneas limpias y estilo contemporáneo. Maceta de piso en ${ctx.material.toLowerCase()} con drenaje; funciona en ${placementLabel(ctx.placement)}.`,

  "maceta-sevilla-cilindrica": (ctx) =>
    `Maceta cilíndrica decorativa Sevilla en ${ctx.material.toLowerCase()}. Perfil alto y elegante, con acabado ${ctx.color.toLowerCase()}; incluye drenaje para ${placementLabel(ctx.placement)}.`,

  "maceta-sevilla-cuadrada": (ctx) =>
    `Maceta cuadrada decorativa Sevilla en ${ctx.material.toLowerCase()}. Forma geométrica y acabado ${ctx.color.toLowerCase()}; pensada para composiciones modernas en ${placementLabel(ctx.placement)}.`,

  "maceta-monaco-conica": (ctx) =>
    `Maceta cónica Mónaco en ${ctx.material.toLowerCase()}, de silueta escultural. El perfil inclinado realza plantas altas o arreglos centrales; incluye drenaje.`,

  "maceta-thalia": (ctx) =>
    `Maceta Thalia en cerámica de color ${ctx.color.toLowerCase()}. Acabado artesanal y presencia delicada; recomendada para interiores con buena luz indirecta.`,

  "maceta-venezia": (ctx) =>
    `Colección Venezia con diseño clásico y proporciones equilibradas. Maceta de piso en ${ctx.material.toLowerCase()}, con drenaje para ${placementLabel(ctx.placement)}.`,

  "maceta-viena": (ctx) =>
    `Línea Viena de ${ctx.material.toLowerCase()} en tono ${ctx.color.toLowerCase()}. Formato tradicional con buena capacidad y drenaje; versátil para ${placementLabel(ctx.placement)}.`,

  "jardinera-clasica": (ctx) =>
    `Jardinera alargada de ${ctx.material.toLowerCase()} para varias plantas o hileras decorativas. Incluye drenaje y funciona bien en ${placementLabel(ctx.placement)}.`,
};

function placementLabel(placement: PlanterProfileContext["placement"]): string {
  if (placement === "ambos") return "interior y exterior";
  if (placement === "exterior") return "exteriores";
  return "interiores";
}

/** Derive a stable profile key for description templates. */
export function getPlanterDescriptionKey(
  rawName: string,
  slug: string,
  attrs: Record<string, string> = {}
): string {
  const name = rawName.toLowerCase();
  const slugLower = slug.toLowerCase();
  const collection = (attrs["Colección"] || "").trim().toLowerCase();
  const forma = (attrs["Forma"] || "").trim().toLowerCase();
  const tipo = (attrs["Tipo"] || "").trim();
  const material = (attrs["Material"] || "").toLowerCase();

  if (name.includes("inserto") || slugLower.includes("inserto")) {
    return "inserto-santorini";
  }
  if (
    name.includes("colg") ||
    slugLower.includes("colg") ||
    slugLower.includes("cesta-colg")
  ) {
    return "maceta-colgante-coco";
  }
  if (name.includes("pared") || slugLower.includes("pared")) {
    return "maceta-de-pared";
  }
  if (tipo === "Para orquídeas" || name.includes("orqu")) {
    return "maceta-orquideas-florencia";
  }
  if (name.includes("jardinera") || slugLower.includes("jardinera")) {
    return "jardinera-clasica";
  }
  if (slugLower.includes("garden") || name.includes("garden")) {
    return "maceta-garden";
  }
  if (material.includes("poliresina") || name.includes("poliresina")) {
    return "maceta-de-poliresina";
  }
  if (name.includes("clásica") || name.includes("clasica")) {
    return "maceta-clasica-con-plato";
  }
  if (name.includes("estilo madera") || slugLower.includes("estilo-madera")) {
    return "maceta-cuadrada-estilo-madera";
  }
  if (name.includes("ratan") || slugLower.includes("ratan")) {
    return "maceta-estilo-ratan";
  }
  if (
    name.includes("megaplast") ||
    name.includes("megaplats") ||
    slugLower.includes("megaplast") ||
    slugLower.includes("megaplats")
  ) {
    return "maceta-megaplast";
  }
  if (name.includes("viena") || slugLower.includes("viena")) {
    return "maceta-viena";
  }
  if (collection === "pisa" || name.includes("pisa")) {
    return "maceta-pisa-cuadrada";
  }
  if (collection === "san remo" || name.includes("san remo")) {
    return "maceta-san-remo";
  }
  if (collection === "santorini" || name.includes("santorini")) {
    return "maceta-santorini";
  }
  if (collection === "venezia" || name.includes("venezia")) {
    return "maceta-venezia";
  }
  if (collection === "thalia" || name.includes("thalia")) {
    return "maceta-thalia";
  }
  if (collection === "mónaco" || collection === "monaco" || name.includes("mónaco") || name.includes("monaco")) {
    return "maceta-monaco-conica";
  }
  if (collection === "sevilla" || name.includes("sevilla")) {
    if (forma.includes("cuadrad") || name.includes("cuadrad")) {
      return "maceta-sevilla-cuadrada";
    }
    return "maceta-sevilla-cilindrica";
  }
  if (name.includes("de piso") || slugLower.includes("de-piso")) {
    return "maceta-de-piso";
  }
  if (name.includes("cuadrada") || forma.includes("cuadrad")) {
    return "maceta-cuadrada";
  }
  if (/maceta\s+[\d#]/.test(name) || /^maceta-\d/.test(slugLower)) {
    return "maceta-clasica";
  }
  if (name.includes("plástica") || slugLower.includes("plastica")) {
    return "maceta-clasica";
  }
  return "maceta-de-piso";
}

function normalizePlacement(
  attrs: Record<string, string>
): PlanterProfileContext["placement"] {
  const use = (attrs["Uso recomendado"] || "").toLowerCase();
  const interior = use.includes("interior");
  const exterior = use.includes("exterior");
  if (interior && exterior) return "ambos";
  if (exterior) return "exterior";
  if (interior) return "interior";
  return "ambos";
}

/** Build an enriched, rewritten planter description. */
export function resolvePlanterDescription(
  rawName: string,
  slug: string,
  attrs: Record<string, string> = {}
): string {
  const key = getPlanterDescriptionKey(rawName, slug, attrs);
  const template = PLANTER_DESCRIPTION_TEMPLATES[key];
  const ctx: PlanterProfileContext = {
    material: attrs["Material"] || "Plástico",
    color: attrs["Color"] || "Natural",
    placement: normalizePlacement(attrs),
    forma: attrs["Forma"] || null,
    collection: attrs["Colección"] || null,
  };

  if (template) return template(ctx);

  return `Maceta de ${ctx.material.toLowerCase()} con drenaje, pensada para ${placementLabel(ctx.placement)}. Acabado en ${ctx.color.toLowerCase()} y uso decorativo cotidiano.`;
}

/** Short card blurb derived from the full description. */
export function planterShortDescription(description: string): string {
  if (description.length <= 140) return description;
  const cut = description.slice(0, 137);
  const lastSpace = cut.lastIndexOf(" ");
  return `${(lastSpace > 80 ? cut.slice(0, lastSpace) : cut).trim()}...`;
}
