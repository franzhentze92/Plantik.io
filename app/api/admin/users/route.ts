import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { getAllUsersAdmin } from "@/lib/supabase/users-admin";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { searchParams } = request.nextUrl;
  const search = searchParams.get("search") ?? undefined;
  const hasOrders = searchParams.get("hasOrders") === "true";
  const hasSpending = searchParams.get("hasSpending") === "true";
  const page = Number(searchParams.get("page") ?? "1");
  const limit = Number(searchParams.get("limit") ?? "25");

  try {
    const result = await getAllUsersAdmin({
      search,
      hasOrders: hasOrders || undefined,
      hasSpending: hasSpending || undefined,
      page,
      limit,
    });
    return NextResponse.json(result);
  } catch (error) {
    console.error("Admin users list error:", error);
    return NextResponse.json(
      { error: "No se pudieron cargar los usuarios." },
      { status: 500 }
    );
  }
}
