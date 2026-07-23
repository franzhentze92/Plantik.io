"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PlantCard } from "@/components/plants/PlantCard";
import { PlanterCard } from "@/components/plants/PlanterCard";
import { AccessoryCard } from "@/components/plants/AccessoryCard";
import {
  CatalogFilterSidebar,
  CATALOG_TYPE_OPTIONS,
  CatalogView,
} from "@/components/plants/CatalogFilterPanel";
import { CatalogHeroDecoration } from "@/components/plants/CatalogHeroDecoration";
import { Leaf, SlidersHorizontal, X } from "lucide-react";
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
import {
  getPlantsCached,
  getPlantersCached,
  getAccessoriesCached,
  getAccessoriesByCategory,
} from "@/lib/supabase-queries";
import { Plant, Planter } from "@/types";
import type { Accessory, AccessoryCategory } from "@/data/accessories";

const VIEW_TO_CATEGORY: Partial<Record<CatalogView, AccessoryCategory>> = {
  platos: "plato",
  sustratos: "sustrato",
  mulch: "mulch",
};

function normalizeView(value: string | null): CatalogView {
  const found = CATALOG_TYPE_OPTIONS.find((t) => t.id === value);
  return found ? found.id : "todos";
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
  const activeView = normalizeView(searchParams.get("tab"));
  const searchQuery = searchParams.get("q") ?? "";
  const accessoryCategory = VIEW_TO_CATEGORY[activeView];

  const [filtersOpen, setFiltersOpen] = useState(false);
  const [plantFilters, setPlantFilters] =
    useState<PlantFilterState>(EMPTY_PLANT_FILTERS);
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
    () =>
      searchPlantersByText(filterPlanters(planters, planterFilters), searchQuery),
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

  const todosPlants = useMemo(
    () => searchPlantsByText(plants, searchQuery),
    [plants, searchQuery]
  );
  const todosPlanters = useMemo(
    () => searchPlantersByText(planters, searchQuery),
    [planters, searchQuery]
  );
  const todosAccessories = useMemo(
    () => searchAccessoriesByText(accessories, searchQuery),
    [accessories, searchQuery]
  );

  const plantFilterCount = countActivePlantFilters(plantFilters);
  const planterFilterCount = countActivePlanterFilters(planterFilters);
  const accessoryFilterCount = countActiveAccessoryFilters(accessoryFilters);
  const hasQuery = searchQuery.trim().length > 0;

  const counts: Record<CatalogView, number> = {
    todos: plants.length + planters.length + accessories.length,
    plantas: plants.length,
    macetas: planters.length,
    platos: getAccessoriesByCategory(accessories, "plato").length,
    sustratos: getAccessoriesByCategory(accessories, "sustrato").length,
    mulch: getAccessoriesByCategory(accessories, "mulch").length,
  };

  const totalShown =
    activeView === "todos"
      ? todosPlants.length + todosPlanters.length + todosAccessories.length
      : activeView === "plantas"
        ? filteredPlants.length
        : activeView === "macetas"
          ? filteredPlanters.length
          : filteredAccessories.length;

  const activeFilterCount =
    activeView === "plantas"
      ? plantFilterCount
      : activeView === "macetas"
        ? planterFilterCount
        : accessoryCategory
          ? accessoryFilterCount
          : 0;

  function clearSearch() {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("q");
    const qs = params.toString();
    router.replace(qs ? `/app/plantas?${qs}` : "/app/plantas");
  }

  function setView(view: CatalogView) {
    const params = new URLSearchParams();
    if (view !== "todos") params.set("tab", view);
    if (searchQuery) params.set("q", searchQuery);
    const qs = params.toString();
    router.replace(qs ? `/app/plantas?${qs}` : "/app/plantas");
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
    const params = accessoryFiltersToParams(filters, activeView);
    if (searchQuery) params.set("q", searchQuery);
    router.replace(`/app/plantas?${params.toString()}`);
  }

  function clearAllFilters() {
    if (activeView === "plantas") {
      updatePlantFilters(EMPTY_PLANT_FILTERS);
    } else if (activeView === "macetas") {
      updatePlanterFilters(EMPTY_PLANTER_FILTERS);
    } else if (accessoryCategory) {
      updateAccessoryFilters(emptyAccessoryFilters(accessoryCategory));
    }
  }

  if (loading) {
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
          {totalShown} {totalShown === 1 ? "producto" : "productos"}
          {hasQuery ? ` para “${searchQuery}”` : ""}
          {activeView !== "todos"
            ? ` en ${CATALOG_TYPE_OPTIONS.find((t) => t.id === activeView)?.label.toLowerCase()}`
            : " disponibles"}
          .
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

      <button
        type="button"
        onClick={() => setFiltersOpen((v) => !v)}
        className="mt-6 inline-flex items-center gap-2 rounded-full border border-brand-beige bg-white px-4 py-2.5 text-sm font-semibold text-brand-forest shadow-soft lg:hidden"
      >
        <SlidersHorizontal className="h-4 w-4" />
        Filtros y categorías
        {activeFilterCount > 0 && (
          <span className="rounded-full bg-brand-forest px-2 py-0.5 text-[10px] font-bold text-white">
            {activeFilterCount}
          </span>
        )}
      </button>

      <div className="mt-6 grid gap-6 lg:grid-cols-[260px_1fr] lg:items-start">
        <aside
          className={`${
            filtersOpen ? "block" : "hidden"
          } lg:block lg:sticky lg:top-24`}
        >
          <CatalogFilterSidebar
            view={activeView}
            counts={counts}
            onViewChange={setView}
            plantFilters={plantFilters}
            planterFilters={planterFilters}
            accessoryFilters={accessoryFilters}
            accessoryCategory={accessoryCategory}
            plantFilterCount={plantFilterCount}
            planterFilterCount={planterFilterCount}
            accessoryFilterCount={accessoryFilterCount}
            onPlantFiltersChange={updatePlantFilters}
            onPlanterFiltersChange={updatePlanterFilters}
            onAccessoryFiltersChange={updateAccessoryFilters}
            onClearFilters={clearAllFilters}
          />
        </aside>

        <div>
          {activeView === "todos" && (
            <MixedGrid
              plants={todosPlants}
              planters={todosPlanters}
              accessories={todosAccessories}
              hasQuery={hasQuery}
              searchQuery={searchQuery}
            />
          )}

          {activeView === "plantas" &&
            (filteredPlants.length === 0 ? (
              <EmptyCatalogMessage
                message={
                  hasQuery
                    ? `No encontramos plantas para “${searchQuery}”. Prueba otro término o ajusta los filtros.`
                    : "No hay plantas que coincidan con los filtros seleccionados."
                }
              />
            ) : (
              <ProductGrid>
                {filteredPlants.map((plant) => (
                  <PlantCard key={plant.id} plant={plant} />
                ))}
              </ProductGrid>
            ))}

          {activeView === "macetas" &&
            (filteredPlanters.length === 0 ? (
              <EmptyCatalogMessage
                message={
                  hasQuery
                    ? `No encontramos macetas para “${searchQuery}”. Prueba otro término o ajusta los filtros.`
                    : "No hay macetas que coincidan con los filtros seleccionados."
                }
              />
            ) : (
              <ProductGrid>
                {filteredPlanters.map((planter) => (
                  <PlanterCard key={planter.id} planter={planter} />
                ))}
              </ProductGrid>
            ))}

          {accessoryCategory &&
            (filteredAccessories.length === 0 ? (
              <EmptyCatalogMessage
                message={
                  hasQuery
                    ? `No encontramos resultados para “${searchQuery}”. Prueba otro término o ajusta los filtros.`
                    : "No hay productos que coincidan con los filtros seleccionados."
                }
              />
            ) : (
              <ProductGrid>
                {filteredAccessories.map((accessory) => (
                  <AccessoryCard key={accessory.id} accessory={accessory} />
                ))}
              </ProductGrid>
            ))}
        </div>
      </div>
    </div>
  );
}

function MixedGrid({
  plants,
  planters,
  accessories,
  hasQuery,
  searchQuery,
}: {
  plants: Plant[];
  planters: Planter[];
  accessories: Accessory[];
  hasQuery: boolean;
  searchQuery: string;
}) {
  const total = plants.length + planters.length + accessories.length;
  if (total === 0) {
    return (
      <EmptyCatalogMessage
        message={
          hasQuery
            ? `No encontramos productos para “${searchQuery}”. Prueba con otro término.`
            : "No hay productos disponibles por ahora."
        }
      />
    );
  }
  return (
    <ProductGrid>
      {plants.map((plant) => (
        <PlantCard key={`plant-${plant.id}`} plant={plant} />
      ))}
      {planters.map((planter) => (
        <PlanterCard key={`planter-${planter.id}`} planter={planter} />
      ))}
      {accessories.map((accessory) => (
        <AccessoryCard key={`accessory-${accessory.id}`} accessory={accessory} />
      ))}
    </ProductGrid>
  );
}

function ProductGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">{children}</div>
  );
}

function EmptyCatalogMessage({ message }: { message: string }) {
  return (
    <div className="rounded-xl2 border border-brand-beige bg-white p-10 text-center shadow-soft">
      <p className="text-sm text-brand-carbon/65">{message}</p>
    </div>
  );
}
