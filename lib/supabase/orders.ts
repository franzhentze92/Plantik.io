import { supabase } from "../supabase";
import type { CartItem, Order, OrderItem } from "@/lib/store";
import {
  isPaidOrderStatus,
  normalizeOrderStatus,
} from "@/lib/order-display";
import {
  resolveCartItemsForCheckout,
  resolveOrderItemsForDisplay,
} from "@/lib/resolve-catalog-items";

export interface DbOrder {
  id: string;
  order_number: string;
  session_id: string;
  status: Order["status"];
  subtotal_q: number;
  shipping_q: number;
  total_q: number;
  items: OrderItem[];
  customer_name: string | null;
  customer_email: string | null;
  customer_address: string | null;
  payment_method: string;
  payment_provider: string | null;
  payment_reference: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateOrderInput {
  items: CartItem[];
  subtotalQ: number;
  shippingQ: number;
  totalQ: number;
  customerName: string;
  customerEmail: string;
  customerAddress: string;
  status?: Order["status"];
  paymentMethod?: string;
  paymentProvider?: string | null;
  paymentReference?: string | null;
  orderNumber?: string;
}

function buildOrderNumber(): string {
  return `VRD-${Date.now().toString().slice(-6)}`;
}

function mapDbOrder(row: DbOrder): Order {
  return {
    id: row.order_number,
    items: Array.isArray(row.items) ? row.items : [],
    subtotalQ: Number(row.subtotal_q),
    shippingQ: Number(row.shipping_q),
    totalQ: Number(row.total_q),
    createdAt: row.created_at,
    status: normalizeOrderStatus(row.status),
    customerName: row.customer_name ?? undefined,
    customerEmail: row.customer_email ?? undefined,
    customerAddress: row.customer_address ?? undefined,
    checkoutId: row.payment_reference ?? undefined,
  };
}

export async function createOrder(
  sessionId: string,
  input: CreateOrderInput
): Promise<Order> {
  const orderNumber = input.orderNumber?.trim() || buildOrderNumber();
  const resolvedItems = await resolveCartItemsForCheckout(
    input.items.map((item) => ({ ...item, qty: item.qty ?? 1 }))
  );

  const { data, error } = await supabase
    .from("orders")
    .insert({
      order_number: orderNumber,
      session_id: sessionId,
      status: input.status ?? "en_proceso",
      subtotal_q: input.subtotalQ,
      shipping_q: input.shippingQ,
      total_q: input.totalQ,
      items: resolvedItems.map((item) => ({
        id: item.id,
        kind: item.kind,
        name: item.name,
        subtitle: item.subtitle,
        image: item.image,
        priceQ: item.priceQ,
        qty: item.qty,
        components: item.components,
      })),
      customer_name: input.customerName,
      customer_email: input.customerEmail,
      customer_address: input.customerAddress,
      payment_method: input.paymentMethod ?? "simulated",
      payment_provider: input.paymentProvider ?? null,
      payment_reference: input.paymentReference ?? null,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating order:", error);
    throw error;
  }

  return mapDbOrder(data as DbOrder);
}

async function mapDbOrderWithResolvedItems(row: DbOrder): Promise<Order> {
  const order = mapDbOrder(row);
  order.items = await resolveOrderItemsForDisplay(order.items);
  return order;
}

export async function getOrdersBySessionId(
  sessionId: string
): Promise<Order[]> {
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("session_id", sessionId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching orders:", error);
    throw error;
  }

  return Promise.all((data || []).map((row) => mapDbOrderWithResolvedItems(row as DbOrder)));
}

export async function getOrderByNumber(
  sessionId: string,
  orderNumber: string
): Promise<Order | null> {
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("session_id", sessionId)
    .eq("order_number", orderNumber)
    .maybeSingle();

  if (error) {
    console.error("Error fetching order:", error);
    throw error;
  }

  return data ? mapDbOrderWithResolvedItems(data as DbOrder) : null;
}

export interface AdminOrder extends Order {
  dbId: string;
  sessionId: string;
  paymentMethod: string;
  paymentProvider: string | null;
  updatedAt: string;
}

export interface AdminOrdersFilter {
  status?: Order["status"] | "all";
  search?: string;
  page?: number;
  limit?: number;
}

export interface AdminOrderStats {
  total: number;
  en_proceso: number;
  entregado: number;
  pendiente_pago: number;
  cancelado: number;
  revenueQ: number;
}

export interface AdminOrdersResult {
  orders: AdminOrder[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  stats: AdminOrderStats;
}

function mapDbOrderAdmin(row: DbOrder): AdminOrder {
  return {
    ...mapDbOrder(row),
    dbId: row.id,
    sessionId: row.session_id,
    paymentMethod: row.payment_method,
    paymentProvider: row.payment_provider,
    updatedAt: row.updated_at,
  };
}

async function mapDbOrderAdminWithResolvedItems(
  row: DbOrder
): Promise<AdminOrder> {
  const order = mapDbOrderAdmin(row);
  order.items = await resolveOrderItemsForDisplay(order.items);
  return order;
}

export async function getAdminOrderStats(): Promise<AdminOrderStats> {
  const { data, error } = await supabase
    .from("orders")
    .select("status, total_q");

  if (error) {
    console.error("Error fetching order stats:", error);
    throw error;
  }

  const rows = data ?? [];
  const stats: AdminOrderStats = {
    total: rows.length,
    en_proceso: 0,
    entregado: 0,
    pendiente_pago: 0,
    cancelado: 0,
    revenueQ: 0,
  };

  for (const row of rows) {
    const status = normalizeOrderStatus(String(row.status));
    if (status === "en_proceso") {
      stats.en_proceso += 1;
    } else if (status === "entregado") {
      stats.entregado += 1;
    } else if (status === "pendiente_pago") {
      stats.pendiente_pago += 1;
    } else if (status === "cancelado") {
      stats.cancelado += 1;
    }
    if (isPaidOrderStatus(status)) {
      stats.revenueQ += Number(row.total_q) || 0;
    }
  }

  return stats;
}

export async function getAllOrdersAdmin(
  filters: AdminOrdersFilter = {}
): Promise<AdminOrdersResult> {
  const page = Math.max(1, filters.page ?? 1);
  const limit = Math.min(100, Math.max(1, filters.limit ?? 25));
  const offset = (page - 1) * limit;

  let query = supabase.from("orders").select("*", { count: "exact" });

  if (filters.status && filters.status !== "all") {
    if (filters.status === "en_proceso") {
      query = query.in("status", ["en_proceso", "pagado"]);
    } else {
      query = query.eq("status", filters.status);
    }
  }

  const search = filters.search?.trim();
  if (search) {
    const term = `%${search}%`;
    query = query.or(
      `order_number.ilike.${term},customer_email.ilike.${term},customer_name.ilike.${term}`
    );
  }

  query = query
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  const [{ data, error, count }, stats] = await Promise.all([
    query,
    getAdminOrderStats(),
  ]);

  if (error) {
    console.error("Error fetching admin orders:", error);
    throw error;
  }

  const orders = await Promise.all(
    (data ?? []).map((row) => mapDbOrderAdminWithResolvedItems(row as DbOrder))
  );

  const total = count ?? 0;

  return {
    orders,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    },
    stats,
  };
}

export async function getOrderByNumberAdmin(
  orderNumber: string
): Promise<AdminOrder | null> {
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("order_number", orderNumber)
    .maybeSingle();

  if (error) {
    console.error("Error fetching admin order:", error);
    throw error;
  }

  return data ? mapDbOrderAdminWithResolvedItems(data as DbOrder) : null;
}

export async function updateOrderStatusAdmin(
  orderNumber: string,
  status: Order["status"]
): Promise<AdminOrder> {
  const { data, error } = await supabase
    .from("orders")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("order_number", orderNumber)
    .select()
    .single();

  if (error) {
    console.error("Error updating order status:", error);
    throw error;
  }

  return mapDbOrderAdminWithResolvedItems(data as DbOrder);
}

export async function getOrderByPaymentReference(
  paymentReference: string
): Promise<DbOrder | null> {
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("payment_reference", paymentReference)
    .maybeSingle();

  if (error) {
    console.error("Error fetching order by payment reference:", error);
    throw error;
  }

  return (data as DbOrder | null) ?? null;
}

export async function markOrderPaid(orderNumber: string): Promise<Order> {
  const { data, error } = await supabase
    .from("orders")
    .update({ status: "en_proceso", updated_at: new Date().toISOString() })
    .eq("order_number", orderNumber)
    .select()
    .single();

  if (error) {
    console.error("Error marking order paid:", error);
    throw error;
  }

  return mapDbOrderWithResolvedItems(data as DbOrder);
}
