import type { LucideIcon } from "lucide-react";
import {
  Home,
  Trees,
  Blend,
  Moon,
  SunMedium,
  Sun,
  Leaf,
  Gauge,
  Flame,
  Monitor,
  Ruler,
  Gift,
  PawPrint,
  Cpu,
  Layers,
  Palette,
  Droplets,
  Sprout,
  Mountain,
  TreePine,
  Shell,
} from "lucide-react";
import { Plant, Planter } from "@/types";
import type { Accessory, AccessoryCategory } from "@/data/accessories";

export type PlantFilterState = {
  ubicacion: string[];
  luz: string[];
  cuidado: string[];
  espacio: string[];
  caracteristica: string[];
};

export type PlanterFilterState = {
  talla: string[];
  ubicacion: string[];
  material: string[];
  estilo: string[];
  color: string[];
  drenaje: boolean;
};

export const EMPTY_PLANT_FILTERS: PlantFilterState = {
  ubicacion: [],
  luz: [],
  cuidado: [],
  espacio: [],
  caracteristica: [],
};

export const EMPTY_PLANTER_FILTERS: PlanterFilterState = {
  talla: [],
  ubicacion: [],
  material: [],
  estilo: [],
  color: [],
  drenaje: false,
};

export type FilterOption = {
  id: string;
  label: string;
  icon?: LucideIcon;
  swatch?: string;
};

export const PLANT_FILTER_GROUPS: Array<{
  key: keyof PlantFilterState;
  label: string;
  options: FilterOption[];
}> = [
  {
    key: "ubicacion",
    label: "Ubicación",
    options: [
      { id: "interior", label: "Interior", icon: Home },
      { id: "exterior", label: "Exterior", icon: Trees },
      { id: "ambos", label: "Interior y exterior", icon: Blend },
    ],
  },
  {
    key: "luz",
    label: "Luz",
    options: [
      { id: "baja", label: "Poca luz", icon: Moon },
      { id: "media", label: "Luz media", icon: SunMedium },
      { id: "alta", label: "Mucha luz", icon: Sun },
    ],
  },
  {
    key: "cuidado",
    label: "Nivel de cuidado",
    options: [
      { id: "facil", label: "Fácil", icon: Leaf },
      { id: "moderado", label: "Moderado", icon: Gauge },
      { id: "exigente", label: "Exigente", icon: Flame },
    ],
  },
  {
    key: "espacio",
    label: "Tipo de espacio",
    options: [
      { id: "escritorio", label: "Escritorio", icon: Monitor },
      { id: "grandes", label: "Plantas grandes", icon: Ruler },
      { id: "regalos", label: "Regalos", icon: Gift },
    ],
  },
  {
    key: "caracteristica",
    label: "Características",
    options: [
      { id: "pet-friendly", label: "Pet friendly", icon: PawPrint },
      { id: "smart-care", label: "Smart Care", icon: Cpu },
    ],
  },
];

export const PLANTER_FILTER_GROUPS: Array<{
  key: keyof Omit<PlanterFilterState, "drenaje">;
  label: string;
  options: FilterOption[];
}> = [
  {
    key: "talla",
    label: "Talla",
    options: [
      { id: "S", label: "Pequeña (S)", icon: Ruler },
      { id: "M", label: "Mediana (M)", icon: Ruler },
    ],
  },
  {
    key: "ubicacion",
    label: "Ubicación",
    options: [
      { id: "interior", label: "Interior", icon: Home },
      { id: "exterior", label: "Exterior", icon: Trees },
    ],
  },
  {
    key: "material",
    label: "Material",
    options: [
      { id: "ceramica", label: "Cerámica", icon: Layers },
      { id: "barro", label: "Barro", icon: Layers },
      { id: "fibra", label: "Fibra", icon: Layers },
      { id: "cemento", label: "Cemento", icon: Layers },
    ],
  },
  {
    key: "estilo",
    label: "Estilo",
    options: [
      { id: "minimalista", label: "Minimalista", icon: Palette },
      { id: "artesanal", label: "Artesanal", icon: Palette },
      { id: "bohemio", label: "Bohemio", icon: Palette },
      { id: "moderno", label: "Moderno", icon: Palette },
      { id: "contemporaneo", label: "Contemporáneo", icon: Palette },
    ],
  },
  {
    key: "color",
    label: "Color",
    options: [
      { id: "blanco", label: "Blanco", swatch: "#F5F1E8" },
      { id: "terracota", label: "Terracota", swatch: "#B5734A" },
      { id: "crema", label: "Crema", swatch: "#E8DCC0" },
      { id: "gris", label: "Gris", swatch: "#9C9C94" },
      { id: "negro", label: "Negro", swatch: "#2A2A2A" },
    ],
  },
];

export const DRENAJE_ICON = Droplets;

const LEGACY_CATEGORIA_MAP: Record<string, Partial<PlantFilterState>> = {
  interior: { ubicacion: ["interior"] },
  exterior: { ubicacion: ["exterior"] },
  escritorio: { espacio: ["escritorio"] },
  "pet-friendly": { caracteristica: ["pet-friendly"] },
  "bajo-mantenimiento": { cuidado: ["facil"] },
  "poca-luz": { luz: ["baja"] },
  grandes: { espacio: ["grandes"] },
  regalos: { espacio: ["regalos"] },
};

const LEGACY_PLANTER_FILTRO_MAP: Record<string, Partial<PlanterFilterState>> = {
  s: { talla: ["S"] },
  m: { talla: ["M"] },
  interior: { ubicacion: ["interior"] },
  exterior: { ubicacion: ["exterior"] },
  drenaje: { drenaje: true },
  ceramica: { material: ["ceramica"] },
  barro: { material: ["barro"] },
  fibra: { material: ["fibra"] },
  cemento: { material: ["cemento"] },
  minimalista: { estilo: ["minimalista"] },
  artesanal: { estilo: ["artesanal"] },
  bohemio: { estilo: ["bohemio"] },
  moderno: { estilo: ["moderno"] },
  contemporaneo: { estilo: ["contemporaneo"] },
  blanco: { color: ["blanco"] },
  terracota: { color: ["terracota"] },
  crema: { color: ["crema"] },
  gris: { color: ["gris"] },
  negro: { color: ["negro"] },
};

function parseList(value: string | null): string[] {
  if (!value) return [];
  return value.split(",").map((v) => v.trim()).filter(Boolean);
}

export function parsePlantFilters(searchParams: URLSearchParams): PlantFilterState {
  const legacy = searchParams.get("categoria");
  if (legacy && LEGACY_CATEGORIA_MAP[legacy]) {
    return { ...EMPTY_PLANT_FILTERS, ...LEGACY_CATEGORIA_MAP[legacy] };
  }

  return {
    ubicacion: parseList(searchParams.get("ubicacion")),
    luz: parseList(searchParams.get("luz")),
    cuidado: parseList(searchParams.get("cuidado")),
    espacio: parseList(searchParams.get("espacio")),
    caracteristica: parseList(searchParams.get("caracteristica")),
  };
}

export function parsePlanterFilters(searchParams: URLSearchParams): PlanterFilterState {
  const legacy = searchParams.get("filtro");
  if (legacy && LEGACY_PLANTER_FILTRO_MAP[legacy]) {
    return { ...EMPTY_PLANTER_FILTERS, ...LEGACY_PLANTER_FILTRO_MAP[legacy] };
  }

  return {
    talla: parseList(searchParams.get("talla")),
    ubicacion: parseList(searchParams.get("ubicacion")),
    material: parseList(searchParams.get("material")),
    estilo: parseList(searchParams.get("estilo")),
    color: parseList(searchParams.get("color")),
    drenaje: searchParams.get("drenaje") === "1",
  };
}

export function plantFiltersToParams(filters: PlantFilterState): URLSearchParams {
  const params = new URLSearchParams();
  params.set("tab", "plantas");

  for (const [key, values] of Object.entries(filters) as [keyof PlantFilterState, string[]][]) {
    if (values.length > 0) params.set(key, values.join(","));
  }

  return params;
}

export function planterFiltersToParams(filters: PlanterFilterState): URLSearchParams {
  const params = new URLSearchParams();
  params.set("tab", "macetas");

  if (filters.talla.length) params.set("talla", filters.talla.join(","));
  if (filters.ubicacion.length) params.set("ubicacion", filters.ubicacion.join(","));
  if (filters.material.length) params.set("material", filters.material.join(","));
  if (filters.estilo.length) params.set("estilo", filters.estilo.join(","));
  if (filters.color.length) params.set("color", filters.color.join(","));
  if (filters.drenaje) params.set("drenaje", "1");

  return params;
}

export function countActivePlantFilters(filters: PlantFilterState): number {
  return Object.values(filters).reduce((sum, values) => sum + values.length, 0);
}

export function countActivePlanterFilters(filters: PlanterFilterState): number {
  return (
    filters.talla.length +
    filters.ubicacion.length +
    filters.material.length +
    filters.estilo.length +
    filters.color.length +
    (filters.drenaje ? 1 : 0)
  );
}

function matchesPlacement(
  placement: Plant["placement"] | Planter["placement"],
  selected: string[]
): boolean {
  if (selected.length === 0) return true;
  return selected.some((value) => {
    if (value === "interior") return placement === "interior" || placement === "ambos";
    if (value === "exterior") return placement === "exterior" || placement === "ambos";
    return placement === value;
  });
}

function matchesCategory(plant: Plant, slug: string): boolean {
  if (slug === "grandes") {
    return plant.category.includes("grandes") || plant.matureHeightCm >= 80;
  }
  return plant.category.includes(slug);
}

export function filterPlants(plants: Plant[], filters: PlantFilterState): Plant[] {
  const hasFilters = countActivePlantFilters(filters) > 0;
  if (!hasFilters) return plants;

  return plants.filter((plant) => {
    if (!matchesPlacement(plant.placement, filters.ubicacion)) return false;
    if (filters.luz.length > 0 && !filters.luz.includes(plant.light)) return false;
    if (filters.cuidado.length > 0 && !filters.cuidado.includes(plant.care)) return false;
    if (
      filters.espacio.length > 0 &&
      !filters.espacio.some((slug) => matchesCategory(plant, slug))
    ) {
      return false;
    }
    if (
      filters.caracteristica.includes("pet-friendly") &&
      !plant.petFriendly
    ) {
      return false;
    }
    if (
      filters.caracteristica.includes("smart-care") &&
      !plant.smartCareCompatible
    ) {
      return false;
    }
    return true;
  });
}

const MATERIAL_MATCHERS: Record<string, (material: string) => boolean> = {
  ceramica: (m) => m.includes("cerámica") || m.includes("ceramica"),
  barro: (m) => m.includes("barro"),
  fibra: (m) => m.includes("fibra"),
  cemento: (m) => m.includes("cemento"),
};

const STYLE_LABELS: Record<string, string> = {
  minimalista: "Minimalista",
  artesanal: "Artesanal",
  bohemio: "Bohemio",
  moderno: "Moderno",
  contemporaneo: "Contemporáneo",
};

const COLOR_LABELS: Record<string, string> = {
  blanco: "Blanco",
  terracota: "Terracota",
  crema: "Crema",
  gris: "Gris",
  negro: "Negro",
};

export function filterPlanters(planters: Planter[], filters: PlanterFilterState): Planter[] {
  const hasFilters = countActivePlanterFilters(filters) > 0;
  if (!hasFilters) return planters;

  return planters.filter((planter) => {
    if (filters.talla.length > 0 && !filters.talla.includes(planter.size)) return false;
    if (!matchesPlacement(planter.placement, filters.ubicacion)) return false;
    if (filters.drenaje && !planter.drainage) return false;

    if (
      filters.material.length > 0 &&
      !filters.material.some((id) =>
        MATERIAL_MATCHERS[id]?.(planter.material.toLowerCase())
      )
    ) {
      return false;
    }

    if (
      filters.estilo.length > 0 &&
      !filters.estilo.some((id) => planter.style === STYLE_LABELS[id])
    ) {
      return false;
    }

    if (
      filters.color.length > 0 &&
      !filters.color.some((id) => planter.color === COLOR_LABELS[id])
    ) {
      return false;
    }

    return true;
  });
}

export function searchPlantsByText(plants: Plant[], query: string): Plant[] {
  const term = query.trim().toLowerCase();
  if (!term) return plants;

  return plants.filter((plant) => {
    const haystack = [
      plant.name,
      plant.scientificName,
      plant.shortDescription,
      ...plant.category,
      ...plant.tags,
    ]
      .join(" ")
      .toLowerCase();
    return haystack.includes(term);
  });
}

export function searchPlantersByText(
  planters: Planter[],
  query: string
): Planter[] {
  const term = query.trim().toLowerCase();
  if (!term) return planters;

  return planters.filter((planter) => {
    const haystack = [
      planter.name,
      planter.material,
      planter.color,
      planter.style,
      planter.size,
    ]
      .join(" ")
      .toLowerCase();
    return haystack.includes(term);
  });
}

export function getPlantFilterLabel(
  groupKey: keyof PlantFilterState,
  optionId: string
): string | undefined {
  return PLANT_FILTER_GROUPS.find((g) => g.key === groupKey)?.options.find(
    (o) => o.id === optionId
  )?.label;
}

export function getPlanterFilterLabel(
  groupKey: keyof PlanterFilterState,
  optionId: string
): string | undefined {
  if (groupKey === "drenaje") return "Con drenaje";
  return PLANTER_FILTER_GROUPS.find((g) => g.key === groupKey)?.options.find(
    (o) => o.id === optionId
  )?.label;
}

// ─────────────────────────── Accessory catalog ───────────────────────────
// Generic multi-select filters shared by platos, sustratos and mulch tabs.

export type AccessoryFilterState = Record<string, string[]>;

export type AccessoryFilterGroup = {
  key: string;
  label: string;
  options: FilterOption[];
};

export const ACCESSORY_FILTER_GROUPS: Record<
  AccessoryCategory,
  AccessoryFilterGroup[]
> = {
  plato: [
    {
      key: "material",
      label: "Material",
      options: [
        { id: "ceramica", label: "Cerámica", icon: Layers },
        { id: "barro", label: "Barro", icon: Layers },
        { id: "bambu", label: "Bambú", icon: Layers },
        { id: "plastico", label: "Plástico", icon: Layers },
        { id: "metal", label: "Metal", icon: Layers },
      ],
    },
    {
      key: "talla",
      label: "Talla",
      options: [
        { id: "S", label: "Pequeño (S)", icon: Ruler },
        { id: "M", label: "Mediano (M)", icon: Ruler },
        { id: "L", label: "Grande (L)", icon: Ruler },
      ],
    },
    {
      key: "ubicacion",
      label: "Ubicación",
      options: [
        { id: "interior", label: "Interior", icon: Home },
        { id: "exterior", label: "Exterior", icon: Trees },
      ],
    },
    {
      key: "color",
      label: "Color",
      options: [
        { id: "blanco", label: "Blanco", swatch: "#F5F1E8" },
        { id: "negro", label: "Negro", swatch: "#2A2A2A" },
        { id: "terracota", label: "Terracota", swatch: "#B5734A" },
        { id: "crema", label: "Crema", swatch: "#E8DCC0" },
        { id: "gris", label: "Gris", swatch: "#9C9C94" },
        { id: "madera", label: "Madera", swatch: "#C9A66B" },
        { id: "transparente", label: "Transparente", swatch: "#DCE6E4" },
      ],
    },
  ],
  sustrato: [
    {
      key: "tipo",
      label: "Tipo de planta",
      options: [
        { id: "universal", label: "Universal", icon: Sprout },
        { id: "suculentas", label: "Suculentas y cactus", icon: Droplets },
        { id: "tropical", label: "Tropicales", icon: Leaf },
        { id: "orquideas", label: "Orquídeas", icon: TreePine },
        { id: "siembra", label: "Siembra", icon: Sprout },
      ],
    },
    {
      key: "aditivo",
      label: "Composición",
      options: [
        { id: "humus", label: "Con humus", icon: Leaf },
        { id: "coco", label: "Fibra de coco", icon: Shell },
        { id: "perlita", label: "Con perlita", icon: Droplets },
        { id: "corteza", label: "Con corteza", icon: TreePine },
        { id: "turba", label: "Con turba", icon: Sprout },
      ],
    },
  ],
  mulch: [
    {
      key: "tipo",
      label: "Tipo",
      options: [
        { id: "piedra", label: "Piedra", icon: Mountain },
        { id: "corteza", label: "Corteza", icon: TreePine },
        { id: "musgo", label: "Musgo", icon: Leaf },
        { id: "fibra", label: "Fibra", icon: Shell },
        { id: "arcilla", label: "Arcilla", icon: Mountain },
      ],
    },
    {
      key: "color",
      label: "Color",
      options: [
        { id: "blanco", label: "Blanco", swatch: "#EDEDE8" },
        { id: "negro", label: "Negro", swatch: "#2A2A2A" },
        { id: "gris", label: "Gris", swatch: "#9C9C94" },
        { id: "cafe", label: "Café", swatch: "#6B4A2E" },
        { id: "verde", label: "Verde", swatch: "#5E7A46" },
        { id: "terracota", label: "Terracota", swatch: "#B5734A" },
      ],
    },
    {
      key: "funcion",
      label: "Función",
      options: [
        { id: "decorativo", label: "Decorativo", icon: Palette },
        { id: "humedad", label: "Retención de humedad", icon: Droplets },
      ],
    },
  ],
};

export function emptyAccessoryFilters(
  category: AccessoryCategory
): AccessoryFilterState {
  const state: AccessoryFilterState = {};
  for (const group of ACCESSORY_FILTER_GROUPS[category]) {
    state[group.key] = [];
  }
  return state;
}

export function parseAccessoryFilters(
  searchParams: URLSearchParams,
  category: AccessoryCategory
): AccessoryFilterState {
  const state: AccessoryFilterState = {};
  for (const group of ACCESSORY_FILTER_GROUPS[category]) {
    state[group.key] = parseList(searchParams.get(group.key));
  }
  return state;
}

export function accessoryFiltersToParams(
  filters: AccessoryFilterState,
  tab: string
): URLSearchParams {
  const params = new URLSearchParams();
  params.set("tab", tab);
  for (const [key, values] of Object.entries(filters)) {
    if (values.length > 0) params.set(key, values.join(","));
  }
  return params;
}

export function countActiveAccessoryFilters(
  filters: AccessoryFilterState
): number {
  return Object.values(filters).reduce((sum, values) => sum + values.length, 0);
}

export function filterAccessories(
  items: Accessory[],
  filters: AccessoryFilterState
): Accessory[] {
  const active = countActiveAccessoryFilters(filters) > 0;
  if (!active) return items;

  return items.filter((item) => {
    for (const [key, selected] of Object.entries(filters)) {
      if (selected.length === 0) continue;
      if (key === "ubicacion") {
        if (!matchesPlacement(item.placement, selected)) return false;
        continue;
      }
      const value = item.attrs[key];
      if (!value || !selected.includes(value)) return false;
    }
    return true;
  });
}

export function searchAccessoriesByText(
  items: Accessory[],
  query: string
): Accessory[] {
  const term = query.trim().toLowerCase();
  if (!term) return items;

  return items.filter((item) => {
    const haystack = [item.name, item.description, ...item.tags]
      .join(" ")
      .toLowerCase();
    return haystack.includes(term);
  });
}

export function getAccessoryFilterLabel(
  category: AccessoryCategory,
  groupKey: string,
  optionId: string
): string | undefined {
  return ACCESSORY_FILTER_GROUPS[category]
    .find((g) => g.key === groupKey)
    ?.options.find((o) => o.id === optionId)?.label;
}
