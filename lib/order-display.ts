import type { Order } from "@/lib/store";

export function formatDeliveryDate(fromISO: string): string {
  const next = new Date(new Date(fromISO).getTime() + 24 * 60 * 60 * 1000);
  const label = next.toLocaleDateString("es-GT", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
  return label.charAt(0).toUpperCase() + label.slice(1);
}

/** Legacy DB rows may still use `pagado`; treat as en proceso. */
export function normalizeOrderStatus(status: string): Order["status"] {
  if (status === "pagado") return "en_proceso";
  return status as Order["status"];
}

export function isPaidOrderStatus(status: Order["status"] | string): boolean {
  const normalized = normalizeOrderStatus(status);
  return (
    normalized === "en_proceso" ||
    normalized === "entregado" ||
    normalized === "pagado"
  );
}

const ORDER_STATUS_LABELS: Record<Order["status"], string> = {
  pendiente_pago: "Pendiente de pago",
  en_proceso: "En proceso",
  entregado: "Entregado",
  cancelado: "Cancelado",
  pagado: "En proceso",
};

export function formatOrderStatus(status: Order["status"] | string): string {
  const normalized = normalizeOrderStatus(status);
  return ORDER_STATUS_LABELS[normalized] ?? normalized;
}

export function orderStatusBadgeClass(status: Order["status"] | string): string {
  switch (normalizeOrderStatus(status)) {
    case "entregado":
      return "bg-brand-sage text-brand-forest";
    case "en_proceso":
    case "pagado":
      return "bg-sky-100 text-sky-800";
    case "pendiente_pago":
      return "bg-amber-100 text-amber-800";
    case "cancelado":
      return "bg-red-100 text-red-700";
    default:
      return "bg-brand-sage text-brand-forest";
  }
}

export function orderSubtotalQ(order: Order): number {
  if (order.subtotalQ != null) return order.subtotalQ;
  return order.items.reduce((sum, item) => sum + item.priceQ * item.qty, 0);
}

export function orderShippingQ(order: Order): number {
  if (order.shippingQ != null) return order.shippingQ;
  const subtotal = orderSubtotalQ(order);
  return Math.max(0, order.totalQ - subtotal);
}
