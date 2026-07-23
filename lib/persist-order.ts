import { supabase } from "@/lib/supabase";
import type { CartItem, Order } from "@/lib/store";

type PersistOrderInput = {
  items: CartItem[];
  subtotalQ: number;
  shippingQ: number;
  totalQ: number;
  customer: {
    name: string;
    email: string;
    address: string;
  };
  sessionId?: string;
  status?: Order["status"];
  paymentMethod?: string;
  paymentProvider?: string | null;
  paymentReference?: string | null;
};

export async function persistCheckoutOrder(
  input: PersistOrderInput
): Promise<Order> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };
  if (session?.access_token) {
    headers.Authorization = `Bearer ${session.access_token}`;
  }

  const res = await fetch("/api/orders/create", {
    method: "POST",
    headers,
    body: JSON.stringify(input),
  });

  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(body.error ?? "No se pudo registrar el pedido.");
  }

  const data = (await res.json()) as { order: Order };
  return data.order;
}
