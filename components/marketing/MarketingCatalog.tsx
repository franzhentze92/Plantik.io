"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  LayoutGrid,
  Leaf,
  Package,
  RotateCcw,
  Search,
  Shapes,
  SlidersHorizontal,
  Sprout,
  X,
} from "lucide-react";
import { MarketingPlantCard } from "@/components/marketing/MarketingPlantCard";
import { MarketingPlanterCard } from "@/components/marketing/MarketingPlanterCard";
import { MarketingAccessoryCard } from "@/components/marketing/MarketingAccessoryCard";
import {
  countActivePlantFilters,
  countActivePlanterFilters,
  countActiveAccessoryFilters,
  DRENAJE_ICON,
  EMPTY_PLANT_FILTERS,
  EMPTY_PLANTER_FILTERS,
  emptyAccessoryFilters,
  filterPlants,
  filterPlanters,
  filterAccessories,
  searchPlantsByText,
  searchPlantersByText,
  searchAccessoriesByText,
  ACCESSORY_FILTER_GROUPS,
  PLANT_FILTER_GROUPS,
  PLANTER_FILTER_GROUPS,
  FilterOption,
  PlantFilterState,
  PlanterFilterState,
  AccessoryFilterState,
} from "@/lib/catalog-filters";
import { getAccessoriesByCategory } from "@/lib/supabase-queries";
import { Plant, Planter } from "@/types";
import type { Accessory, AccessoryCategory } from "@/data/accessories";

type CatalogView = "todos" | "plantas" | "macetas" | "platos" | "sustratos" | "mulch";

const TYPE_OPTIONS: {
  id: CatalogView;
  label: string;
  icon: typeof LayoutGrid;
}[] = [
  { id: "todos", label: "Todos los productos", icon: LayoutGrid },
  { id: "plantas", label: "Plantas", icon: Sprout },
  { id: "macetas", label: "Macetas", icon: Package },
  { id: "platos", label: "Platos", icon: Shapes },
  { id: "sustratos", label: "Sustratos", icon: Leaf },
  { id: "mulch", label: "Cubiertas", icon: Leaf },
];

const VIEW_TO_CATEGORY: Partial<Record<CatalogView, AccessoryCategory>> = {
  platos: "plato",
  sustratos: "sustrato",
  mulch: "mulch",
};

function normalizeView(value: string | null): CatalogView {
  const found = TYPE_OPTIONS.find((t) => t.id === value);
  return found ? found.id : "todos";
}

export function MarketingCatalog(props: {
  plants: Plant[];
  planters: Planter[];
  accessories: Accessory[];
}) {
  return (
    <Suspense fallback={null}>
      <CatalogInner {...props} />
    </Suspense>
  );
}

function CatalogInner({
  plants,
  planters,
  accessories,
}: {
  plants: Plant[];
  planters: Planter[];
  accessories: Accessory[];
}) {
  const searchParams = useSearchParams();
  const [view, setView] = useState<CatalogView>(
    normalizeView(searchParams.get("tab"))
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [plantFilters, setPlantFilters] = useState<PlantFilterState>(EMPTY_PLANT_FILTERS);
  const [planterFilters, setPlanterFilters] =
    useState<PlanterFilterState>(EMPTY_PLANTER_FILTERS);
  const [accessoryFilters, setAccessoryFilters] = useState<AccessoryFilterState>({});

  const accessoryCategory = VIEW_TO_CATEGORY[view];
  const hasQuery = searchQuery.trim().length > 0;

  // Type-specific (filtered) collections.
  const filteredPlants = useMemo(
    () => searchPlantsByText(filterPlants(plants, plantFilters), searchQuery),
    [plantFilters, plants, searchQuery]
  );
  const filteredPlanters = useMemo(
    () => searchPlantersByText(filterPlanters(planters, planterFilters), searchQuery),
    [planterFilters, planters, searchQuery]
  );
  const categoryAccessories = useMemo(
    () =>
      accessoryCategory
        ? getAccessoriesByCategory(accessories, accessoryCategory)
        : [],
    [accessories, accessoryCategory]
  );
  const filteredCategoryAccessories = useMemo(
    () =>
      searchAccessoriesByText(
        filterAccessories(categoryAccessories, accessoryFilters),
        searchQuery
      ),
    [categoryAccessories, accessoryFilters, searchQuery]
  );

  // "Todos" collections — only search applies, products are mixed.
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

  const counts = {
    todos: plants.length + planters.length + accessories.length,
    plantas: plants.length,
    macetas: planters.length,
    platos: getAccessoriesByCategory(accessories, "plato").length,
    sustratos: getAccessoriesByCategory(accessories, "sustrato").length,
    mulch: getAccessoriesByCategory(accessories, "mulch").length,
  };

  const totalShown =
    view === "todos"
      ? todosPlants.length + todosPlanters.length + todosAccessories.length
      : view === "plantas"
        ? filteredPlants.length
        : view === "macetas"
          ? filteredPlanters.length
          : filteredCategoryAccessories.length;

  function clearAllFilters() {
    setPlantFilters(EMPTY_PLANT_FILTERS);
    setPlanterFilters(EMPTY_PLANTER_FILTERS);
    setAccessoryFilters(
      accessoryCategory ? emptyAccessoryFilters(accessoryCategory) : {}
    );
  }

  function handleViewChange(next: CatalogView) {
    setView(next);
    const cat = VIEW_TO_CATEGORY[next];
    setAccessoryFilters(cat ? emptyAccessoryFilters(cat) : {});
  }

  const activeFilterCount =
    view === "plantas"
      ? plantFilterCount
      : view === "macetas"
        ? planterFilterCount
        : accessoryCategory
          ? accessoryFilterCount
          : 0;

  return (
    <div className="mt-12">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="eyebrow inline-flex items-center gap-2">
            <Leaf className="h-3.5 w-3.5" />
            Catálogo
            <Leaf className="h-3.5 w-3.5" />
          </span>
          <h2 className="mt-2 font-serif text-3xl text-brand-forest">
            Explora nuestros productos
          </h2>
          <p className="mt-1 text-sm text-brand-carbon/65">
            {totalShown}{" "}
            {totalShown === 1 ? "producto" : "productos"}
            {hasQuery ? ` para “${searchQuery}”` : ""}
            {view !== "todos"
              ? ` en ${TYPE_OPTIONS.find((t) => t.id === view)?.label.toLowerCase()}`
              : " disponibles"}
            .
          </p>
        </div>

        <div className="relative w-full sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-carbon/40" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar productos…"
            className="w-full rounded-full border border-brand-beige bg-white py-2.5 pl-10 pr-10 text-sm text-brand-carbon placeholder:text-brand-carbon/40 focus:border-brand-forest/40 focus:outline-none focus:ring-2 focus:ring-brand-forest/10"
          />
          {hasQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              aria-label="Limpiar búsqueda"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-carbon/40 hover:text-brand-forest"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Mobile filters toggle */}
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
        {/* Sidebar */}
        <aside
          className={`${
            filtersOpen ? "block" : "hidden"
          } lg:block lg:sticky lg:top-24`}
        >
          <div className="space-y-6 rounded-xl2 border border-brand-beige/80 bg-white p-5 shadow-soft">
            {/* Product type */}
            <SidebarSection label="Tipo de producto">
              <div className="space-y-1.5">
                {TYPE_OPTIONS.map((option) => {
                  const Icon = option.icon;
                  const active = view === option.id;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => handleViewChange(option.id)}
                      className={`flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-colors ${
                        active
                          ? "bg-brand-forest text-white"
                          : "text-brand-carbon/75 hover:bg-brand-sage/60"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        {option.label}
                      </span>
                      <span
                        className={`text-[11px] font-semibold ${
                          active ? "text-white/70" : "text-brand-carbon/40"
                        }`}
                      >
                        {counts[option.id]}
                      </span>
                    </button>
                  );
                })}
              </div>
            </SidebarSection>

            {/* Type-specific filters */}
            {view === "todos" ? (
              <p className="rounded-xl border border-dashed border-brand-beige bg-brand-cream/50 p-3 text-[11px] leading-relaxed text-brand-carbon/55">
                Selecciona un tipo de producto para filtrar por características
                específicas.
              </p>
            ) : (
              <>
                <div className="flex items-center justify-between border-t border-brand-beige/60 pt-5">
                  <span className="flex items-center gap-2 text-sm font-semibold text-brand-forest">
                    <SlidersHorizontal className="h-4 w-4" />
                    Filtros
                    {activeFilterCount > 0 && (
                      <span className="rounded-full bg-brand-forest px-2 py-0.5 text-[10px] font-bold text-white">
                        {activeFilterCount}
                      </span>
                    )}
                  </span>
                  <button
                    type="button"
                    onClick={clearAllFilters}
                    disabled={activeFilterCount === 0}
                    className="inline-flex items-center gap-1 text-xs font-medium text-brand-carbon/60 transition-colors hover:text-brand-forest disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    Limpiar
                  </button>
                </div>

                {view === "plantas" &&
                  PLANT_FILTER_GROUPS.map((group) => (
                    <SidebarSection key={group.key} label={group.label}>
                      <div className="flex flex-wrap gap-2">
                        {group.options.map((option) => (
                          <SidebarChip
                            key={option.id}
                            option={option}
                            active={plantFilters[group.key].includes(option.id)}
                            onClick={() =>
                              setPlantFilters((f) => ({
                                ...f,
                                [group.key]: f[group.key].includes(option.id)
                                  ? f[group.key].filter((id) => id !== option.id)
                                  : [...f[group.key], option.id],
                              }))
                            }
                          />
                        ))}
                      </div>
                    </SidebarSection>
                  ))}

                {view === "macetas" && (
                  <>
                    {PLANTER_FILTER_GROUPS.map((group) => (
                      <SidebarSection key={group.key} label={group.label}>
                        <div className="flex flex-wrap gap-2">
                          {group.options.map((option) => (
                            <SidebarChip
                              key={option.id}
                              option={option}
                              active={planterFilters[group.key].includes(option.id)}
                              onClick={() =>
                                setPlanterFilters((f) => ({
                                  ...f,
                                  [group.key]: f[group.key].includes(option.id)
                                    ? f[group.key].filter((id) => id !== option.id)
                                    : [...f[group.key], option.id],
                                }))
                              }
                            />
                          ))}
                        </div>
                      </SidebarSection>
                    ))}
                    <SidebarSection label="Otros">
                      <div className="flex flex-wrap gap-2">
                        <SidebarChip
                          option={{
                            id: "drenaje",
                            label: "Con drenaje",
                            icon: DRENAJE_ICON,
                          }}
                          active={planterFilters.drenaje}
                          onClick={() =>
                            setPlanterFilters((f) => ({
                              ...f,
                              drenaje: !f.drenaje,
                            }))
                          }
                        />
                      </div>
                    </SidebarSection>
                  </>
                )}

                {accessoryCategory &&
                  ACCESSORY_FILTER_GROUPS[accessoryCategory].map((group) => (
                    <SidebarSection key={group.key} label={group.label}>
                      <div className="flex flex-wrap gap-2">
                        {group.options.map((option) => (
                          <SidebarChip
                            key={option.id}
                            option={option}
                            active={(accessoryFilters[group.key] ?? []).includes(
                              option.id
                            )}
                            onClick={() =>
                              setAccessoryFilters((f) => {
                                const current = f[group.key] ?? [];
                                return {
                                  ...f,
                                  [group.key]: current.includes(option.id)
                                    ? current.filter((id) => id !== option.id)
                                    : [...current, option.id],
                                };
                              })
                            }
                          />
                        ))}
                      </div>
                    </SidebarSection>
                  ))}
              </>
            )}
          </div>
        </aside>

        {/* Grid */}
        <div>
          {view === "todos" && (
            <MixedGrid
              plants={todosPlants}
              planters={todosPlanters}
              accessories={todosAccessories}
              hasQuery={hasQuery}
              searchQuery={searchQuery}
            />
          )}

          {view === "plantas" &&
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
                  <MarketingPlantCard key={plant.id} plant={plant} />
                ))}
              </ProductGrid>
            ))}

          {view === "macetas" &&
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
                  <MarketingPlanterCard key={planter.id} planter={planter} />
                ))}
              </ProductGrid>
            ))}

          {accessoryCategory &&
            (filteredCategoryAccessories.length === 0 ? (
              <EmptyCatalogMessage
                message={
                  hasQuery
                    ? `No encontramos resultados para “${searchQuery}”. Prueba otro término o ajusta los filtros.`
                    : "No hay productos que coincidan con los filtros seleccionados."
                }
              />
            ) : (
              <ProductGrid>
                {filteredCategoryAccessories.map((accessory) => (
                  <MarketingAccessoryCard key={accessory.id} accessory={accessory} />
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
        <MarketingPlantCard key={`plant-${plant.id}`} plant={plant} />
      ))}
      {planters.map((planter) => (
        <MarketingPlanterCard key={`planter-${planter.id}`} planter={planter} />
      ))}
      {accessories.map((accessory) => (
        <MarketingAccessoryCard
          key={`accessory-${accessory.id}`}
          accessory={accessory}
        />
      ))}
    </ProductGrid>
  );
}

function ProductGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">{children}</div>
  );
}

function SidebarSection({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2.5">
      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-brand-carbon/45">
        {label}
      </p>
      {children}
    </div>
  );
}

function SidebarChip({
  active,
  option,
  onClick,
}: {
  active: boolean;
  option: FilterOption;
  onClick: () => void;
}) {
  const Icon = option.icon;
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
        active
          ? "border-brand-forest bg-brand-forest text-white"
          : "border-brand-beige bg-white text-brand-carbon/75 hover:border-brand-forest/40 hover:text-brand-forest"
      }`}
    >
      {option.swatch ? (
        <span
          className={`h-3 w-3 rounded-full border ${
            active ? "border-white/40" : "border-black/10"
          }`}
          style={{ backgroundColor: option.swatch }}
        />
      ) : Icon ? (
        <Icon className="h-3.5 w-3.5" />
      ) : null}
      {option.label}
    </button>
  );
}

function EmptyCatalogMessage({ message }: { message: string }) {
  return (
    <div className="rounded-xl2 border border-brand-beige bg-white p-10 text-center shadow-soft">
      <p className="text-sm text-brand-carbon/65">{message}</p>
    </div>
  );
}
