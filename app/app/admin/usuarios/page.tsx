"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Ban,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  DollarSign,
  MapPin,
  RefreshCw,
  Search,
  Shield,
  ShoppingBag,
  User,
  Users,
} from "lucide-react";
import { adminFetch } from "@/lib/admin-api";
import type {
  AdminUserStats,
  AdminUsersResult,
} from "@/lib/supabase/users-admin";
import { cn, formatQ } from "@/lib/utils";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("es-GT", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

export default function AdminUsersPage() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [users, setUsers] = useState<AdminUsersResult["users"]>([]);
  const [stats, setStats] = useState<AdminUserStats | null>(null);
  const [pagination, setPagination] = useState<AdminUsersResult["pagination"]>(
    { page: 1, limit: 25, total: 0, totalPages: 1 }
  );

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [hasOrders, setHasOrders] = useState(false);
  const [hasSpending, setHasSpending] = useState(false);
  const [page, setPage] = useState(1);

  const loadUsers = useCallback(
    async (opts?: { silent?: boolean }) => {
      if (opts?.silent) setRefreshing(true);
      else setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams({
          page: String(page),
          limit: "25",
        });
        if (search.trim()) params.set("search", search.trim());
        if (hasOrders) params.set("hasOrders", "true");
        if (hasSpending) params.set("hasSpending", "true");

        const res = await adminFetch(`/api/admin/users?${params}`);
        if (!res.ok) {
          const body = (await res.json().catch(() => ({}))) as { error?: string };
          throw new Error(body.error ?? "Error al cargar usuarios");
        }

        const data = (await res.json()) as AdminUsersResult;
        setUsers(data.users);
        setStats(data.stats);
        setPagination(data.pagination);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error desconocido");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [page, search, hasOrders, hasSpending]
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    void loadUsers();
  }, [loadUsers]);

  const kpiCards = useMemo(
    () => [
      {
        label: "Usuarios registrados",
        value: stats?.total ?? 0,
        icon: Users,
      },
      {
        label: "Con pedidos",
        value: stats?.withOrders ?? 0,
        icon: ShoppingBag,
      },
      {
        label: "Con dirección",
        value: stats?.withAddresses ?? 0,
        icon: MapPin,
      },
      {
        label: "Ingresos totales",
        value: formatQ(stats?.totalRevenueQ ?? 0),
        icon: DollarSign,
        isText: true,
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
            Admin · Usuarios
          </span>
          <h1 className="mt-2 font-serif text-3xl text-brand-forest sm:text-4xl">
            Usuarios registrados
          </h1>
          <p className="mt-2 text-sm text-brand-carbon/60">
            Perfiles, direcciones, tarjetas y historial de compras.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void loadUsers({ silent: true })}
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

      <div className="mt-8 card-surface p-4 sm:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative max-w-md flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-carbon/40" />
            <input
              type="search"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Buscar por nombre, email o teléfono..."
              className="w-full rounded-xl border border-brand-beige bg-white py-2.5 pl-10 pr-4 text-sm outline-none ring-brand-forest/20 focus:ring-2"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => {
                setHasOrders((v) => !v);
                setPage(1);
              }}
              className={cn(
                "rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors",
                hasOrders
                  ? "bg-brand-forest text-white"
                  : "bg-brand-cream text-brand-carbon/70 hover:bg-brand-sage/60"
              )}
            >
              Con pedidos
            </button>
            <button
              type="button"
              onClick={() => {
                setHasSpending((v) => !v);
                setPage(1);
              }}
              className={cn(
                "rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors",
                hasSpending
                  ? "bg-brand-forest text-white"
                  : "bg-brand-cream text-brand-carbon/70 hover:bg-brand-sage/60"
              )}
            >
              Con compras pagadas
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="mt-6 rounded-xl2 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="mt-6 overflow-hidden card-surface">
        {loading ? (
          <div className="p-10 text-center text-sm text-brand-carbon/60">
            Cargando usuarios...
          </div>
        ) : users.length === 0 ? (
          <div className="flex flex-col items-center gap-3 p-12 text-center">
            <Ban className="h-10 w-10 text-brand-carbon/30" />
            <p className="font-semibold text-brand-carbon">Sin resultados</p>
            <p className="text-sm text-brand-carbon/55">
              No hay usuarios que coincidan con los filtros.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[960px] text-left text-sm">
              <thead>
                <tr className="border-b border-brand-beige/70 bg-brand-cream/50 text-xs uppercase tracking-wide text-brand-carbon/50">
                  <th className="px-4 py-3 font-semibold sm:px-6">Usuario</th>
                  <th className="px-4 py-3 font-semibold">Contacto</th>
                  <th className="px-4 py-3 font-semibold">Dirección</th>
                  <th className="px-4 py-3 font-semibold">Pedidos</th>
                  <th className="px-4 py-3 font-semibold">Gastado</th>
                  <th className="px-4 py-3 font-semibold">Registro</th>
                  <th className="px-4 py-3 font-semibold sm:px-6">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-beige/50">
                {users.map((user) => (
                  <tr
                    key={user.id}
                    className="transition-colors hover:bg-brand-cream/30"
                  >
                    <td className="px-4 py-3.5 sm:px-6">
                      <div className="flex items-center gap-3">
                        {user.avatarUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={user.avatarUrl}
                            alt=""
                            className="h-10 w-10 rounded-full object-cover"
                          />
                        ) : (
                          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-sage text-sm font-semibold text-brand-forest">
                            {initials(user.name)}
                          </span>
                        )}
                        <div>
                          <p className="font-semibold text-brand-forest">
                            {user.name}
                          </p>
                          <p className="text-xs text-brand-carbon/50">
                            {user.workspace}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="text-brand-carbon/80">{user.email || "—"}</p>
                      <p className="text-xs text-brand-carbon/50">
                        {user.phone || "Sin teléfono"}
                      </p>
                    </td>
                    <td className="max-w-[200px] px-4 py-3.5">
                      {user.defaultAddress ? (
                        <p className="truncate text-brand-carbon/70">
                          {user.defaultAddress}
                        </p>
                      ) : (
                        <span className="text-brand-carbon/40">Sin dirección</span>
                      )}
                      {user.addressCount > 1 && (
                        <p className="text-[11px] text-brand-carbon/45">
                          +{user.addressCount - 1} más
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="font-medium text-brand-carbon">
                        {user.orderCount}
                      </p>
                      <p className="text-xs text-brand-carbon/50">
                        {user.paidOrderCount} pagados
                      </p>
                    </td>
                    <td className="px-4 py-3.5 font-semibold text-brand-forest">
                      {formatQ(user.totalSpentQ)}
                    </td>
                    <td className="px-4 py-3.5 text-brand-carbon/70">
                      {formatDate(user.createdAt)}
                    </td>
                    <td className="px-4 py-3.5 sm:px-6">
                      <Link
                        href={`/app/admin/usuarios/${encodeURIComponent(user.id)}`}
                        className="inline-flex items-center gap-1 rounded-full bg-brand-forest px-3.5 py-1.5 text-xs font-semibold text-white transition-opacity hover:opacity-90"
                      >
                        Ver detalle
                        <ChevronRight className="h-3.5 w-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && users.length > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-brand-beige/60 px-4 py-3 sm:px-6">
            <p className="text-xs text-brand-carbon/55">
              Mostrando {(pagination.page - 1) * pagination.limit + 1}–
              {Math.min(pagination.page * pagination.limit, pagination.total)} de{" "}
              {pagination.total} usuarios
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
        )}
      </div>
    </div>
  );
}
