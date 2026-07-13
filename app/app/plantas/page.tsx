"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PlantCard } from "@/components/plants/PlantCard";
import { PlanterCard } from "@/components/plants/PlanterCard";
import { AccessoryCard } from "@/components/plants/AccessoryCard";
import {
  PlantFilterPanel,
  PlanterFilterPanel,
  AccessoryFilterPanel,
} from "@/components/plants/CatalogFilterPanel";
import { CatalogHeroDecoration } from "@/components/plants/CatalogHeroDecoration";
import { Leaf, X } from "lucide-react";
import { track } from "@/lib/analytics";
import {
  countActivePlantFilters,
  countActivePlanterFilters,
  countActiveAccessoryFilters,
  EMPTY_PLANT_FILTERS,
  EMPTY_PLANTER_FILTERS,
  emptyAccessoryFilters,
  filterPlants,
  filterPlanters,
  filterAccessories,
  parsePlantFilters,
  parsePlanterFilters,
  parseAccessoryFilters,
  plantFiltersToParams,
  planterFiltersToParams,
  accessoryFiltersToParams,
  searchPlantsByText,
  searchPlantersByText,
  searchAccessoriesByText,
  PlantFilterState,
  PlanterFilterState,
  AccessoryFilterState,
} from "@/lib/catalog-filters";
import { getPlantsCached, getPlantersCached, getAccessoriesCached, getAccessoriesByCategory } from "@/lib/supabase-queries";
import { Plant, Planter } from "@/types";
import type { Accessory, AccessoryCategory } from "@/data/accessories";

type CatalogTab = "plantas" | "macetas" | "platos" | "sustratos" | "mulch";

const TABS: { id: CatalogTab; label: string }[] = [
  { id: "plantas", label: "Plantas" },
  { id: "macetas", label: "Macetas" },
  { id: "platos", label: "Platos" },
  { id: "sustratos", label: "Sustratos" },
  { id: "mulch", label: "Mulch" },
];

const TAB_TO_CATEGORY: Partial<Record<CatalogTab, AccessoryCategory>> = {
  platos: "plato",
  sustratos: "sustrato",
  mulch: "mulch",
};

function normalizeTab(value: string | null): CatalogTab {
  const found = TABS.find((t) => t.id === value);
  return found ? found.id : "plantas";
}

export default function CatalogPage() {
  return (
    <Suspense fallback={null}>
      <CatalogPageContent />
    </Suspense>
  );
}

function CatalogPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTab = normalizeTab(searchParams.get("tab"));
  const searchQuery = searchParams.get("q") ?? "";
  const accessoryCategory = TAB_TO_CATEGORY[activeTab];

  const [plantFilters, setPlantFilters] = useState<PlantFilterState>(EMPTY_PLANT_FILTERS);
  const [planterFilters, setPlanterFilters] = useState<PlanterFilterState>(
    EMPTY_PLANTER_FILTERS
  );
  const [accessoryFilters, setAccessoryFilters] = useState<AccessoryFilterState>(
    {}
  );
  const [plants, setPlants] = useState<Plant[]>([]);
  const [planters, setPlanters] = useState<Planter[]>([]);
  const [accessories, setAccessories] = useState<Accessory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    track("page_view", { route: "/app/plantas" });
    let active = true;
    Promise.all([
      getPlantsCached(),
      getPlantersCached(),
      getAccessoriesCached(),
    ]).then(([plantsData, plantersData, accessoriesData]) => {
      if (!active) return;
      setPlants(plantsData);
      setPlanters(plantersData);
      setAccessories(accessoriesData);
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    setPlantFilters(parsePlantFilters(searchParams));
    setPlanterFilters(parsePlanterFilters(searchParams));
    if (accessoryCategory) {
      setAccessoryFilters(parseAccessoryFilters(searchParams, accessoryCategory));
    } else {
      setAccessoryFilters({});
    }
  }, [searchParams, accessoryCategory]);

  const filteredPlants = useMemo(
    () => searchPlantsByText(filterPlants(plants, plantFilters), searchQuery),
    [plantFilters, plants, searchQuery]
  );

  const filteredPlanters = useMemo(
    () => searchPlantersByText(filterPlanters(planters, planterFilters), searchQuery),
    [planterFilters, planters, searchQuery]
  );

  const accessoryItems = useMemo(
    () =>
      accessoryCategory
        ? getAccessoriesByCategory(accessories, accessoryCategory)
        : [],
    [accessories, accessoryCategory]
  );

  const filteredAccessories = useMemo(
    () =>
      searchAccessoriesByText(
        filterAccessories(accessoryItems, accessoryFilters),
        searchQuery
      ),
    [accessoryItems, accessoryFilters, searchQuery]
  );

  const plantFilterCount = countActivePlantFilters(plantFilters);
  const planterFilterCount = countActivePlanterFilters(planterFilters);
  const accessoryFilterCount = countActiveAccessoryFilters(accessoryFilters);
  const hasQuery = searchQuery.trim().length > 0;

  function clearSearch() {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("q");
    router.replace(`/app/plantas?${params.toString()}`);
  }

  function setTab(tab: CatalogTab) {
    const params = new URLSearchParams();
    params.set("tab", tab);
    if (searchQuery) params.set("q", searchQuery);
    router.replace(`/app/plantas?${params.toString()}`);
  }

  function updatePlantFilters(filters: PlantFilterState) {
    const params = plantFiltersToParams(filters);
    if (searchQuery) params.set("q", searchQuery);
    router.replace(`/app/plantas?${params.toString()}`);
  }

  function updatePlanterFilters(filters: PlanterFilterState) {
    const params = planterFiltersToParams(filters);
    if (searchQuery) params.set("q", searchQuery);
    router.replace(`/app/plantas?${params.toString()}`);
  }

  function updateAccessoryFilters(filters: AccessoryFilterState) {
    const params = accessoryFiltersToParams(filters, activeTab);
    if (searchQuery) params.set("q", searchQuery);
    router.replace(`/app/plantas?${params.toString()}`);
  }

  const descriptions: Record<CatalogTab, string> = {
    plantas:
      plantFilterCount > 0 || hasQuery
        ? `${filteredPlants.length} de ${plants.length} especies coinciden con tu búsqueda.`
        : `${filteredPlants.length} especies disponibles para tu espacio.`,
    macetas:
      planterFilterCount > 0 || hasQuery
        ? `${filteredPlanters.length} de ${planters.length} macetas coinciden con tu búsqueda.`
        : `${filteredPlanters.length} macetas para combinar con tus plantas.`,
    platos:
      accessoryFilterCount > 0 || hasQuery
        ? `${filteredAccessories.length} de ${accessoryItems.length} platos coinciden con tu búsqueda.`
        : `${filteredAccessories.length} platos maceteros para proteger tus superficies.`,
    sustratos:
      accessoryFilterCount > 0 || hasQuery
        ? `${filteredAccessories.length} de ${accessoryItems.length} sustratos coinciden con tu búsqueda.`
        : `${filteredAccessories.length} sustratos para cada tipo de planta.`,
    mulch:
      accessoryFilterCount > 0 || hasQuery
        ? `${filteredAccessories.length} de ${accessoryItems.length} cubiertas coinciden con tu búsqueda.`
        : `${filteredAccessories.length} cubiertas para tus macetas.`,
  };

  if (loading && activeTab === "plantas") {
    return (
      <div className="container-app py-10">
        <p className="text-brand-carbon/50">Cargando catálogo...</p>
      </div>
    );
  }

  return (
    <div className="container-app py-10">
      <div className="relative">
        <CatalogHeroDecoration />

        <span className="eyebrow inline-flex items-center gap-2">
          <Leaf className="h-3.5 w-3.5" />
          Catálogo
          <Leaf className="h-3.5 w-3.5" />
        </span>
        <h1 className="mt-3 font-serif text-4xl text-brand-forest sm:text-5xl">
          Explorar catálogo
        </h1>
        <p className="mt-2 text-sm text-brand-carbon/65">
          {descriptions[activeTab]}
        </p>

        {hasQuery && (
          <button
            type="button"
            onClick={clearSearch}
            className="mt-3 inline-flex items-center gap-2 rounded-full border border-brand-forest/20 bg-brand-forest/5 px-3 py-1.5 text-xs font-medium text-brand-forest transition-colors hover:bg-brand-forest/10"
          >
            Resultados para “{searchQuery}”
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      <div className="mt-6 flex gap-1 overflow-x-auto border-b border-brand-beige">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setTab(tab.id)}
            className={`whitespace-nowrap border-b-2 px-4 py-2.5 text-sm font-semibold transition-colors ${
              activeTab === tab.id
                ? "border-brand-forest text-brand-forest"
                : "border-transparent text-brand-carbon/55 hover:text-brand-forest"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "plantas" && (
        <>
          <PlantFilterPanel
            filters={plantFilters}
            activeCount={plantFilterCount}
            onChange={updatePlantFilters}
            onClear={() => updatePlantFilters(EMPTY_PLANT_FILTERS)}
          />

          {filteredPlants.length === 0 ? (
            <EmptyCatalogMessage
              message={
                hasQuery
                  ? `No encontramos plantas para “${searchQuery}”. Prueba otro término o ajusta los filtros.`
                  : "No hay plantas que coincidan con los filtros seleccionados."
              }
            />
          ) : (
            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {filteredPlants.map((plant) => (
                <PlantCard key={plant.id} plant={plant} />
              ))}
            </div>
          )}
        </>
      )}

      {activeTab === "macetas" && (
        <>
          <PlanterFilterPanel
            filters={planterFilters}
            activeCount={planterFilterCount}
            onChange={updatePlanterFilters}
            onClear={() => updatePlanterFilters(EMPTY_PLANTER_FILTERS)}
          />

          {filteredPlanters.length === 0 ? (
            <EmptyCatalogMessage
              message={
                hasQuery
                  ? `No encontramos macetas para “${searchQuery}”. Prueba otro término o ajusta los filtros.`
                  : "No hay macetas que coincidan con los filtros seleccionados."
              }
            />
          ) : (
            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {filteredPlanters.map((planter) => (
                <PlanterCard key={planter.id} planter={planter} />
              ))}
            </div>
          )}
        </>
      )}

      {accessoryCategory && (
        <>
          <AccessoryFilterPanel
            category={accessoryCategory}
            filters={accessoryFilters}
            activeCount={accessoryFilterCount}
            onChange={updateAccessoryFilters}
            onClear={() =>
              updateAccessoryFilters(emptyAccessoryFilters(accessoryCategory))
            }
          />

          {filteredAccessories.length === 0 ? (
            <EmptyCatalogMessage
              message={
                hasQuery
                  ? `No encontramos resultados para “${searchQuery}”. Prueba otro término o ajusta los filtros.`
                  : "No hay productos que coincidan con los filtros seleccionados."
              }
            />
          ) : (
            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {filteredAccessories.map((accessory) => (
                <AccessoryCard key={accessory.id} accessory={accessory} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function EmptyCatalogMessage({ message }: { message: string }) {
  return (
    <div className="mt-8 rounded-lg border border-brand-beige bg-brand-cream/50 p-8 text-center">
      <p className="text-sm text-brand-carbon/65">{message}</p>
    </div>
  );
}
