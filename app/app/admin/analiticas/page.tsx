"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  BarChart3,
  DollarSign,
  Package,
  RefreshCw,
  Shield,
  ShoppingBag,
  TrendingUp,
  Truck,
  Users,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { adminFetch } from "@/lib/admin-api";
import { formatOrderStatus, orderStatusBadgeClass } from "@/lib/order-display";
import type {
  AnalyticsRange,
  SalesAnalytics,
} from "@/lib/supabase/analytics-admin";
import { cn, formatQ } from "@/lib/utils";

const RANGE_OPTIONS: { value: AnalyticsRange; label: string }[] = [
  { value: "7d", label: "7 días" },
  { value: "30d", label: "30 días" },
  { value: "90d", label: "90 días" },
  { value: "all", label: "Todo el tiempo" },
];

const STATUS_COLORS: Record<string, string> = {
  en_proceso: "#0284C7",
  entregado: "#1F5E3B",
  pendiente_pago: "#D97706",
  cancelado: "#DC2626",
};

const CATEGORY_COLORS = ["#1F5E3B", "#5F8F68", "#8B7355", "#C9A66B", "#4A3728"];

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ name?: string; value?: number; color?: string }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-brand-beige bg-white px-3 py-2 text-xs shadow-card">
      <p className="font-semibold text-brand-carbon">{label}</p>
      {payload.map((entry) => (
        <p key={entry.name} style={{ color: entry.color }} className="mt-0.5">
          {entry.name}:{" "}
          {typeof entry.value === "number" && entry.name?.includes("Q")
            ? formatQ(entry.value)
            : entry.value}
        </p>
      ))}
    </div>
  );
}

function MoneyTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value?: number }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-brand-beige bg-white px-3 py-2 text-xs shadow-card">
      <p className="font-semibold text-brand-carbon">{label}</p>
      <p className="mt-0.5 text-brand-forest">{formatQ(payload[0].value ?? 0)}</p>
    </div>
  );
}

export default function AdminAnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [range, setRange] = useState<AnalyticsRange>("all");
  const [data, setData] = useState<SalesAnalytics | null>(null);

  const loadAnalytics = useCallback(
    async (opts?: { silent?: boolean }) => {
      if (opts?.silent) setRefreshing(true);
      else setLoading(true);
      setError(null);

      try {
        const res = await adminFetch(`/api/admin/analytics?range=${range}`);
        if (!res.ok) {
          const body = (await res.json().catch(() => ({}))) as { error?: string };
          throw new Error(body.error ?? "Error al cargar analíticas");
        }
        setData((await res.json()) as SalesAnalytics);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error desconocido");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [range]
  );

  useEffect(() => {
    void loadAnalytics();
  }, [loadAnalytics]);

  const kpiCards = useMemo(() => {
    if (!data) return [];
    const s = data.summary;
    return [
      {
        label: "Ingresos totales",
        value: formatQ(s.totalRevenueQ),
        sub: `${s.paidOrderCount} confirmados · ${s.enProcesoOrderCount} en proceso · ${s.deliveredOrderCount} entregados`,
        icon: DollarSign,
      },
      {
        label: "Ticket promedio",
        value: formatQ(s.avgOrderValueQ),
        sub: `${s.totalUnitsSold} unidades vendidas`,
        icon: TrendingUp,
      },
      {
        label: "Ingresos por productos",
        value: formatQ(s.productRevenueQ),
        sub: `${((s.productRevenueQ / Math.max(s.totalRevenueQ, 1)) * 100).toFixed(0)}% del total`,
        icon: ShoppingBag,
      },
      {
        label: "Ingresos por envío",
        value: formatQ(s.shippingRevenueQ),
        sub: `Prom. ${formatQ(s.avgShippingQ)} / pedido`,
        icon: Truck,
      },
      {
        label: "Clientes únicos",
        value: String(s.uniqueCustomers),
        sub: `${s.orderCount} pedidos en el periodo`,
        icon: Users,
      },
      {
        label: "Envíos gratis",
        value: String(s.freeShippingOrders),
        sub: `${s.paidShippingOrders} con costo de envío`,
        icon: Package,
      },
    ];
  }, [data]);

  const statusChartData = useMemo(
    () => data?.ordersByStatus.filter((s) => s.count > 0) ?? [],
    [data]
  );

  if (loading) {
    return (
      <div className="container-app py-16">
        <p className="text-brand-carbon/60">Cargando analíticas...</p>
      </div>
    );
  }

  return (
    <div className="container-app py-10">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <span className="eyebrow inline-flex items-center gap-2">
            <Shield className="h-3.5 w-3.5" />
            Admin · Analíticas
          </span>
          <h1 className="mt-2 font-serif text-3xl text-brand-forest sm:text-4xl">
            Analíticas de ventas
          </h1>
          <p className="mt-2 text-sm text-brand-carbon/60">
            Ingresos, productos, clientes, envíos y tendencias de la plataforma.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {RANGE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setRange(opt.value)}
              className={cn(
                "rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors",
                range === opt.value
                  ? "bg-brand-forest text-white"
                  : "bg-brand-cream text-brand-carbon/70 hover:bg-brand-sage/60"
              )}
            >
              {opt.label}
            </button>
          ))}
          <button
            type="button"
            onClick={() => void loadAnalytics({ silent: true })}
            disabled={refreshing}
            className="inline-flex items-center gap-2 rounded-full border border-brand-beige bg-white px-4 py-2 text-sm font-semibold text-brand-forest disabled:opacity-60"
          >
            <RefreshCw className={cn("h-4 w-4", refreshing && "animate-spin")} />
          </button>
        </div>
      </div>

      {error && (
        <div className="mt-6 rounded-xl2 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {!data && !error ? null : !data ? (
        <div className="mt-8 card-surface p-10 text-center">
          <p className="text-sm text-brand-carbon/60">
            No se pudieron cargar las analíticas.
          </p>
          <button
            type="button"
            onClick={() => void loadAnalytics()}
            className="mt-4 rounded-full bg-brand-forest px-5 py-2 text-sm font-semibold text-white"
          >
            Reintentar
          </button>
        </div>
      ) : (
        <>
          <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-6">
            {kpiCards.map((card) => (
              <div key={card.label} className="card-surface p-4">
                <card.icon className="h-4 w-4 text-brand-forest" />
                <p className="mt-3 font-serif text-xl text-brand-forest sm:text-2xl">
                  {card.value}
                </p>
                <p className="text-xs font-medium text-brand-carbon/70">
                  {card.label}
                </p>
                <p className="mt-0.5 text-[10px] text-brand-carbon/45">{card.sub}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            <ChartCard title="Ingresos por mes" subtitle="Total, productos y envío">
              <div className="h-72">
                {data.revenueByMonth.length === 0 ? (
                  <EmptyChart />
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.revenueByMonth}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E9E0D2" />
                      <XAxis
                        dataKey="monthLabel"
                        tick={{ fontSize: 10 }}
                        interval={0}
                        angle={-15}
                        textAnchor="end"
                        height={50}
                      />
                      <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `Q${v}`} />
                      <Tooltip content={<ChartTooltip />} />
                      <Legend wrapperStyle={{ fontSize: 11 }} />
                      <Bar
                        dataKey="productQ"
                        name="Productos (Q)"
                        stackId="a"
                        fill="#5F8F68"
                        radius={[0, 0, 0, 0]}
                      />
                      <Bar
                        dataKey="shippingQ"
                        name="Envío (Q)"
                        stackId="a"
                        fill="#C9A66B"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </ChartCard>

            <ChartCard title="Tendencia diaria" subtitle="Ingresos por día">
              <div className="h-72">
                {data.revenueByDay.length === 0 ? (
                  <EmptyChart />
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data.revenueByDay}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E9E0D2" />
                      <XAxis dataKey="dateLabel" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `Q${v}`} />
                      <Tooltip content={<MoneyTooltip />} />
                      <Area
                        type="monotone"
                        dataKey="revenueQ"
                        stroke="#1F5E3B"
                        fill="#1F5E3B"
                        fillOpacity={0.15}
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
            </ChartCard>
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-3">
            <ChartCard title="Pedidos por estado" subtitle="En proceso, entregados, pendientes y cancelados">
              <div className="h-64">
                {statusChartData.length === 0 ? (
                  <EmptyChart />
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusChartData}
                        dataKey="count"
                        nameKey="label"
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={2}
                      >
                        {statusChartData.map((entry) => (
                          <Cell
                            key={entry.status}
                            fill={STATUS_COLORS[entry.status] ?? "#9CA3AF"}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend wrapperStyle={{ fontSize: 11 }} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </ChartCard>

            <ChartCard title="Ventas por categoría" className="lg:col-span-2">
              <div className="h-64">
                {data.revenueByCategory.length === 0 ? (
                  <EmptyChart />
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.revenueByCategory} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#E9E0D2" />
                      <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={(v) => `Q${v}`} />
                      <YAxis
                        type="category"
                        dataKey="label"
                        tick={{ fontSize: 11 }}
                        width={90}
                      />
                      <Tooltip content={<MoneyTooltip />} />
                      <Bar dataKey="revenueQ" name="Ingresos" radius={[0, 4, 4, 0]}>
                        {data.revenueByCategory.map((_, i) => (
                          <Cell
                            key={i}
                            fill={CATEGORY_COLORS[i % CATEGORY_COLORS.length]}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </ChartCard>
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <ChartCard title="Top 10 · Más vendidos por ingresos">
              <ProductTable products={data.topProductsByRevenue} sortBy="revenue" />
            </ChartCard>
            <ChartCard title="Top 10 · Más vendidos por unidades">
              <ProductTable products={data.topProductsByUnits} sortBy="units" />
            </ChartCard>
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <ChartCard title="Menos vendidos" subtitle="Productos con menor rotación">
              <ProductTable products={data.leastSoldProducts} sortBy="units" muted />
            </ChartCard>

            <ChartCard title="Top clientes" subtitle="Mayor gasto acumulado">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-brand-beige/70 text-xs uppercase tracking-wide text-brand-carbon/50">
                      <th className="py-2 pr-3">Cliente</th>
                      <th className="py-2 pr-3">Pedidos</th>
                      <th className="py-2 pr-3">Gastado</th>
                      <th className="py-2">Promedio</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-beige/40">
                    {data.topCustomers.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="py-6 text-center text-brand-carbon/50">
                          Sin datos de clientes
                        </td>
                      </tr>
                    ) : (
                      data.topCustomers.map((customer) => (
                        <tr key={customer.email}>
                          <td className="py-2.5 pr-3">
                            <p className="font-medium text-brand-carbon">
                              {customer.name}
                            </p>
                            <p className="text-xs text-brand-carbon/50">
                              {customer.email}
                            </p>
                          </td>
                          <td className="py-2.5 pr-3">{customer.orderCount}</td>
                          <td className="py-2.5 pr-3 font-semibold text-brand-forest">
                            {formatQ(customer.totalSpentQ)}
                          </td>
                          <td className="py-2.5">{formatQ(customer.avgOrderQ)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </ChartCard>
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-3">
            <ChartCard title="Análisis de envíos">
              <dl className="space-y-3 text-sm">
                <MetricRow
                  label="Total cobrado en envíos"
                  value={formatQ(data.shippingBreakdown.totalShippingQ)}
                />
                <MetricRow
                  label="Promedio por pedido"
                  value={formatQ(data.shippingBreakdown.avgShippingQ)}
                />
                <MetricRow
                  label="Envío máximo"
                  value={formatQ(data.shippingBreakdown.maxShippingQ)}
                />
                <MetricRow
                  label="Entregas gratis"
                  value={String(data.shippingBreakdown.freeDeliveryCount)}
                />
                <MetricRow
                  label="Entregas con costo"
                  value={String(data.shippingBreakdown.paidDeliveryCount)}
                />
                <MetricRow
                  label="% envío sobre ingresos"
                  value={`${data.shippingBreakdown.shippingAsPctOfRevenue}%`}
                />
              </dl>
            </ChartCard>

            <ChartCard title="Métodos de pago" className="lg:col-span-2">
              <div className="h-56">
                {data.paymentMethods.length === 0 ? (
                  <EmptyChart />
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.paymentMethods}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E9E0D2" />
                      <XAxis dataKey="method" tick={{ fontSize: 11 }} />
                      <YAxis yAxisId="left" tick={{ fontSize: 11 }} />
                      <YAxis
                        yAxisId="right"
                        orientation="right"
                        tick={{ fontSize: 11 }}
                        tickFormatter={(v) => `Q${v}`}
                      />
                      <Tooltip content={<ChartTooltip />} />
                      <Legend wrapperStyle={{ fontSize: 11 }} />
                      <Bar
                        yAxisId="left"
                        dataKey="count"
                        name="Pedidos"
                        fill="#5F8F68"
                        radius={[4, 4, 0, 0]}
                      />
                      <Line
                        yAxisId="right"
                        type="monotone"
                        dataKey="revenueQ"
                        name="Ingresos (Q)"
                        stroke="#1F5E3B"
                        strokeWidth={2}
                        dot={{ r: 4 }}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </ChartCard>
          </div>

          <div className="mt-6">
            <ChartCard
              title="Pedidos recientes"
              subtitle="Últimas transacciones registradas"
            >
              <div className="overflow-x-auto">
                <table className="w-full min-w-[720px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-brand-beige/70 text-xs uppercase tracking-wide text-brand-carbon/50">
                      <th className="py-2 pr-4">Pedido</th>
                      <th className="py-2 pr-4">Cliente</th>
                      <th className="py-2 pr-4">Artículos</th>
                      <th className="py-2 pr-4">Envío</th>
                      <th className="py-2 pr-4">Total</th>
                      <th className="py-2 pr-4">Estado</th>
                      <th className="py-2">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-beige/40">
                    {data.recentOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-brand-cream/30">
                        <td className="py-2.5 pr-4 font-semibold text-brand-forest">
                          {order.id}
                        </td>
                        <td className="py-2.5 pr-4">
                          <p className="text-brand-carbon">{order.customerName}</p>
                          <p className="text-xs text-brand-carbon/50">
                            {order.customerEmail}
                          </p>
                        </td>
                        <td className="py-2.5 pr-4">{order.itemCount}</td>
                        <td className="py-2.5 pr-4">
                          {order.shippingQ > 0
                            ? formatQ(order.shippingQ)
                            : "Gratis"}
                        </td>
                        <td className="py-2.5 pr-4 font-semibold text-brand-forest">
                          {formatQ(order.totalQ)}
                        </td>
                        <td className="py-2.5 pr-4">
                          <span
                            className={cn(
                              "rounded-full px-2 py-0.5 text-[10px] font-semibold",
                              orderStatusBadgeClass(order.status)
                            )}
                          >
                            {formatOrderStatus(order.status)}
                          </span>
                        </td>
                        <td className="py-2.5">
                          <Link
                            href={`/app/admin/pedidos/${encodeURIComponent(order.id)}`}
                            className="text-xs font-semibold text-brand-forest hover:underline"
                          >
                            Ver
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </ChartCard>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6 card-surface p-4">
            <MiniStat
              label="En proceso"
              value={String(data.summary.enProcesoOrderCount)}
              tone="sky"
            />
            <MiniStat
              label="Entregados"
              value={String(data.summary.deliveredOrderCount)}
              tone="sage"
            />
            <MiniStat
              label="Pendientes de pago"
              value={String(data.summary.pendingOrderCount)}
              tone="amber"
            />
            <MiniStat
              label="Cancelados"
              value={String(data.summary.cancelledOrderCount)}
              tone="red"
            />
            <MiniStat
              label="Tasa de cancelación"
              value={`${data.summary.cancelRate}%`}
            />
            <MiniStat
              label="Pedidos en periodo"
              value={String(data.summary.orderCount)}
            />
          </div>
        </>
      )}
    </div>
  );
}

function ChartCard({
  title,
  subtitle,
  children,
  className,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("card-surface p-5", className)}>
      <div className="mb-4 flex items-start gap-2">
        <BarChart3 className="mt-0.5 h-4 w-4 shrink-0 text-brand-forest" />
        <div>
          <h2 className="text-sm font-semibold text-brand-carbon">{title}</h2>
          {subtitle && (
            <p className="text-xs text-brand-carbon/50">{subtitle}</p>
          )}
        </div>
      </div>
      {children}
    </div>
  );
}

function ProductTable({
  products,
  sortBy,
  muted,
}: {
  products: SalesAnalytics["topProductsByRevenue"];
  sortBy: "revenue" | "units";
  muted?: boolean;
}) {
  if (products.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-brand-carbon/50">Sin datos</p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-brand-beige/70 text-xs uppercase tracking-wide text-brand-carbon/50">
            <th className="py-2 pr-3">#</th>
            <th className="py-2 pr-3">Producto</th>
            <th className="py-2 pr-3">Categoría</th>
            <th className="py-2 pr-3">Unidades</th>
            <th className="py-2">Ingresos</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-brand-beige/40">
          {products.map((product, index) => (
            <tr key={product.id} className={muted ? "text-brand-carbon/70" : ""}>
              <td className="py-2.5 pr-3 text-brand-carbon/45">{index + 1}</td>
              <td className="max-w-[200px] py-2.5 pr-3">
                <p className="truncate font-medium text-brand-carbon">
                  {product.name}
                </p>
              </td>
              <td className="py-2.5 pr-3 text-xs">{product.kindLabel}</td>
              <td className="py-2.5 pr-3 font-medium">
                {sortBy === "units" ? (
                  <span className="text-brand-forest">{product.unitsSold}</span>
                ) : (
                  product.unitsSold
                )}
              </td>
              <td className="py-2.5 font-semibold text-brand-forest">
                {sortBy === "revenue" ? (
                  formatQ(product.revenueQ)
                ) : (
                  formatQ(product.revenueQ)
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function MetricRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-brand-beige/40 pb-2">
      <dt className="text-brand-carbon/65">{label}</dt>
      <dd className="font-semibold text-brand-forest">{value}</dd>
    </div>
  );
}

function MiniStat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "sky" | "sage" | "amber" | "red";
}) {
  const toneClass =
    tone === "sky"
      ? "text-sky-800"
      : tone === "sage"
        ? "text-brand-forest"
        : tone === "amber"
          ? "text-amber-800"
          : tone === "red"
            ? "text-red-700"
            : "text-brand-forest";

  return (
    <div>
      <p className={cn("font-serif text-xl", toneClass)}>{value}</p>
      <p className="text-xs text-brand-carbon/55">{label}</p>
    </div>
  );
}

function EmptyChart() {
  return (
    <div className="flex h-full items-center justify-center text-sm text-brand-carbon/45">
      Sin datos en este periodo
    </div>
  );
}
