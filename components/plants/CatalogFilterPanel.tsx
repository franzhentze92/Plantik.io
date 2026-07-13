"use client";

import { RotateCcw, SlidersHorizontal, X } from "lucide-react";
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

function FilterChip({
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

function FilterSection({
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
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

function ActiveTag({
  label,
  onRemove,
}: {
  label: string;
  onRemove: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onRemove}
      className="inline-flex items-center gap-1 rounded-full border border-brand-forest/20 bg-brand-forest/5 px-2.5 py-1 text-[11px] font-medium text-brand-forest transition-colors hover:bg-brand-forest/10"
    >
      {label}
      <X className="h-3 w-3" />
    </button>
  );
}

export function PlantFilterPanel({
  filters,
  activeCount,
  onChange,
  onClear,
}: {
  filters: PlantFilterState;
  activeCount: number;
  onChange: (filters: PlantFilterState) => void;
  onClear: () => void;
}) {
  function toggle(groupKey: keyof PlantFilterState, optionId: string) {
    const current = filters[groupKey];
    const next = current.includes(optionId)
      ? current.filter((id) => id !== optionId)
      : [...current, optionId];
    onChange({ ...filters, [groupKey]: next });
  }

  const activeTags = PLANT_FILTER_GROUPS.flatMap((group) =>
    filters[group.key].map((id) => ({
      key: `${group.key}-${id}`,
      label: group.options.find((o) => o.id === id)?.label ?? id,
      onRemove: () => toggle(group.key, id),
    }))
  );

  return (
    <FilterPanelShell activeCount={activeCount} activeTags={activeTags} onClear={onClear}>
      <div className="grid gap-x-6 gap-y-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {PLANT_FILTER_GROUPS.map((group) => (
          <FilterSection key={group.key} label={group.label}>
            {group.options.map((option) => (
              <FilterChip
                key={option.id}
                active={filters[group.key].includes(option.id)}
                option={option}
                onClick={() => toggle(group.key, option.id)}
              />
            ))}
          </FilterSection>
        ))}
      </div>
    </FilterPanelShell>
  );
}

export function PlanterFilterPanel({
  filters,
  activeCount,
  onChange,
  onClear,
}: {
  filters: PlanterFilterState;
  activeCount: number;
  onChange: (filters: PlanterFilterState) => void;
  onClear: () => void;
}) {
  function toggleList(
    key: keyof Omit<PlanterFilterState, "drenaje">,
    optionId: string
  ) {
    const current = filters[key];
    const next = current.includes(optionId)
      ? current.filter((id) => id !== optionId)
      : [...current, optionId];
    onChange({ ...filters, [key]: next });
  }

  const activeTags = [
    ...PLANTER_FILTER_GROUPS.flatMap((group) =>
      filters[group.key].map((id) => ({
        key: `${group.key}-${id}`,
        label: group.options.find((o) => o.id === id)?.label ?? id,
        onRemove: () => toggleList(group.key, id),
      }))
    ),
    ...(filters.drenaje
      ? [
          {
            key: "drenaje",
            label: "Con drenaje",
            onRemove: () => onChange({ ...filters, drenaje: false }),
          },
        ]
      : []),
  ];

  return (
    <FilterPanelShell activeCount={activeCount} activeTags={activeTags} onClear={onClear}>
      <div className="grid gap-x-6 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
        {PLANTER_FILTER_GROUPS.map((group) => (
          <FilterSection key={group.key} label={group.label}>
            {group.options.map((option) => (
              <FilterChip
                key={option.id}
                active={filters[group.key].includes(option.id)}
                option={option}
                onClick={() => toggleList(group.key, option.id)}
              />
            ))}
          </FilterSection>
        ))}
        <FilterSection label="Otros">
          <FilterChip
            active={filters.drenaje}
            option={{ id: "drenaje", label: "Con drenaje", icon: DRENAJE_ICON }}
            onClick={() => onChange({ ...filters, drenaje: !filters.drenaje })}
          />
        </FilterSection>
      </div>
    </FilterPanelShell>
  );
}

export function AccessoryFilterPanel({
  category,
  filters,
  activeCount,
  onChange,
  onClear,
}: {
  category: AccessoryCategory;
  filters: AccessoryFilterState;
  activeCount: number;
  onChange: (filters: AccessoryFilterState) => void;
  onClear: () => void;
}) {
  const groups = ACCESSORY_FILTER_GROUPS[category];

  function toggle(groupKey: string, optionId: string) {
    const current = filters[groupKey] ?? [];
    const next = current.includes(optionId)
      ? current.filter((id) => id !== optionId)
      : [...current, optionId];
    onChange({ ...filters, [groupKey]: next });
  }

  const activeTags = groups.flatMap((group) =>
    (filters[group.key] ?? []).map((id) => ({
      key: `${group.key}-${id}`,
      label: group.options.find((o) => o.id === id)?.label ?? id,
      onRemove: () => toggle(group.key, id),
    }))
  );

  return (
    <FilterPanelShell
      activeCount={activeCount}
      activeTags={activeTags}
      onClear={onClear}
    >
      <div className="grid gap-x-6 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
        {groups.map((group) => (
          <FilterSection key={group.key} label={group.label}>
            {group.options.map((option) => (
              <FilterChip
                key={option.id}
                active={(filters[group.key] ?? []).includes(option.id)}
                option={option}
                onClick={() => toggle(group.key, option.id)}
              />
            ))}
          </FilterSection>
        ))}
      </div>
    </FilterPanelShell>
  );
}

function FilterPanelShell({
  activeCount,
  activeTags,
  onClear,
  children,
}: {
  activeCount: number;
  activeTags: { key: string; label: string; onRemove: () => void }[];
  onClear: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="mt-6 rounded-xl2 border border-brand-beige/80 bg-white shadow-soft">
      <div className="flex items-center justify-between gap-3 border-b border-brand-beige/60 px-4 py-3.5 sm:px-6">
        <div className="flex items-center gap-2 text-sm font-semibold text-brand-forest">
          <SlidersHorizontal className="h-4 w-4" />
          Filtros
          {activeCount > 0 && (
            <span className="rounded-full bg-brand-forest px-2 py-0.5 text-[10px] font-bold text-white">
              {activeCount}
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={onClear}
          disabled={activeCount === 0}
          className="inline-flex items-center gap-1.5 rounded-full border border-brand-beige bg-white px-3 py-1.5 text-xs font-medium text-brand-carbon/70 transition-colors hover:border-brand-forest/40 hover:text-brand-forest disabled:cursor-not-allowed disabled:opacity-50"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Limpiar filtros
        </button>
      </div>

      <div className="space-y-5 px-4 py-5 sm:px-6">
        {children}
        {activeTags.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 border-t border-brand-beige/60 pt-4">
            <span className="text-[11px] font-medium text-brand-carbon/45">
              Activos:
            </span>
            {activeTags.map((tag) => (
              <ActiveTag key={tag.key} label={tag.label} onRemove={tag.onRemove} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
