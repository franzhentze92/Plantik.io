/**
 * Rewritten catalog descriptions for EPA mulch / cubiertas.
 * Same facts as source listings, different wording.
 */

type MulchProfileContext = {
  tipo: string;
  funcion: string;
  placement: "interior" | "exterior" | "ambos";
};

function normalizePlacement(
  attrs: Record<string, string>
): MulchProfileContext["placement"] {
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

function placementLabel(placement: MulchProfileContext["placement"]): string {
  if (placement === "ambos") return "macetas y jardines";
  if (placement === "exterior") return "jardines y exteriores";
  return "macetas de interior";
}

function inferMulchTipo(rawName: string, attrs: Record<string, string>): string {
  const text = [rawName, attrs.Tipo, attrs["Características adicionales"]]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  if (text.includes("coco") || text.includes("fibra")) return "fibra";
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

function inferMulchFuncion(rawName: string, attrs: Record<string, string>): string {
  const text = [rawName, attrs["Características adicionales"], attrs.Tipo]
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

const MULCH_DESCRIPTION_TEMPLATES: Record<
  string,
  (ctx: MulchProfileContext) => string
> = {
  fibra: (ctx) =>
    `Cubierta orgánica de fibra de coco mixta para ${placementLabel(ctx.placement)}. Mejora la textura del sustrato, reduce la evaporación y mantiene humedad estable; también sirve como acolchado decorativo sobre la tierra.`,

  corteza: (ctx) =>
    `Capa de corteza natural para cubrir el sustrato en macetas y jardineras. Aporta acabado ordenado, frena malezas leves y ayuda a conservar humedad en ${placementLabel(ctx.placement)}.`,

  musgo: (ctx) =>
    `Musgo decorativo para cubrir la superficie del sustrato. Retiene humedad en la capa superior y realza macetas en ${placementLabel(ctx.placement)}.`,

  piedra: (ctx) =>
    `Cubierta mineral de piedra o grava para macetas y arreglos exteriores. Separa el sustrato del entorno, mejora drenaje visual y aporta un acabado limpio en ${placementLabel(ctx.placement)}.`,

  arcilla: (ctx) =>
    `Arcilla expandida como cubierta ligera para macetas. Ayuda a reducir evaporación y mantiene la superficie del sustrato más estable en ${placementLabel(ctx.placement)}.`,
};

/** Curated descriptions keyed by slug. */
const MULCH_DESCRIPTION_OVERRIDES: Record<string, string> = {
  "fibra-de-coco-mixta-bolsa-4-lb":
    "Cubierta orgánica de fibra de coco mixta para macetas y huertos. Enmienda la estructura del sustrato, retiene humedad y facilita aireación; también puede usarse en mezclas para cultivos hidropónicos.",
};

/** Build an enriched, rewritten mulch description. */
export function resolveMulchDescription(
  rawName: string,
  slug: string,
  attrs: Record<string, string> = {}
): string {
  const override = MULCH_DESCRIPTION_OVERRIDES[slug];
  if (override) return override;

  const tipo = inferMulchTipo(rawName, attrs);
  const template =
    MULCH_DESCRIPTION_TEMPLATES[tipo] || MULCH_DESCRIPTION_TEMPLATES.fibra;

  return template({
    tipo,
    funcion: inferMulchFuncion(rawName, attrs),
    placement: normalizePlacement(attrs),
  });
}
