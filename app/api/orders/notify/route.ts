import { NextRequest, NextResponse } from "next/server";
import { isPaidOrderStatus } from "@/lib/order-display";
import type { OrderEmailInput } from "@/lib/email/format";
import { sendOrderEmails } from "@/lib/email/send-order-emails";

export const runtime = "nodejs";

type NotifyBody = {
  order?: OrderEmailInput;
};

export async function POST(request: NextRequest) {
  let body: NotifyBody;

  try {
    body = (await request.json()) as NotifyBody;
  } catch {
    return NextResponse.json(
      { error: "Cuerpo de la solicitud inválido." },
      { status: 400 }
    );
  }

  const order = body.order;
  if (!order?.id || !order.customerEmail?.trim()) {
    return NextResponse.json(
      { error: "Falta el pedido o el correo del cliente." },
      { status: 400 }
    );
  }

  if (order.status && !isPaidOrderStatus(order.status)) {
    return NextResponse.json(
      { error: "Solo se notifica pedidos confirmados.", status: order.status },
      { status: 409 }
    );
  }

  try {
    const result = await sendOrderEmails({
      ...order,
      status: order.status ?? "en_proceso",
      createdAt: order.createdAt || new Date().toISOString(),
      items: Array.isArray(order.items) ? order.items : [],
      totalQ: Number(order.totalQ) || 0,
    });

    if (result.skippedReason) {
      console.warn("Order email skipped:", result.skippedReason, {
        orderId: order.id,
      });
      return NextResponse.json({
        ok: false,
        skipped: true,
        reason: result.skippedReason,
      });
    }

    if (result.errors.length > 0) {
      console.error("Order email partial failure:", result);
    }

    return NextResponse.json({
      ok: result.customerSent || result.adminSent,
      customerSent: result.customerSent,
      adminSent: result.adminSent,
      errors: result.errors,
    });
  } catch (error) {
    console.error("Order notify error:", error);
    return NextResponse.json(
      { error: "No se pudieron enviar los correos del pedido." },
      { status: 500 }
    );
  }
}
