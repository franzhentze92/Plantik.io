import type { CartItem } from "@/lib/store";
import { priceQToCents } from "@/lib/recurrente";

/** Flat shipping fee when the order subtotal is below the free threshold. */
export const CHECKOUT_SHIPPING_FLAT_Q = 20;

/** Subtotals at or above this amount ship for free. */
export const CHECKOUT_FREE_SHIPPING_THRESHOLD_Q = 100;

/** @deprecated Use calculateShippingQ(subtotalQ) instead. */
export const CHECKOUT_SHIPPING_Q = CHECKOUT_SHIPPING_FLAT_Q;

export function calculateShippingQ(subtotalQ: number): number {
  if (subtotalQ <= 0) return 0;
  if (subtotalQ >= CHECKOUT_FREE_SHIPPING_THRESHOLD_Q) return 0;
  return CHECKOUT_SHIPPING_FLAT_Q;
}

export const PENDING_CHECKOUT_STORAGE_KEY = "verdea_pending_checkout";

export type CheckoutCustomer = {
  name: string;
  email: string;
  address: string;
};

export type PendingCheckoutOrder = {
  orderId: string;
  checkoutId: string;
  items: CartItem[];
  subtotalQ: number;
  shippingQ: number;
  totalQ: number;
  customer: CheckoutCustomer;
  createdAt: string;
};

export function buildOrderId(): string {
  return `VRD-${Date.now().toString().slice(-6)}`;
}

export function buildRecurrenteCheckoutItems(
  items: CartItem[],
  shippingQ: number
): Array<{
  name: string;
  amount_in_cents: number;
  currency: "GTQ";
  quantity: number;
}> {
  const lineItems = items.flatMap((item) => {
    const unitCents = priceQToCents(item.priceQ);
    if (unitCents <= 0) return [];

    return [
      {
        name:
          item.qty > 1
            ? `${item.name} (×${item.qty})`
            : item.name,
        amount_in_cents: unitCents * item.qty,
        currency: "GTQ" as const,
        quantity: 1,
      },
    ];
  });

  if (shippingQ > 0) {
    lineItems.push({
      name: "Envío",
      amount_in_cents: priceQToCents(shippingQ),
      currency: "GTQ",
      quantity: 1,
    });
  }

  return lineItems;
}
