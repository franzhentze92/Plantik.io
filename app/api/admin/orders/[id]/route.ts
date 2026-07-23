import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { sendOrderStatusEmails } from "@/lib/email/send-order-emails";
import { normalizeOrderStatus } from "@/lib/order-display";
import {
  getOrderByNumberAdmin,
  updateOrderStatusAdmin,
} from "@/lib/supabase/orders";
import type { Order } from "@/lib/store";

export const runtime = "nodejs";

const VALID_STATUSES: Order["status"][] = [
  "en_proceso",
  "entregado",
  "pendiente_pago",
  "cancelado",
];

type RouteContext = { params: { id: string } };

export async function GET(request: NextRequest, { params }: RouteContext) {
  const auth = await requireAdmin(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const orderNumber = decodeURIComponent(params.id);

  try {
    const order = await getOrderByNumberAdmin(orderNumber);
    if (!order) {
      return NextResponse.json(
        { error: "Pedido no encontrado." },
        { status: 404 }
      );
    }
    return NextResponse.json({ order });
  } catch (error) {
    console.error("Admin order detail error:", error);
    return NextResponse.json(
      { error: "No se pudo cargar el pedido." },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  const auth = await requireAdmin(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const orderNumber = decodeURIComponent(params.id);

  let body: { status?: Order["status"] };
  try {
    body = (await request.json()) as { status?: Order["status"] };
  } catch {
    return NextResponse.json(
      { error: "Cuerpo de la solicitud inválido." },
      { status: 400 }
    );
  }

  if (!body.status || !VALID_STATUSES.includes(body.status)) {
    return NextResponse.json(
      { error: "Estado inválido." },
      { status: 400 }
    );
  }

  try {
    const existing = await getOrderByNumberAdmin(orderNumber);
    if (!existing) {
      return NextResponse.json(
        { error: "Pedido no encontrado." },
        { status: 404 }
      );
    }

    const previousStatus = normalizeOrderStatus(existing.status);
    const nextStatus = normalizeOrderStatus(body.status);

    if (previousStatus === nextStatus) {
      return NextResponse.json({ order: existing, emailed: false });
    }

    const order = await updateOrderStatusAdmin(orderNumber, nextStatus);

    const emailResult = await sendOrderStatusEmails(order, previousStatus);
    if (emailResult.skippedReason) {
      console.warn("Order status email skipped:", emailResult.skippedReason, {
        orderNumber,
      });
    } else if (emailResult.errors.length > 0) {
      console.error("Order status email partial failure:", emailResult);
    }

    return NextResponse.json({
      order,
      emailed: emailResult.customerSent || emailResult.adminSent,
      email: {
        customerSent: emailResult.customerSent,
        adminSent: emailResult.adminSent,
        errors: emailResult.errors,
      },
    });
  } catch (error) {
    console.error("Admin order update error:", error);
    return NextResponse.json(
      { error: "No se pudo actualizar el pedido." },
      { status: 500 }
    );
  }
}
