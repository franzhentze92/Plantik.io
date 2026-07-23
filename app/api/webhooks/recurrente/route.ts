import { NextRequest, NextResponse } from "next/server";
import type { RecurrenteIntentWebhook } from "@/lib/recurrente";
import { sendOrderEmails } from "@/lib/email/send-order-emails";
import {
  getOrderByPaymentReference,
  markOrderPaid,
} from "@/lib/supabase/orders";

export const runtime = "nodejs";

async function verifyWebhookSignature(
  rawBody: string,
  headers: Headers
): Promise<RecurrenteIntentWebhook | null> {
  const secret = process.env.RECURRENTE_WEBHOOK_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      console.error("RECURRENTE_WEBHOOK_SECRET missing in production.");
      return null;
    }
    console.warn(
      "RECURRENTE_WEBHOOK_SECRET no configurado; webhook aceptado solo en desarrollo."
    );
    return JSON.parse(rawBody) as RecurrenteIntentWebhook;
  }

  try {
    const { Webhook } = await import("svix");
    const wh = new Webhook(secret);
    return wh.verify(rawBody, {
      "svix-id": headers.get("svix-id") || "",
      "svix-timestamp": headers.get("svix-timestamp") || "",
      "svix-signature": headers.get("svix-signature") || "",
    }) as RecurrenteIntentWebhook;
  } catch (error) {
    console.error("Recurrente webhook signature verification failed:", error);
    return null;
  }
}

export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const payload = await verifyWebhookSignature(rawBody, request.headers);

  if (!payload) {
    return NextResponse.json({ error: "Firma inválida." }, { status: 400 });
  }

  const eventType = payload.event_type || "";
  const status = (payload.status || "").toLowerCase();
  const checkoutId = payload.checkout?.id;

  if (
    eventType === "intent.succeeded" &&
    status === "succeeded" &&
    checkoutId
  ) {
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
        console.error("Recurrente webhook email failed:", emailError);
      }
      console.info("Recurrente order marked paid", {
        checkoutId,
        orderNumber: existing.order_number,
      });
    } else {
      console.info("Recurrente payment succeeded", {
        checkoutId,
        intentId: payload.id,
        amountInCents: payload.amount_in_cents,
        customerEmail: payload.customer?.email,
      });
    }
  }

  return NextResponse.json({ received: true });
}
