import type { OrderItem } from "@/lib/store";
import { formatQ } from "@/lib/utils";

export type OrderEmailInput = {
  id: string;
  createdAt: string;
  items: OrderItem[];
  totalQ: number;
  status?: string;
  customerName?: string;
  customerEmail?: string;
  customerAddress?: string;
  subtotalQ?: number;
  shippingQ?: number;
};

export type OrderEmailPayload = {
  id: string;
  createdAt: string;
  items: OrderItem[];
  subtotalQ: number;
  shippingQ: number;
  totalQ: number;
  customerName: string;
  customerEmail: string;
  customerAddress: string;
  status: string;
};

function subtotalFromOrder(order: OrderEmailInput): number {
  if (order.subtotalQ != null) return order.subtotalQ;
  return order.items.reduce((sum, item) => sum + item.priceQ * item.qty, 0);
}

function shippingFromOrder(order: OrderEmailInput): number {
  if (order.shippingQ != null) return order.shippingQ;
  return Math.max(0, order.totalQ - subtotalFromOrder(order));
}

export function toOrderEmailPayload(
  order: OrderEmailInput
): OrderEmailPayload | null {
  const email = order.customerEmail?.trim();
  if (!email) return null;

  return {
    id: order.id,
    createdAt: order.createdAt,
    items: order.items,
    subtotalQ: subtotalFromOrder(order),
    shippingQ: shippingFromOrder(order),
    totalQ: order.totalQ,
    customerName: order.customerName?.trim() || "Cliente",
    customerEmail: email,
    customerAddress: order.customerAddress?.trim() || "Sin dirección",
    status: order.status || "pagado",
  };
}

export function formatMoney(amount: number): string {
  return formatQ(amount);
}

export function formatOrderDate(iso: string): string {
  const label = new Date(iso).toLocaleString("es-GT", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
  return label.charAt(0).toUpperCase() + label.slice(1);
}

export function formatEstimatedDelivery(iso: string): string {
  const next = new Date(new Date(iso).getTime() + 24 * 60 * 60 * 1000);
  const label = next.toLocaleDateString("es-GT", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
  return label.charAt(0).toUpperCase() + label.slice(1);
}

export function appBaseUrl(): string {
  const raw =
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.APP_URL ||
    "https://www.plantik.io";
  return raw.replace(/\/$/, "");
}
