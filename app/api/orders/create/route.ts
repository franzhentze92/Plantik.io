import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import type { CartItem, Order } from "@/lib/store";
import { sendOrderEmails } from "@/lib/email/send-order-emails";
import { isPaidOrderStatus } from "@/lib/order-display";
import { createOrder } from "@/lib/supabase/orders";

export const runtime = "nodejs";

type CreateOrderBody = {
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

export async function POST(request: NextRequest) {
  let body: CreateOrderBody;

  try {
    body = (await request.json()) as CreateOrderBody;
  } catch {
    return NextResponse.json(
      { error: "Cuerpo de la solicitud inválido." },
      { status: 400 }
    );
  }

  const items = Array.isArray(body.items) ? body.items : [];
  const customer = body.customer;

  if (items.length === 0) {
    return NextResponse.json({ error: "El carrito está vacío." }, { status: 400 });
  }

  if (!customer?.name?.trim() || !customer?.email?.trim()) {
    return NextResponse.json(
      { error: "Completa nombre y correo del cliente." },
      { status: 400 }
    );
  }

  const subtotalQ = Number(body.subtotalQ) || 0;
  const shippingQ = Number(body.shippingQ) || 0;
  const totalQ = Number(body.totalQ) || subtotalQ + shippingQ;

  if (totalQ <= 0) {
    return NextResponse.json({ error: "Total inválido." }, { status: 400 });
  }

  try {
    const sessionId = await resolveSessionId(request, body.sessionId);
    const status = body.status ?? "en_proceso";

    const order = await createOrder(sessionId, {
      items,
      subtotalQ,
      shippingQ,
      totalQ,
      customerName: customer.name.trim(),
      customerEmail: customer.email.trim(),
      customerAddress: customer.address?.trim() ?? "",
      status,
      paymentMethod: body.paymentMethod ?? "card",
      paymentProvider: body.paymentProvider ?? null,
      paymentReference: body.paymentReference ?? null,
    });

    if (isPaidOrderStatus(status)) {
      try {
        await sendOrderEmails({
          id: order.id,
          items: order.items,
          subtotalQ: order.subtotalQ,
          shippingQ: order.shippingQ,
          totalQ: order.totalQ,
          createdAt: order.createdAt,
          status: order.status,
          customerName: order.customerName,
          customerEmail: order.customerEmail,
          customerAddress: order.customerAddress,
        });
      } catch (emailError) {
        console.error("Order created but email failed:", emailError);
      }
    }

    return NextResponse.json({ order });
  } catch (error) {
    console.error("Create order error:", error);
    return NextResponse.json(
      { error: "No se pudo registrar el pedido." },
      { status: 500 }
    );
  }
}
