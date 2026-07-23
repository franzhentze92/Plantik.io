"use client";

import {
  LayoutGrid,
  Leaf,
  Package,
  RotateCcw,
  Shapes,
  SlidersHorizontal,
  Sprout,
} from "lucide-react";
import {
  ACCESSORY_FILTER_GROUPS,
  AccessoryFilterState,
  DRENAJE_ICON,
  FilterOption,
  PLANT_FILTER_GROUPS,
  PLANTER_FILTER_GROUPS,
  PlantFilterState,
  PlanterFilterState,
} from "@/lib/catalog-filters";
import type { AccessoryCategory } from "@/data/accessories";

export type CatalogView =
  | "todos"
  | "plantas"
  | "macetas"
  | "platos"
  | "sustratos"
  | "mulch";

export const CATALOG_TYPE_OPTIONS: {
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

export function CatalogFilterSidebar({
  view,
  counts,
  onViewChange,
  plantFilters,
  planterFilters,
  accessoryFilters,
  accessoryCategory,
  plantFilterCount,
  planterFilterCount,
  accessoryFilterCount,
  onPlantFiltersChange,
  onPlanterFiltersChange,
  onAccessoryFiltersChange,
  onClearFilters,
}: {
  view: CatalogView;
  counts: Record<CatalogView, number>;
  onViewChange: (view: CatalogView) => void;
  plantFilters: PlantFilterState;
  planterFilters: PlanterFilterState;
  accessoryFilters: AccessoryFilterState;
  accessoryCategory?: AccessoryCategory;
  plantFilterCount: number;
  planterFilterCount: number;
  accessoryFilterCount: number;
  onPlantFiltersChange: (filters: PlantFilterState) => void;
  onPlanterFiltersChange: (filters: PlanterFilterState) => void;
  onAccessoryFiltersChange: (filters: AccessoryFilterState) => void;
  onClearFilters: () => void;
}) {
  const activeFilterCount =
    view === "plantas"
      ? plantFilterCount
      : view === "macetas"
        ? planterFilterCount
        : accessoryCategory
          ? accessoryFilterCount
          : 0;

  return (
    <div className="space-y-6 rounded-xl2 border border-brand-beige/80 bg-white p-5 shadow-soft">
      <SidebarSection label="Tipo de producto">
        <div className="space-y-1.5">
          {CATALOG_TYPE_OPTIONS.map((option) => {
            const Icon = option.icon;
            const active = view === option.id;
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => onViewChange(option.id)}
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
              onClick={onClearFilters}
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
                        onPlantFiltersChange({
                          ...plantFilters,
                          [group.key]: plantFilters[group.key].includes(option.id)
                            ? plantFilters[group.key].filter((id) => id !== option.id)
                            : [...plantFilters[group.key], option.id],
                        })
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
                          onPlanterFiltersChange({
                            ...planterFilters,
                            [group.key]: planterFilters[group.key].includes(
                              option.id
                            )
                              ? planterFilters[group.key].filter(
                                  (id) => id !== option.id
                                )
                              : [...planterFilters[group.key], option.id],
                          })
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
                      onPlanterFiltersChange({
                        ...planterFilters,
                        drenaje: !planterFilters.drenaje,
                      })
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
                      onClick={() => {
                        const current = accessoryFilters[group.key] ?? [];
                        onAccessoryFiltersChange({
                          ...accessoryFilters,
                          [group.key]: current.includes(option.id)
                            ? current.filter((id) => id !== option.id)
                            : [...current, option.id],
                        });
                      }}
                    />
                  ))}
                </div>
              </SidebarSection>
            ))}
        </>
      )}
    </div>
  );
}
