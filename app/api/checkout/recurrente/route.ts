import { NextRequest, NextResponse } from "next/server";
import {
  buildOrderId,
  buildRecurrenteCheckoutItems,
  calculateShippingQ,
  type CheckoutCustomer,
  type PendingCheckoutOrder,
} from "@/lib/checkout-order";
import type { CartItem } from "@/lib/store";
import {
  createRecurrenteCheckout,
  getAppBaseUrl,
  priceQToCents,
} from "@/lib/recurrente";
import { createOrder } from "@/lib/supabase/orders";
import { createClient } from "@supabase/supabase-js";

type CreateCheckoutBody = {
  items: CartItem[];
  customer: CheckoutCustomer;
  sessionId?: string;
};

async function resolveSessionId(
  request: NextRequest,
  bodySessionId?: string
): Promise<string> {
  const authHeader = request.headers.get("Authorization");
  const token = authHeader?.replace(/^Bearer\s+/i, "").trim();

  if (token) {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const {
      data: { user },
    } = await supabase.auth.getUser(token);
    if (user?.id) return `user:${user.id}`;
  }

  if (bodySessionId?.trim()) return bodySessionId.trim();
  return `guest:${crypto.randomUUID()}`;
}

function isValidCustomer(customer: CheckoutCustomer | undefined): customer is CheckoutCustomer {
  return Boolean(
    customer?.name?.trim() &&
      customer?.email?.trim() &&
      customer?.address?.trim()
  );
}

export async function POST(request: NextRequest) {
  try {
    if (!process.env.RECURRENTE_SECRET_KEY) {
      return NextResponse.json(
        {
          error:
            "Pagos con tarjeta no configurados. Agrega RECURRENTE_SECRET_KEY en el servidor.",
        },
        { status: 503 }
      );
    }

    const body = (await request.json()) as CreateCheckoutBody;
    const items = Array.isArray(body.items) ? body.items : [];
    const customer = body.customer;

    if (items.length === 0) {
      return NextResponse.json({ error: "El carrito está vacío." }, { status: 400 });
    }

    if (!isValidCustomer(customer)) {
      return NextResponse.json(
        { error: "Completa nombre, correo y dirección de entrega." },
        { status: 400 }
      );
    }

    const subtotalQ = items.reduce((sum, item) => sum + item.priceQ * item.qty, 0);
    const shippingQ = calculateShippingQ(subtotalQ);
    const totalQ = subtotalQ + shippingQ;
    const totalCents = priceQToCents(totalQ);

    if (totalCents < 500) {
      return NextResponse.json(
        { error: "El total mínimo para pagar con tarjeta es Q5." },
        { status: 400 }
      );
    }

    const orderId = buildOrderId();
    const sessionId = await resolveSessionId(request, body.sessionId);
    const baseUrl = getAppBaseUrl(request.nextUrl.origin);
    const successUrl = `${baseUrl}/app/carrito?payment=success&order=${encodeURIComponent(orderId)}`;
    const cancelUrl = `${baseUrl}/app/carrito?payment=cancelled&order=${encodeURIComponent(orderId)}`;

    const checkout = await createRecurrenteCheckout({
      items: buildRecurrenteCheckoutItems(items, shippingQ),
      successUrl,
      cancelUrl,
      metadata: {
        order_id: orderId,
        customer_email: customer.email.trim(),
        customer_name: customer.name.trim(),
      },
    });

    await createOrder(sessionId, {
      items,
      subtotalQ,
      shippingQ,
      totalQ,
      customerName: customer.name.trim(),
      customerEmail: customer.email.trim(),
      customerAddress: customer.address.trim(),
      status: "pendiente_pago",
      paymentMethod: "card",
      paymentProvider: "recurrente",
      paymentReference: checkout.id,
      orderNumber: orderId,
    });

    const pendingOrder: PendingCheckoutOrder = {
      orderId,
      checkoutId: checkout.id,
      items,
      subtotalQ,
      shippingQ,
      totalQ,
      customer: {
        name: customer.name.trim(),
        email: customer.email.trim(),
        address: customer.address.trim(),
      },
      createdAt: new Date().toISOString(),
    };

    return NextResponse.json({
      checkoutUrl: checkout.checkout_url,
      checkoutId: checkout.id,
      orderId,
      pendingOrder,
    });
  } catch (error) {
    console.error("Recurrente checkout error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "No se pudo iniciar el pago con tarjeta.",
      },
      { status: 500 }
    );
  }
}
