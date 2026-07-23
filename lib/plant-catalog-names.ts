/**
 * Display names for imported EPA plants.
 * Format shown in catalog: "Nombre común" + "Nombre científico".
 * Keyed by EPA product slug (without catalog id prefix).
 */

export type PlantDisplayName = {
  common: string;
  scientific: string;
};

/** Curated common + scientific names for every plant in the EPA catalog. */
export const PLANT_DISPLAY_NAMES: Record<string, PlantDisplayName> = {
  "albahaca-blanca-maceta-4-5": {
    common: "Albahaca blanca",
    scientific: "Ocimum basilicum",
  },
  "aloe-fasciata-5cm-unicamente-para-retiro-en-tienda": {
    common: "Aloe cebra",
    scientific: "Haworthiopsis fasciata",
  },
  "anturia-colores-variados-unicamente-para-retiro-en-tienda": {
    common: "Anturio",
    scientific: "Anthurium andraeanum",
  },
  "beaucarne-pony-maceta-14-cm-unicamente-para-retiro-en-tienda": {
    common: "Pata de elefante",
    scientific: "Beaucarnea recurvata",
  },
  "bougambilia-maceta-8-variedad-de-colores-802071-unicamente-para-retiro-en-tienda":
    {
      common: "Buganvilia",
      scientific: "Bougainvillea spectabilis",
    },
  "cactus-injertado-colores-variados-unicamente-para-recoger-en-tiendas": {
    common: "Cactus injertado",
    scientific: "Gymnocalycium mihanovichii",
  },
  "cactus-maceta-12-cm-unicamente-para-retiro-en-tienda": {
    common: "Cactus",
    scientific: "Cactaceae",
  },
  "cactus-maceta-tipo-plato-17-cm-unicamente-para-retiro-en-tienda": {
    common: "Cactus",
    scientific: "Cactaceae",
  },
  "cactus-maceta-tipo-plato-8-cm-unicamente-para-retiro-en-tienda": {
    common: "Cactus",
    scientific: "Cactaceae",
  },
  "canasta-colgante-chloropytum-21cm-unicamente-para-retiro-en-tienda": {
    common: "Cinta",
    scientific: "Chlorophytum comosum",
  },
  "canna-lily-maceta-65-cm-unicamente-para-retiro-en-tienda": {
    common: "Canna",
    scientific: "Canna indica",
  },
  "centavito-maceta-4-unicamente-para-retiro-en-tienda": {
    common: "Centavito",
    scientific: "Callisia repens",
  },
  "chatia-15-cm-unicamente-para-retiro-en-tienda": {
    common: "Chatía",
    scientific: "Impatiens walleriana",
  },
  "chatia-maceta-9-variedad-de-colores-unicamente-para-retiro-en-tienda": {
    common: "Chatía",
    scientific: "Impatiens walleriana",
  },
  "chatia-nueva-guinea-10-5-cm-unicamente-para-recoger-en-tienda": {
    common: "Chatía Nueva Guinea",
    scientific: "Impatiens hawkeri",
  },
  "chile-diente-de-perro-maceta-6-x-6-unicamente-para-retiro-en-tienda": {
    common: "Chile diente de perro",
    scientific: "Capsicum annuum",
  },
  "cilantro-zamat-9x-9-unicamente-para-retiro-en-tienda": {
    common: "Cilantro",
    scientific: "Coriandrum sativum",
  },
  "cipres-limon-abierto-macenta-8-unicamente-para-retiro-en-tienda": {
    common: "Ciprés limón",
    scientific: "Cupressus macrocarpa",
  },
  "cola-de-caballo-maceta-6-unicamente-para-retiro-en-tienda": {
    common: "Cola de caballo",
    scientific: "Equisetum hyemale",
  },
  "croton-maceta-4-unicamente-para-retiro-en-tienda": {
    common: "Croton",
    scientific: "Codiaeum variegatum",
  },
  "croton-maceta-7-unicamente-para-retiro-en-tienda": {
    common: "Croton",
    scientific: "Codiaeum variegatum",
  },
  "cyca-maceta-21cm-unicamente-para-retiro-en-tienda": {
    common: "Cica",
    scientific: "Cycas revoluta",
  },
  "cyclamen-maceta-2-variedad-de-colores-unicamente-para-retiro-en-tienda": {
    common: "Ciclamen",
    scientific: "Cyclamen persicum",
  },
  "duranta-maceta-8-variedad-unicamente-para-retiro-en-tienda": {
    common: "Duranta",
    scientific: "Duranta erecta",
  },
  "euphorbia-maceta-mp10-unicamente-para-retiro-en-tienda": {
    common: "Euforbia",
    scientific: "Euphorbia milii",
  },
  "fittonias-maceta-4-5-unicamente-para-retiro-en-tienda": {
    common: "Fittonia",
    scientific: "Fittonia albivenis",
  },
  "gloxinea-en-maceta-6-unicamente-para-retiro-en-tienda": {
    common: "Gloxinia",
    scientific: "Sinningia speciosa",
  },
  "haworthia-maceta-3-variedad-unicamente-para-retiro-en-tienda": {
    common: "Haworthia",
    scientific: "Haworthia spp.",
  },
  "hojas-de-hule-maceta-9-unicamente-para-retiro-en-tienda": {
    common: "Hojas de hule",
    scientific: "Ficus elastica",
  },
  "hortencia-de-sol-bolsa-9-x-12-unicamente-para-retiro-en-tienda": {
    common: "Hortensia de sol",
    scientific: "Hydrangea macrophylla",
  },
  "jacaranda-bolsa-5-unicamente-para-retiro-en-tienda": {
    common: "Jacaranda",
    scientific: "Jacaranda mimosifolia",
  },
  "lavanda-francesa-6x8-unicamente-para-retiro-en-tienda": {
    common: "Lavanda francesa",
    scientific: "Lavandula stoechas",
  },
  "mamilaria-maceta-6-cm-unicamente-para-retiro-en-tienda": {
    common: "Mamilaria",
    scientific: "Mammillaria spp.",
  },
  "maya-tree-maceta-8-unicamente-para-retiro-en-tienda": {
    common: "Izote",
    scientific: "Yucca gigantea",
  },
  "mejorana-bolsa-2-unicamente-para-retiro-en-tienda": {
    common: "Mejorana",
    scientific: "Origanum majorana",
  },
  "menta-maceta-4-5-unicamente-para-retiro-en-tienda": {
    common: "Menta",
    scientific: "Mentha spicata",
  },
  "menta-bolsa-7-unicamente-para-retiro-en-tienda": {
    common: "Menta",
    scientific: "Mentha spicata",
  },
  "mini-pino-maceta-4-unicamente-para-retiro-en-tienda": {
    common: "Mini pino",
    scientific: "Chamaecyparis obtusa",
  },
  "monstera-deliciosa-maceta-100-cm-unicamente-para-retiro-en-tienda": {
    common: "Monstera",
    scientific: "Monstera deliciosa",
  },
  "monstera-maceta-6-unicamente-para-retiro-en-tienda": {
    common: "Monstera",
    scientific: "Monstera deliciosa",
  },
  "opuntia-microdasys-maceta-5cm-unicamente-para-retiro-en-tienda": {
    common: "Nopal cegador",
    scientific: "Opuntia microdasys",
  },
  "oregano-maceta-4-5": {
    common: "Orégano",
    scientific: "Origanum vulgare",
  },
  "orquidea-phalenopsis-grande-unicamente-para-retiro-en-tienda": {
    common: "Orquídea Phalaenopsis",
    scientific: "Phalaenopsis spp.",
  },
  "pelargonio-maceta-6-unicamente-para-retiro-en-tienda": {
    common: "Geranio",
    scientific: "Pelargonium hortorum",
  },
  "peperomias-maceta-4-5-unicamente-para-retiro-en-tienda": {
    common: "Peperomia",
    scientific: "Peperomia obtusifolia",
  },
  "peperonia-maceta-7-unicamente-para-retiro-en-tienda": {
    common: "Peperomia",
    scientific: "Peperomia obtusifolia",
  },
  "pericon-bolsa-4-unicamente-para-retiro-en-tienda": {
    common: "Pericón",
    scientific: "Tagetes lucida",
  },
  "petunia-canasta-unicamente-para-retiro-en-tienda": {
    common: "Petunia",
    scientific: "Petunia × hybrida",
  },
  "pony-liso-bowl-32cm-unicamente-para-retiro-en-tienda": {
    common: "Pata de elefante",
    scientific: "Beaucarnea recurvata",
  },
  "ruda-6-x-8-bolsa": {
    common: "Ruda",
    scientific: "Ruta graveolens",
  },
  "sansevieria-laurentii-maceta-10-unicamente-para-retiro-en-tienda": {
    common: "Lengua de suegra",
    scientific: "Dracaena trifasciata",
  },
  "sansevieria-laurentii-maceta-14cm-unicamente-para-retiro-en-tienda": {
    common: "Lengua de suegra",
    scientific: "Dracaena trifasciata",
  },
  "sansevieria-laurentii-maceta-23cm-unicamente-para-retiro-en-tienda": {
    common: "Lengua de suegra",
    scientific: "Dracaena trifasciata",
  },
  "scheflera-maceta-9-variedad-unicamente-para-retiro-en-tienda": {
    common: "Schefflera",
    scientific: "Schefflera arboricola",
  },
  "sedum-maceta-3-variedad-unicamente-para-retiro-en-tienda": {
    common: "Sedum",
    scientific: "Sedum spp.",
  },
  "singonio-mp4-maceta-10cm-unicamente-para-retiro-en-tienda": {
    common: "Singonio",
    scientific: "Syngonium podophyllum",
  },
  "suculenta-echeverria-variedad-maceta-de-3-unicamente-para-retiro-en-tienda":
    {
      common: "Echeveria",
      scientific: "Echeveria spp.",
    },
  "suculenta-maceta-12-bowl-variado-unicamente-para-retiro-en-tienda": {
    common: "Suculenta",
    scientific: "varias especies",
  },
  "suculenta-maceta-14-unicamente-para-retiro-en-tienda": {
    common: "Suculenta",
    scientific: "varias especies",
  },
  "suculenta-maceta-4-variedad-unicamente-para-retiro-en-tienda": {
    common: "Suculenta",
    scientific: "varias especies",
  },
  "suculenta-maceta-6-variedad-unicamente-para-retiro-en-tienda": {
    common: "Suculenta",
    scientific: "varias especies",
  },
  "suculenta-maceta-9-terrario-decorativo-unicamente-para-retiro-en-tienda": {
    common: "Suculenta",
    scientific: "varias especies",
  },
  "suculenta-maceta-colgante-7-unicamente-para-retiro-en-tienda": {
    common: "Suculenta colgante",
    scientific: "varias especies",
  },
  "te-de-limon-bolsa-4-unicamente-para-retiro-en-tienda": {
    common: "Té de limón",
    scientific: "Cymbopogon citratus",
  },
  "telefono-variedad-maceta-4-unicamente-para-retiro-en-tienda": {
    common: "Teléfono",
    scientific: "Epipremnum aureum",
  },
  "telefono-variedad-maceta-7-unicamente-para-retiro-en-tienda": {
    common: "Teléfono",
    scientific: "Epipremnum aureum",
  },
  "terrario-decorativo-cactus-maceta-6-unicamente-para-retiro-en-tienda": {
    common: "Terrario de cactus",
    scientific: "Cactaceae",
  },
  "tomillo-ingles-maceta-4-5": {
    common: "Tomillo inglés",
    scientific: "Thymus vulgaris",
  },
  "violeta-en-maceta-unicamente-para-retiro-en-tienda": {
    common: "Violeta africana",
    scientific: "Saintpaulia ionantha",
  },
  "violeta-maceta-6-unicamente-para-retiro-en-tienda": {
    common: "Violeta africana",
    scientific: "Saintpaulia ionantha",
  },
};

/** Strip vendor packaging noise (pot size, SKU, etc.) from a raw product title. */
export function stripPlantPackagingNoise(rawName: string): string {
  return rawName
    .replace(/\s*\([^)]*[Rr]etiro en [Tt]ienda\)\s*/g, " ")
    .replace(/\s*[ÚúUu]nicamente\s+para\s+retiro\s+en\s+tienda[^.]*\.?/gi, " ")
    .replace(
      /\s*[ÚúUu]nicamente\s+para\s+recoger\s+en\s+tienda[s]?[^.]*\.?/gi,
      " "
    )
    .replace(/\bmacentas?\b/gi, " ")
    .replace(/\bmacetas?\b/gi, " ")
    .replace(/\ben\s+maceta\b/gi, " ")
    .replace(/\bbolsas?\b/gi, " ")
    .replace(/\bcanastas?\b/gi, " ")
    .replace(/\bbowls?\b/gi, " ")
    .replace(/\bterrario\s+decorativo\b/gi, " ")
    .replace(/\btipo\s+plato\b/gi, " ")
    .replace(/\bcolgante\b/gi, " ")
    .replace(/\bvariedad(?:\s+de\s+colores)?\b/gi, " ")
    .replace(/\bcolores\s+variados\b/gi, " ")
    .replace(/\bmp\d+\b/gi, " ")
    .replace(/\b#\s*\d+(?:\.\d+)?\b/g, " ")
    .replace(/\b\d{5,}\b/g, " ") // SKUs
    .replace(/\b\d+(?:[.,]\d+)?\s*(?:cm|plg|")\b/gi, " ")
    .replace(/\b\d+\s*x\s*\d+(?:\s*,)?\b/gi, " ")
    .replace(/['"]/g, " ")
    .replace(/\s{2,}/g, " ")
    .replace(/\s+,/g, ",")
    .trim()
    .replace(/^,+|,+$/g, "")
    .trim();
}

/**
 * Resolve display common + scientific names for an EPA plant.
 * Prefers curated map, then attribute "Nombre común", then cleaned raw title.
 */
export function resolvePlantDisplayName(
  rawName: string,
  slug: string,
  attrs: Record<string, string> = {}
): PlantDisplayName {
  const curated = PLANT_DISPLAY_NAMES[slug];
  if (curated) return curated;

  const attrCommon = (attrs["Nombre común"] || "").trim();
  const attrScientific = (
    attrs["Nombre científico"] ||
    attrs["Nombre botánico"] ||
    attrs["Especie"] ||
    ""
  ).trim();

  const cleaned = stripPlantPackagingNoise(rawName);
  const common =
    attrCommon ||
    cleaned ||
    rawName.trim() ||
    "Planta";

  return {
    common,
    scientific: attrScientific || "Planta natural",
  };
}

/** Single-line catalog title: "Nombre común - Nombre científico". */
export function formatPlantCatalogTitle(
  common: string,
  scientific: string
): string {
  const c = common.trim();
  const s = scientific.trim();
  if (!s || s === "Planta natural") return c;
  if (!c) return s;
  if (c.toLowerCase() === s.toLowerCase()) return c;
  return `${c} - ${s}`;
}
