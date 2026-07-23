import { supabase } from "../supabase";
import type { Order } from "@/lib/store";
import {
  formatOrderStatus,
  isPaidOrderStatus,
  normalizeOrderStatus,
} from "@/lib/order-display";

export type AnalyticsRange = "7d" | "30d" | "90d" | "all";

export interface ProductSalesStat {
  id: string;
  name: string;
  kind: string;
  kindLabel: string;
  unitsSold: number;
  revenueQ: number;
  orderCount: number;
}

export interface CustomerSalesStat {
  email: string;
  name: string;
  orderCount: number;
  totalSpentQ: number;
  avgOrderQ: number;
  lastOrderAt: string;
}

export interface SalesAnalyticsSummary {
  totalRevenueQ: number;
  productRevenueQ: number;
  shippingRevenueQ: number;
  orderCount: number;
  /** Pedidos con pago confirmado (en proceso + entregados). */
  paidOrderCount: number;
  enProcesoOrderCount: number;
  deliveredOrderCount: number;
  pendingOrderCount: number;
  cancelledOrderCount: number;
  avgOrderValueQ: number;
  avgShippingQ: number;
  freeShippingOrders: number;
  paidShippingOrders: number;
  cancelRate: number;
  uniqueCustomers: number;
  totalUnitsSold: number;
}

export interface SalesAnalytics {
  range: AnalyticsRange;
  summary: SalesAnalyticsSummary;
  revenueByMonth: Array<{
    month: string;
    monthLabel: string;
    revenueQ: number;
    productQ: number;
    shippingQ: number;
    orders: number;
  }>;
  revenueByDay: Array<{
    date: string;
    dateLabel: string;
    revenueQ: number;
    orders: number;
  }>;
  ordersByStatus: Array<{
    status: Order["status"];
    label: string;
    count: number;
  }>;
  topProductsByRevenue: ProductSalesStat[];
  topProductsByUnits: ProductSalesStat[];
  leastSoldProducts: ProductSalesStat[];
  topCustomers: CustomerSalesStat[];
  revenueByCategory: Array<{
    kind: string;
    label: string;
    revenueQ: number;
    units: number;
  }>;
  paymentMethods: Array<{
    method: string;
    count: number;
    revenueQ: number;
  }>;
  shippingBreakdown: {
    totalShippingQ: number;
    avgShippingQ: number;
    maxShippingQ: number;
    freeDeliveryCount: number;
    paidDeliveryCount: number;
    shippingAsPctOfRevenue: number;
  };
  recentOrders: Array<{
    id: string;
    customerName: string;
    customerEmail: string;
    totalQ: number;
    shippingQ: number;
    status: Order["status"];
    itemCount: number;
    createdAt: string;
  }>;
}

interface DbOrderRow {
  order_number: string;
  session_id: string;
  status: Order["status"];
  subtotal_q: number;
  shipping_q: number;
  total_q: number;
  items: Array<{
    id: string;
    kind?: string;
    name: string;
    priceQ: number;
    qty?: number;
  }>;
  customer_name: string | null;
  customer_email: string | null;
  payment_method: string;
  created_at: string;
}

const KIND_LABELS: Record<string, string> = {
  plant: "Plantas",
  planter: "Macetas",
  accesorio: "Accesorios",
  creacion: "Creaciones",
  propuesta: "Propuestas",
};

function kindLabel(kind: string): string {
  return KIND_LABELS[kind] ?? (kind || "Otros");
}

function rangeStartDate(range: AnalyticsRange): Date | null {
  if (range === "all") return null;
  const days = range === "7d" ? 7 : range === "30d" ? 30 : 90;
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - days + 1);
  return start;
}

function monthKey(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function monthLabel(key: string): string {
  const [year, month] = key.split("-").map(Number);
  const d = new Date(year, month - 1, 1);
  return d.toLocaleDateString("es-GT", { month: "short", year: "numeric" });
}

function dayKey(iso: string): string {
  const d = new Date(iso);
  return d.toISOString().slice(0, 10);
}

function dayLabel(key: string): string {
  const d = new Date(`${key}T12:00:00`);
  return d.toLocaleDateString("es-GT", { day: "numeric", month: "short" });
}

function roundQ(n: number): number {
  return Math.round(n * 100) / 100;
}

export async function getSalesAnalytics(
  range: AnalyticsRange = "all"
): Promise<SalesAnalytics> {
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error fetching orders for analytics:", error);
    throw error;
  }

  const start = rangeStartDate(range);
  const allOrders = (data ?? []) as DbOrderRow[];
  const orders = start
    ? allOrders.filter((o) => new Date(o.created_at) >= start)
    : allOrders;

  const paidOrders = orders.filter((o) => isPaidOrderStatus(o.status));

  let totalRevenueQ = 0;
  let productRevenueQ = 0;
  let shippingRevenueQ = 0;
  let freeShippingOrders = 0;
  let paidShippingOrders = 0;
  let totalUnitsSold = 0;

  const productMap = new Map<string, ProductSalesStat>();
  const customerMap = new Map<string, CustomerSalesStat>();
  const categoryMap = new Map<string, { revenueQ: number; units: number }>();
  const paymentMap = new Map<string, { count: number; revenueQ: number }>();
  const monthMap = new Map<
    string,
    { revenueQ: number; productQ: number; shippingQ: number; orders: number }
  >();
  const dayMap = new Map<string, { revenueQ: number; orders: number }>();
  const statusCounts: Record<Order["status"], number> = {
    pendiente_pago: 0,
    en_proceso: 0,
    entregado: 0,
    cancelado: 0,
    pagado: 0,
  };

  let maxShippingQ = 0;

  for (const order of orders) {
    const status = normalizeOrderStatus(String(order.status));
    statusCounts[status] += 1;
  }

  for (const order of paidOrders) {
    const total = Number(order.total_q) || 0;
    const subtotal = Number(order.subtotal_q) || 0;
    const shipping = Number(order.shipping_q) || 0;

    totalRevenueQ += total;
    productRevenueQ += subtotal;
    shippingRevenueQ += shipping;

    if (shipping <= 0) freeShippingOrders += 1;
    else paidShippingOrders += 1;
    if (shipping > maxShippingQ) maxShippingQ = shipping;

    const mk = monthKey(order.created_at);
    const monthEntry = monthMap.get(mk) ?? {
      revenueQ: 0,
      productQ: 0,
      shippingQ: 0,
      orders: 0,
    };
    monthEntry.revenueQ += total;
    monthEntry.productQ += subtotal;
    monthEntry.shippingQ += shipping;
    monthEntry.orders += 1;
    monthMap.set(mk, monthEntry);

    const dk = dayKey(order.created_at);
    const dayEntry = dayMap.get(dk) ?? { revenueQ: 0, orders: 0 };
    dayEntry.revenueQ += total;
    dayEntry.orders += 1;
    dayMap.set(dk, dayEntry);

    const paymentKey = order.payment_method || "desconocido";
    const paymentEntry = paymentMap.get(paymentKey) ?? { count: 0, revenueQ: 0 };
    paymentEntry.count += 1;
    paymentEntry.revenueQ += total;
    paymentMap.set(paymentKey, paymentEntry);

    const email = (order.customer_email ?? "").trim().toLowerCase();
    if (email) {
      const customer = customerMap.get(email) ?? {
        email,
        name: order.customer_name?.trim() || email,
        orderCount: 0,
        totalSpentQ: 0,
        avgOrderQ: 0,
        lastOrderAt: order.created_at,
      };
      customer.orderCount += 1;
      customer.totalSpentQ += total;
      if (order.created_at > customer.lastOrderAt) {
        customer.lastOrderAt = order.created_at;
        if (order.customer_name?.trim()) customer.name = order.customer_name.trim();
      }
      customerMap.set(email, customer);
    }

    const items = Array.isArray(order.items) ? order.items : [];
    for (const item of items) {
      const qty = Number(item.qty) || 1;
      const lineRevenue = (Number(item.priceQ) || 0) * qty;
      const kind = item.kind ?? "otros";
      totalUnitsSold += qty;

      const productId = item.id || item.name;
      const existing = productMap.get(productId) ?? {
        id: productId,
        name: item.name,
        kind,
        kindLabel: kindLabel(kind),
        unitsSold: 0,
        revenueQ: 0,
        orderCount: 0,
      };
      existing.unitsSold += qty;
      existing.revenueQ += lineRevenue;
      existing.orderCount += 1;
      productMap.set(productId, existing);

      const cat = categoryMap.get(kind) ?? { revenueQ: 0, units: 0 };
      cat.revenueQ += lineRevenue;
      cat.units += qty;
      categoryMap.set(kind, cat);
    }
  }

  for (const customer of customerMap.values()) {
    customer.avgOrderQ =
      customer.orderCount > 0
        ? roundQ(customer.totalSpentQ / customer.orderCount)
        : 0;
    customer.totalSpentQ = roundQ(customer.totalSpentQ);
  }

  const products = [...productMap.values()].map((p) => ({
    ...p,
    revenueQ: roundQ(p.revenueQ),
  }));

  const topProductsByRevenue = [...products]
    .sort((a, b) => b.revenueQ - a.revenueQ)
    .slice(0, 10);

  const topProductsByUnits = [...products]
    .sort((a, b) => b.unitsSold - a.unitsSold)
    .slice(0, 10);

  const leastSoldProducts = [...products]
    .filter((p) => p.unitsSold > 0)
    .sort((a, b) => a.unitsSold - b.unitsSold || a.revenueQ - b.revenueQ)
    .slice(0, 10);

  const topCustomers = [...customerMap.values()]
    .sort((a, b) => b.totalSpentQ - a.totalSpentQ)
    .slice(0, 10);

  const revenueByMonth = [...monthMap.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, v]) => ({
      month,
      monthLabel: monthLabel(month),
      revenueQ: roundQ(v.revenueQ),
      productQ: roundQ(v.productQ),
      shippingQ: roundQ(v.shippingQ),
      orders: v.orders,
    }));

  const revenueByDay = [...dayMap.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, v]) => ({
      date,
      dateLabel: dayLabel(date),
      revenueQ: roundQ(v.revenueQ),
      orders: v.orders,
    }));

  const revenueByCategory = [...categoryMap.entries()]
    .map(([kind, v]) => ({
      kind,
      label: kindLabel(kind),
      revenueQ: roundQ(v.revenueQ),
      units: v.units,
    }))
    .sort((a, b) => b.revenueQ - a.revenueQ);

  const paymentMethods = [...paymentMap.entries()]
    .map(([method, v]) => ({
      method,
      count: v.count,
      revenueQ: roundQ(v.revenueQ),
    }))
    .sort((a, b) => b.revenueQ - a.revenueQ);

  const paidCount = paidOrders.length;
  const orderCount = orders.length;

  const fulfillmentStatuses: Order["status"][] = [
    "en_proceso",
    "entregado",
    "pendiente_pago",
    "cancelado",
  ];

  const recentOrders = [...orders]
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
    .slice(0, 15)
    .map((order) => ({
      id: order.order_number,
      customerName: order.customer_name?.trim() || "—",
      customerEmail: order.customer_email?.trim() || "—",
      totalQ: Number(order.total_q) || 0,
      shippingQ: Number(order.shipping_q) || 0,
      status: normalizeOrderStatus(String(order.status)),
      itemCount: Array.isArray(order.items)
        ? order.items.reduce((s, i) => s + (Number(i.qty) || 1), 0)
        : 0,
      createdAt: order.created_at,
    }));

  return {
    range,
    summary: {
      totalRevenueQ: roundQ(totalRevenueQ),
      productRevenueQ: roundQ(productRevenueQ),
      shippingRevenueQ: roundQ(shippingRevenueQ),
      orderCount,
      paidOrderCount: paidCount,
      enProcesoOrderCount: statusCounts.en_proceso,
      deliveredOrderCount: statusCounts.entregado,
      pendingOrderCount: statusCounts.pendiente_pago,
      cancelledOrderCount: statusCounts.cancelado,
      avgOrderValueQ: paidCount > 0 ? roundQ(totalRevenueQ / paidCount) : 0,
      avgShippingQ: paidCount > 0 ? roundQ(shippingRevenueQ / paidCount) : 0,
      freeShippingOrders,
      paidShippingOrders,
      cancelRate:
        orderCount > 0
          ? roundQ((statusCounts.cancelado / orderCount) * 100)
          : 0,
      uniqueCustomers: customerMap.size,
      totalUnitsSold,
    },
    revenueByMonth,
    revenueByDay,
    ordersByStatus: fulfillmentStatuses.map((status) => ({
      status,
      label: formatOrderStatus(status),
      count: statusCounts[status],
    })),
    topProductsByRevenue,
    topProductsByUnits,
    leastSoldProducts,
    topCustomers,
    revenueByCategory,
    paymentMethods,
    shippingBreakdown: {
      totalShippingQ: roundQ(shippingRevenueQ),
      avgShippingQ: paidCount > 0 ? roundQ(shippingRevenueQ / paidCount) : 0,
      maxShippingQ: roundQ(maxShippingQ),
      freeDeliveryCount: freeShippingOrders,
      paidDeliveryCount: paidShippingOrders,
      shippingAsPctOfRevenue:
        totalRevenueQ > 0
          ? roundQ((shippingRevenueQ / totalRevenueQ) * 100)
          : 0,
    },
    recentOrders,
  };
}
