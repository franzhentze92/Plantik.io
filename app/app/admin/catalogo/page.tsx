"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Ban,
  ChevronLeft,
  ChevronRight,
  EyeOff,
  Layers,
  Leaf,
  Package,
  RefreshCw,
  Search,
  Shield,
  Sprout,
  Tag,
} from "lucide-react";
import { adminFetch } from "@/lib/admin-api";
import type {
  AdminCatalogKind,
  AdminCatalogResult,
  AdminCatalogStats,
} from "@/lib/supabase/catalog-admin";
import { cn, formatQ } from "@/lib/utils";

const KIND_FILTERS: { value: AdminCatalogKind | "all"; label: string }[] = [
  { value: "all", label: "Todos" },
  { value: "plant", label: "Plantas" },
  { value: "planter", label: "Macetas" },
  { value: "plato", label: "Platos" },
  { value: "sustrato", label: "Sustratos" },
  { value: "mulch", label: "Mulch" },
];

const AVAILABILITY_FILTERS = [
  { value: "all", label: "Disponibilidad" },
  { value: "in_stock", label: "En stock" },
  { value: "out_of_stock", label: "Agotado" },
] as const;

const VISIBILITY_FILTERS = [
  { value: "all", label: "Visibilidad" },
  { value: "visible", label: "Visibles" },
  { value: "hidden", label: "Ocultos" },
] as const;

const KIND_LABELS: Record<AdminCatalogKind, string> = {
  plant: "Planta",
  planter: "Maceta",
  plato: "Plato",
  sustrato: "Sustrato",
  mulch: "Mulch",
};

const KIND_ICONS: Record<AdminCatalogKind, typeof Leaf> = {
  plant: Sprout,
  planter: Package,
  plato: Layers,
  sustrato: Layers,
  mulch: Leaf,
};

function kindBadgeClass(kind: AdminCatalogKind): string {
  switch (kind) {
    case "plant":
      return "bg-brand-sage text-brand-forest";
    case "planter":
      return "bg-emerald-100 text-emerald-800";
    case "plato":
      return "bg-sky-100 text-sky-800";
    case "sustrato":
      return "bg-amber-100 text-amber-800";
    case "mulch":
      return "bg-stone-200 text-stone-700";
  }
}

export default function AdminCatalogPage() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [products, setProducts] = useState<AdminCatalogResult["products"]>([]);
  const [stats, setStats] = useState<AdminCatalogStats | null>(null);
  const [pagination, setPagination] = useState<
    AdminCatalogResult["pagination"]
  >({ page: 1, limit: 24, total: 0, totalPages: 1 });

  const [kindFilter, setKindFilter] = useState<AdminCatalogKind | "all">("all");
  const [availabilityFilter, setAvailabilityFilter] = useState<
    "all" | "in_stock" | "out_of_stock"
  >("all");
  const [visibilityFilter, setVisibilityFilter] = useState<
    "all" | "visible" | "hidden"
  >("all");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const loadCatalog = useCallback(
    async (opts?: { silent?: boolean }) => {
      if (opts?.silent) setRefreshing(true);
      else setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams({
          page: String(page),
          limit: "24",
          kind: kindFilter,
          availability: availabilityFilter,
          hidden: visibilityFilter,
        });
        if (search.trim()) params.set("search", search.trim());

        const res = await adminFetch(`/api/admin/catalog?${params}`);
        if (!res.ok) {
          const body = (await res.json().catch(() => ({}))) as { error?: string };
          throw new Error(body.error ?? "Error al cargar catálogo");
        }

        const data = (await res.json()) as AdminCatalogResult;
        setProducts(data.products);
        setStats(data.stats);
        setPagination(data.pagination);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error desconocido");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [page, search, kindFilter, availabilityFilter, visibilityFilter]
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    void loadCatalog();
  }, [loadCatalog]);

  const kpiCards = useMemo(
    () => [
      {
        label: "Total productos",
        value: stats?.total ?? 0,
        icon: Package,
      },
      {
        label: "Plantas",
        value: stats?.plant ?? 0,
        icon: Sprout,
      },
      {
        label: "Macetas",
        value: stats?.planter ?? 0,
        icon: Layers,
      },
      {
        label: "Con ediciones",
        value: stats?.withOverrides ?? 0,
        icon: Tag,
      },
    ],
    [stats]
  );

  return (
    <div className="container-app py-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="eyebrow inline-flex items-center gap-2">
            <Shield className="h-3.5 w-3.5" />
            Admin · Catálogo
          </span>
          <h1 className="mt-2 font-serif text-3xl text-brand-forest sm:text-4xl">
            Gestión de productos
          </h1>
          <p className="mt-2 text-sm text-brand-carbon/60">
            Edita nombres, descripciones, precios, fotos y visibilidad del
            catálogo.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void loadCatalog({ silent: true })}
          disabled={refreshing}
          className="inline-flex items-center gap-2 self-start rounded-full border border-brand-beige bg-white px-4 py-2 text-sm font-semibold text-brand-forest transition-colors hover:bg-brand-sage/40 disabled:opacity-60"
        >
          <RefreshCw className={cn("h-4 w-4", refreshing && "animate-spin")} />
          Actualizar
        </button>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {kpiCards.map((card) => (
          <div key={card.label} className="card-surface p-4 sm:p-5">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-sage text-brand-forest">
              <card.icon className="h-4 w-4" />
            </span>
            <p className="mt-4 font-serif text-2xl text-brand-forest">
              {card.value}
            </p>
            <p className="text-xs font-medium text-brand-carbon/70">
              {card.label}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-8 space-y-4 card-surface p-4 sm:p-5">
        <div className="relative max-w-xl">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-carbon/40" />
          <input
            type="search"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Buscar por nombre, ID o descripción..."
            className="w-full rounded-xl border border-brand-beige bg-white py-2.5 pl-10 pr-4 text-sm outline-none ring-brand-forest/20 focus:ring-2"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {KIND_FILTERS.map((filter) => (
            <button
              key={filter.value}
              type="button"
              onClick={() => {
                setKindFilter(filter.value);
                setPage(1);
              }}
              className={cn(
                "rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors",
                kindFilter === filter.value
                  ? "bg-brand-forest text-white"
                  : "bg-brand-cream text-brand-carbon/70 hover:bg-brand-sage/60"
              )}
            >
              {filter.label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-3">
          <select
            value={availabilityFilter}
            onChange={(e) => {
              setAvailabilityFilter(
                e.target.value as typeof availabilityFilter
              );
              setPage(1);
            }}
            className="rounded-xl border border-brand-beige bg-white px-3 py-2 text-sm outline-none ring-brand-forest/20 focus:ring-2"
          >
            {AVAILABILITY_FILTERS.map((f) => (
              <option key={f.value} value={f.value}>
                {f.label}
              </option>
            ))}
          </select>
          <select
            value={visibilityFilter}
            onChange={(e) => {
              setVisibilityFilter(e.target.value as typeof visibilityFilter);
              setPage(1);
            }}
            className="rounded-xl border border-brand-beige bg-white px-3 py-2 text-sm outline-none ring-brand-forest/20 focus:ring-2"
          >
            {VISIBILITY_FILTERS.map((f) => (
              <option key={f.value} value={f.value}>
                {f.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <div className="mt-6 rounded-xl2 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="mt-8 p-10 text-center text-sm text-brand-carbon/60 card-surface">
          Cargando catálogo...
        </div>
      ) : products.length === 0 ? (
        <div className="mt-8 flex flex-col items-center gap-3 p-12 text-center card-surface">
          <Ban className="h-10 w-10 text-brand-carbon/30" />
          <p className="font-semibold text-brand-carbon">Sin resultados</p>
          <p className="text-sm text-brand-carbon/55">
            Prueba con otros filtros o términos de búsqueda.
          </p>
        </div>
      ) : (
        <>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {products.map((product) => {
              const KindIcon = KIND_ICONS[product.kind];
              return (
                <article
                  key={product.id}
                  className="overflow-hidden card-surface transition-shadow hover:shadow-card"
                >
                  <div className="relative aspect-[4/3] bg-brand-cream">
                    <Image
                      src={product.imageUrl}
                      alt={product.name}
                      fill
                      unoptimized
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover"
                    />
                    {product.hidden && (
                      <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-brand-carbon/80 px-2.5 py-1 text-[10px] font-semibold text-white">
                        <EyeOff className="h-3 w-3" />
                        Oculto
                      </span>
                    )}
                    {product.hasOverrides && (
                      <span className="absolute right-3 top-3 rounded-full bg-brand-forest px-2.5 py-1 text-[10px] font-semibold text-white">
                        Editado
                      </span>
                    )}
                  </div>
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <span
                          className={cn(
                            "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold",
                            kindBadgeClass(product.kind)
                          )}
                        >
                          <KindIcon className="h-2.5 w-2.5" />
                          {KIND_LABELS[product.kind]}
                        </span>
                        <h2 className="mt-2 line-clamp-2 font-semibold text-brand-forest">
                          {product.name}
                        </h2>
                        <p className="mt-1 line-clamp-2 text-xs text-brand-carbon/55">
                          {product.shortDescription}
                        </p>
                      </div>
                    </div>
                    <div className="mt-4 flex items-end justify-between gap-3">
                      <div>
                        <p className="font-serif text-xl text-brand-forest">
                          {formatQ(product.retailPriceQ)}
                        </p>
                        <p className="text-[11px] text-brand-carbon/45">
                          Mayorista {formatQ(product.wholesalePriceQ)}
                        </p>
                      </div>
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 text-[10px] font-semibold",
                          product.availability === "in_stock"
                            ? "bg-brand-sage text-brand-forest"
                            : "bg-red-100 text-red-700"
                        )}
                      >
                        {product.availability === "in_stock"
                          ? "En stock"
                          : "Agotado"}
                      </span>
                    </div>
                    <Link
                      href={`/app/admin/catalogo/${encodeURIComponent(product.id)}`}
                      className="mt-4 inline-flex w-full items-center justify-center gap-1 rounded-full bg-brand-forest px-4 py-2 text-xs font-semibold text-white transition-opacity hover:opacity-90"
                    >
                      Editar producto
                      <ChevronRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-between gap-3 card-surface px-4 py-3 sm:px-6">
            <p className="text-xs text-brand-carbon/55">
              Mostrando {(pagination.page - 1) * pagination.limit + 1}–
              {Math.min(pagination.page * pagination.limit, pagination.total)} de{" "}
              {pagination.total} productos
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={pagination.page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="inline-flex items-center gap-1 rounded-full border border-brand-beige bg-white px-3 py-1.5 text-xs font-semibold disabled:opacity-40"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                Anterior
              </button>
              <span className="text-xs font-medium text-brand-carbon/60">
                {pagination.page} / {pagination.totalPages}
              </span>
              <button
                type="button"
                disabled={pagination.page >= pagination.totalPages}
                onClick={() =>
                  setPage((p) => Math.min(pagination.totalPages, p + 1))
                }
                className="inline-flex items-center gap-1 rounded-full border border-brand-beige bg-white px-3 py-1.5 text-xs font-semibold disabled:opacity-40"
              >
                Siguiente
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
