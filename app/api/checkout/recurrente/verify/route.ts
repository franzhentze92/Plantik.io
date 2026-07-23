import { NextRequest, NextResponse } from "next/server";
import { sendOrderEmails } from "@/lib/email/send-order-emails";
import {
  getOrderByPaymentReference,
  markOrderPaid,
} from "@/lib/supabase/orders";
import {
  getRecurrenteCheckout,
  isRecurrenteCheckoutPaid,
} from "@/lib/recurrente";

export async function POST(request: NextRequest) {
  try {
    if (!process.env.RECURRENTE_SECRET_KEY) {
      return NextResponse.json(
        { error: "Pagos con tarjeta no configurados." },
        { status: 503 }
      );
    }

    const body = (await request.json()) as {
      checkoutId?: string;
      orderId?: string;
    };

    const checkoutId = body.checkoutId?.trim();
    const orderId = body.orderId?.trim();

    if (!checkoutId) {
      return NextResponse.json(
        { error: "Falta el identificador del checkout." },
        { status: 400 }
      );
    }

    const checkout = await getRecurrenteCheckout(checkoutId);
    const metadataOrderId =
      typeof checkout.metadata?.order_id === "string"
        ? checkout.metadata.order_id
        : undefined;

    if (orderId && metadataOrderId && metadataOrderId !== orderId) {
      return NextResponse.json(
        { error: "El pedido no coincide con el checkout." },
        { status: 400 }
      );
    }

    const paid = isRecurrenteCheckoutPaid(checkout.status);
    const resolvedOrderId = metadataOrderId || orderId || null;

    if (paid && resolvedOrderId) {
      const existing = await getOrderByPaymentReference(checkoutId);
      if (existing && existing.status === "pendiente_pago") {
        const order = await markOrderPaid(existing.order_number);
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
          console.error("Recurrente verify email failed:", emailError);
        }
      }
    }

    return NextResponse.json({
      paid,
      status: checkout.status,
      checkoutId: checkout.id,
      orderId: resolvedOrderId,
    });
  } catch (error) {
    console.error("Recurrente verify error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "No se pudo verificar el pago.",
      },
      { status: 500 }
    );
  }
}
