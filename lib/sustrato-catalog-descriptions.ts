/**
 * Rewritten catalog descriptions for EPA growing media (sustratos).
 * Same facts as source listings, different wording.
 */

type SustratoProfileContext = {
  tipo: string;
  aditivo?: string;
  placement: "interior" | "exterior" | "ambos";
  presentacion?: string;
};

function normalizePlacement(
  attrs: Record<string, string>
): SustratoProfileContext["placement"] {
  const use = (attrs["Uso recomendado"] || "").toLowerCase();
  const interior = use.includes("interior") || use.includes("doméstico");
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

function placementLabel(placement: SustratoProfileContext["placement"]): string {
  if (placement === "ambos") return "interior y exterior";
  if (placement === "exterior") return "jardines y exteriores";
  return "interiores";
}

function inferTipo(rawName: string, attrs: Record<string, string>): string {
  const text = [rawName, attrs.Tipo, attrs["Características adicionales"]]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  if (text.includes("suculent") || text.includes("cactus")) return "suculentas";
  if (text.includes("orquídea") || text.includes("orquidea")) return "orquideas";
  if (text.includes("fertiliz")) return "fertilizado";
  if (text.includes("coco")) return "coco";
  if (text.includes("tropical")) return "tropical";
  if (text.includes("siembra") || text.includes("germin")) return "siembra";
  return "universal";
}

const SUSTRATO_DESCRIPTION_TEMPLATES: Record<
  string,
  (ctx: SustratoProfileContext) => string
> = {
  suculentas: (ctx) =>
    `Mezcla ligera con drenaje rápido y buena aireación, formulada para cactus y suculentas. Reduce el riesgo de encharcamiento y favorece raíces firmes en macetas de ${placementLabel(ctx.placement)}.`,

  coco: (ctx) =>
    `Medio de cultivo a base de fibra de coco, con alta capacidad de retención de humedad. Funciona como sustrato principal o como enmienda al trasplantar; recomendado para ${placementLabel(ctx.placement)} y mezclas con tierra o compost.`,

  fertilizado: (ctx) =>
    `Tierra enriquecida con nutrientes para arrancar plantas con buena base. Aporta materia orgánica y fertilización inicial; presentación en bolsa lista para trasplantar en ${placementLabel(ctx.placement)}.`,

  orquideas: (ctx) =>
    `Sustrato esponjoso con corteza y material mineral, pensado para orquídeas epífitas. Mejora aireación y drenaje en la zona radicular; ideal para Phalaenopsis y especies similares en ${placementLabel(ctx.placement)}.`,

  tropical: (ctx) =>
    `Mezcla con buena retención de humedad para plantas tropicales de hoja ancha. Estructura equilibrada para macetas en ${placementLabel(ctx.placement)}.`,

  siembra: (ctx) =>
    `Sustrato fino para germinación y repique temprano. Facilita contacto semilla-sustrato y humedad estable en ${placementLabel(ctx.placement)}.`,

  universal: (ctx) =>
    `Mezcla versátil para trasplantes y macetas de uso general. Buen equilibrio entre drenaje y retención de humedad en ${placementLabel(ctx.placement)}.`,
};

/** Curated descriptions keyed by slug (optional overrides). */
const SUSTRATO_DESCRIPTION_OVERRIDES: Record<string, string> = {
  "sustrato-cactus-suculenta":
    SUSTRATO_DESCRIPTION_TEMPLATES.suculentas({
      tipo: "suculentas",
      placement: "ambos",
    }),
  "sustrato-de-coco-bolsa-10-lb":
    SUSTRATO_DESCRIPTION_TEMPLATES.coco({
      tipo: "coco",
      placement: "exterior",
      presentacion: "Bolsa",
    }),
  "sustrato-fertilizado-bolsa-de10-libras":
    SUSTRATO_DESCRIPTION_TEMPLATES.fertilizado({
      tipo: "fertilizado",
      placement: "ambos",
      presentacion: "Bolsa",
    }),
  "sustrato-para-orquidea-mediano":
    SUSTRATO_DESCRIPTION_TEMPLATES.orquideas({
      tipo: "orquideas",
      placement: "ambos",
    }),
};

/** Build an enriched, rewritten sustrato description. */
export function resolveSustratoDescription(
  rawName: string,
  slug: string,
  attrs: Record<string, string> = {}
): string {
  const override = SUSTRATO_DESCRIPTION_OVERRIDES[slug];
  if (override) return override;

  const tipo = inferTipo(rawName, attrs);
  const template =
    SUSTRATO_DESCRIPTION_TEMPLATES[tipo] ||
    SUSTRATO_DESCRIPTION_TEMPLATES.universal;

  return template({
    tipo,
    aditivo: attrs.Tipo,
    placement: normalizePlacement(attrs),
    presentacion: attrs.Presentación,
  });
}
