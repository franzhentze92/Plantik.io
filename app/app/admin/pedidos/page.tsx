"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Ban,
  ChevronLeft,
  ChevronRight,
  Clock,
  DollarSign,
  Loader2,
  Package,
  RefreshCw,
  Search,
  Shield,
  ShoppingBag,
} from "lucide-react";
import { adminFetch } from "@/lib/admin-api";
import {
  formatOrderStatus,
  orderStatusBadgeClass,
} from "@/lib/order-display";
import type {
  AdminOrder,
  AdminOrderStats,
  AdminOrdersResult,
} from "@/lib/supabase/orders";
import type { Order } from "@/lib/store";
import { cn, formatQ } from "@/lib/utils";

type StatusFilter = Order["status"] | "all";

const STATUS_FILTERS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "Todos" },
  { value: "en_proceso", label: "En proceso" },
  { value: "entregado", label: "Entregados" },
  { value: "pendiente_pago", label: "Pendientes de pago" },
  { value: "cancelado", label: "Cancelados" },
];

const STATUS_OPTIONS: Order["status"][] = [
  "en_proceso",
  "entregado",
  "pendiente_pago",
  "cancelado",
];

function formatOrderDate(iso: string) {
  return new Date(iso).toLocaleDateString("es-GT", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AdminOrdersPage() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orders, setOrders] = useState<AdminOrdersResult["orders"]>([]);
  const [stats, setStats] = useState<AdminOrderStats | null>(null);
  const [pagination, setPagination] = useState<AdminOrdersResult["pagination"]>(
    { page: 1, limit: 25, total: 0, totalPages: 1 }
  );
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [savingStatusId, setSavingStatusId] = useState<string | null>(null);
  const [statusError, setStatusError] = useState<string | null>(null);

  const loadOrders = useCallback(
    async (opts?: { silent?: boolean }) => {
      if (opts?.silent) setRefreshing(true);
      else setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams({
          page: String(page),
          limit: "25",
          status: statusFilter,
        });
        if (search.trim()) params.set("search", search.trim());

        const res = await adminFetch(`/api/admin/orders?${params}`);
        if (!res.ok) {
          const body = (await res.json().catch(() => ({}))) as { error?: string };
          throw new Error(body.error ?? "Error al cargar pedidos");
        }

        const data = (await res.json()) as AdminOrdersResult;
        setOrders(data.orders);
        setStats(data.stats);
        setPagination(data.pagination);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error desconocido");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [page, search, statusFilter]
  );

  const handleStatusChange = useCallback(
    async (orderId: string, newStatus: Order["status"]) => {
      const current = orders.find((o) => o.id === orderId);
      if (!current || current.status === newStatus) return;

      setSavingStatusId(orderId);
      setStatusError(null);

      try {
        const res = await adminFetch(
          `/api/admin/orders/${encodeURIComponent(orderId)}`,
          {
            method: "PATCH",
            body: JSON.stringify({ status: newStatus }),
          }
        );
        if (!res.ok) {
          const body = (await res.json().catch(() => ({}))) as { error?: string };
          throw new Error(body.error ?? "No se pudo actualizar el estado");
        }

        const data = (await res.json()) as { order: AdminOrder };
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, ...data.order } : o))
        );
        void loadOrders({ silent: true });
      } catch (err) {
        setStatusError(
          err instanceof Error ? err.message : "Error al actualizar el estado"
        );
      } finally {
        setSavingStatusId(null);
      }
    },
    [loadOrders, orders]
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    void loadOrders();
  }, [loadOrders]);

  const kpiCards = useMemo(
    () => [
      {
        label: "Total pedidos",
        value: stats?.total ?? 0,
        icon: Package,
        tone: "text-brand-forest",
        bg: "bg-brand-sage",
      },
      {
        label: "En proceso",
        value: stats?.en_proceso ?? 0,
        icon: ShoppingBag,
        tone: "text-sky-800",
        bg: "bg-sky-100",
      },
      {
        label: "Entregados",
        value: stats?.entregado ?? 0,
        icon: Package,
        tone: "text-brand-forest",
        bg: "bg-brand-sage",
      },
      {
        label: "Pendientes de pago",
        value: stats?.pendiente_pago ?? 0,
        icon: Clock,
        tone: "text-amber-800",
        bg: "bg-amber-100",
      },
      {
        label: "Ingresos confirmados",
        value: formatQ(stats?.revenueQ ?? 0),
        icon: DollarSign,
        tone: "text-brand-forest",
        bg: "bg-brand-sage",
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
            Admin · Pedidos
          </span>
          <h1 className="mt-2 font-serif text-3xl text-brand-forest sm:text-4xl">
            Gestión de pedidos
          </h1>
          <p className="mt-2 text-sm text-brand-carbon/60">
            Vista global de todos los pedidos, estados y clientes.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void loadOrders({ silent: true })}
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
            <div className="flex items-center justify-between">
              <span
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-full",
                  card.bg,
                  card.tone
                )}
              >
                <card.icon className="h-4 w-4" />
              </span>
            </div>
            <p className="mt-4 font-serif text-2xl text-brand-forest">
              {card.isText ? card.value : card.value}
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
              placeholder="Buscar por pedido, cliente o email..."
              className="w-full rounded-xl border border-brand-beige bg-white py-2.5 pl-10 pr-4 text-sm text-brand-carbon outline-none ring-brand-forest/20 transition focus:ring-2"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {STATUS_FILTERS.map((filter) => (
              <button
                key={filter.value}
                type="button"
                onClick={() => {
                  setStatusFilter(filter.value);
                  setPage(1);
                }}
                className={cn(
                  "rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors",
                  statusFilter === filter.value
                    ? "bg-brand-forest text-white"
                    : "bg-brand-cream text-brand-carbon/70 hover:bg-brand-sage/60"
                )}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {statusError && (
        <div className="mt-6 rounded-xl2 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {statusError}
        </div>
      )}

      {error && (
        <div className="mt-6 rounded-xl2 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="mt-6 overflow-hidden card-surface">
        {loading ? (
          <div className="p-10 text-center text-sm text-brand-carbon/60">
            Cargando pedidos...
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center gap-3 p-12 text-center">
            <Ban className="h-10 w-10 text-brand-carbon/30" />
            <p className="font-semibold text-brand-carbon">Sin resultados</p>
            <p className="text-sm text-brand-carbon/55">
              {search || statusFilter !== "all"
                ? "Prueba con otros filtros o términos de búsqueda."
                : "Aún no hay pedidos registrados en la base de datos."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[880px] text-left text-sm">
              <thead>
                <tr className="border-b border-brand-beige/70 bg-brand-cream/50 text-xs uppercase tracking-wide text-brand-carbon/50">
                  <th className="px-4 py-3 font-semibold sm:px-6">Pedido</th>
                  <th className="px-4 py-3 font-semibold">Fecha</th>
                  <th className="px-4 py-3 font-semibold">Cliente</th>
                  <th className="px-4 py-3 font-semibold">Artículos</th>
                  <th className="px-4 py-3 font-semibold">Total</th>
                  <th className="px-4 py-3 font-semibold">Estado</th>
                  <th className="px-4 py-3 font-semibold sm:px-6">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-beige/50">
                {orders.map((order) => {
                  const itemCount = order.items.reduce(
                    (sum, item) => sum + item.qty,
                    0
                  );
                  return (
                    <tr
                      key={order.id}
                      className="transition-colors hover:bg-brand-cream/30"
                    >
                      <td className="px-4 py-3.5 font-semibold text-brand-forest sm:px-6">
                        {order.id}
                      </td>
                      <td className="px-4 py-3.5 text-brand-carbon/70">
                        {formatOrderDate(order.createdAt)}
                      </td>
                      <td className="px-4 py-3.5">
                        <p className="font-medium text-brand-carbon">
                          {order.customerName ?? "—"}
                        </p>
                        <p className="text-xs text-brand-carbon/50">
                          {order.customerEmail ?? "Sin email"}
                        </p>
                      </td>
                      <td className="px-4 py-3.5 text-brand-carbon/70">
                        {itemCount}
                      </td>
                      <td className="px-4 py-3.5 font-semibold text-brand-forest">
                        {formatQ(order.totalQ)}
                      </td>
                      <td className="px-4 py-3.5">
                        <OrderStatusSelect
                          orderId={order.id}
                          status={order.status}
                          saving={savingStatusId === order.id}
                          onChange={handleStatusChange}
                        />
                      </td>
                      <td className="px-4 py-3.5 sm:px-6">
                        <Link
                          href={`/app/admin/pedidos/${encodeURIComponent(order.id)}`}
                          className="inline-flex items-center gap-1 rounded-full bg-brand-forest px-3.5 py-1.5 text-xs font-semibold text-white transition-opacity hover:opacity-90"
                        >
                          Ver detalle
                          <ChevronRight className="h-3.5 w-3.5" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {!loading && orders.length > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-brand-beige/60 px-4 py-3 sm:px-6">
            <p className="text-xs text-brand-carbon/55">
              Mostrando {(pagination.page - 1) * pagination.limit + 1}–
              {Math.min(pagination.page * pagination.limit, pagination.total)} de{" "}
              {pagination.total} pedidos
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={pagination.page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="inline-flex items-center gap-1 rounded-full border border-brand-beige bg-white px-3 py-1.5 text-xs font-semibold text-brand-carbon/70 disabled:opacity-40"
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
                className="inline-flex items-center gap-1 rounded-full border border-brand-beige bg-white px-3 py-1.5 text-xs font-semibold text-brand-carbon/70 disabled:opacity-40"
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

function OrderStatusSelect({
  orderId,
  status,
  saving,
  onChange,
}: {
  orderId: string;
  status: Order["status"];
  saving: boolean;
  onChange: (orderId: string, status: Order["status"]) => void;
}) {
  return (
    <div className="relative inline-flex items-center">
      <select
        value={status}
        disabled={saving}
        onChange={(e) =>
          onChange(orderId, e.target.value as Order["status"])
        }
        className={cn(
          "cursor-pointer appearance-none rounded-full border-0 py-1 pl-2.5 pr-7 text-[11px] font-semibold outline-none ring-brand-forest/20 transition focus:ring-2 disabled:cursor-wait disabled:opacity-60",
          orderStatusBadgeClass(status)
        )}
        aria-label={`Estado del pedido ${orderId}`}
      >
        {STATUS_OPTIONS.map((option) => (
          <option key={option} value={option}>
            {formatOrderStatus(option)}
          </option>
        ))}
      </select>
      {saving ? (
        <Loader2 className="pointer-events-none absolute right-1.5 h-3 w-3 animate-spin opacity-70" />
      ) : (
        <ChevronRight className="pointer-events-none absolute right-1.5 h-3 w-3 rotate-90 opacity-50" />
      )}
    </div>
  );
}
