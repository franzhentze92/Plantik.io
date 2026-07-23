import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { getAllOrdersAdmin } from "@/lib/supabase/orders";
import type { Order } from "@/lib/store";

export const runtime = "nodejs";

const VALID_STATUSES = new Set<Order["status"] | "all">([
  "all",
  "en_proceso",
  "entregado",
  "pendiente_pago",
  "cancelado",
]);

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { searchParams } = request.nextUrl;
  const statusParam = searchParams.get("status") ?? "all";
  const status = VALID_STATUSES.has(statusParam as Order["status"] | "all")
    ? (statusParam as Order["status"] | "all")
    : "all";
  const search = searchParams.get("search") ?? undefined;
  const page = Number(searchParams.get("page") ?? "1");
  const limit = Number(searchParams.get("limit") ?? "25");

  try {
    const result = await getAllOrdersAdmin({ status, search, page, limit });
    return NextResponse.json(result);
  } catch (error) {
    console.error("Admin orders list error:", error);
    return NextResponse.json(
      { error: "No se pudieron cargar los pedidos." },
      { status: 500 }
    );
  }
}
