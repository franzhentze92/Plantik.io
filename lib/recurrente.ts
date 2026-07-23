const RECURRENTE_API_BASE = "https://app.recurrente.com/api";

export type RecurrenteCheckoutItem = {
  name: string;
  amount_in_cents: number;
  currency: "GTQ";
  quantity: number;
  charge_type?: "one_time";
};

export type RecurrenteCheckoutResponse = {
  id: string;
  status: string;
  checkout_url: string;
  metadata?: Record<string, string | number | boolean>;
};

export type RecurrenteIntentWebhook = {
  type?: string;
  event_type?: string;
  status?: string;
  id?: string;
  amount_in_cents?: number;
  currency?: string;
  checkout?: { id?: string; status?: string };
  customer?: {
    email?: string;
    full_name?: string;
  };
};

function getSecretKey(): string {
  const key = process.env.RECURRENTE_SECRET_KEY;
  if (!key) {
    throw new Error("RECURRENTE_SECRET_KEY no está configurada.");
  }
  return key;
}

export function priceQToCents(priceQ: number): number {
  return Math.round(priceQ * 100);
}

export function centsToPriceQ(cents: number): number {
  return Math.round(cents) / 100;
}

export function getAppBaseUrl(fallbackOrigin?: string): string {
  const configured =
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.APP_URL ||
    fallbackOrigin ||
    "http://localhost:3000";
  return configured.replace(/\/$/, "");
}

export async function createRecurrenteCheckout(input: {
  items: RecurrenteCheckoutItem[];
  successUrl: string;
  cancelUrl: string;
  metadata?: Record<string, string | number | boolean>;
}): Promise<RecurrenteCheckoutResponse> {
  const response = await fetch(`${RECURRENTE_API_BASE}/checkouts`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-SECRET-KEY": getSecretKey(),
    },
    body: JSON.stringify({
      items: input.items.map((item) => ({
        ...item,
        charge_type: item.charge_type ?? "one_time",
      })),
      success_url: input.successUrl,
      cancel_url: input.cancelUrl,
      metadata: input.metadata,
    }),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message =
      typeof data?.message === "string"
        ? data.message
        : "No se pudo crear el checkout en Recurrente.";
    throw new Error(message);
  }

  return data as RecurrenteCheckoutResponse;
}

export async function getRecurrenteCheckout(
  checkoutId: string
): Promise<RecurrenteCheckoutResponse> {
  const response = await fetch(
    `${RECURRENTE_API_BASE}/checkouts/${encodeURIComponent(checkoutId)}`,
    {
      headers: {
        "X-SECRET-KEY": getSecretKey(),
      },
      cache: "no-store",
    }
  );

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message =
      typeof data?.message === "string"
        ? data.message
        : "No se pudo consultar el checkout en Recurrente.";
    throw new Error(message);
  }

  return data as RecurrenteCheckoutResponse;
}

export function isRecurrenteCheckoutPaid(status: string | undefined): boolean {
  const normalized = (status || "").toLowerCase();
  return normalized === "paid" || normalized === "succeeded";
}
