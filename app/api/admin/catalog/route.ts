import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { invalidateCatalogCache } from "@/lib/supabase-queries";
import {
  getAllCatalogProductsAdmin,
  type AdminCatalogKind,
} from "@/lib/supabase/catalog-admin";

export const runtime = "nodejs";

const VALID_KINDS = new Set<AdminCatalogKind | "all">([
  "all",
  "plant",
  "planter",
  "plato",
  "sustrato",
  "mulch",
]);

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { searchParams } = request.nextUrl;
  const kindParam = searchParams.get("kind") ?? "all";
  const kind = VALID_KINDS.has(kindParam as AdminCatalogKind | "all")
    ? (kindParam as AdminCatalogKind | "all")
    : "all";
  const search = searchParams.get("search") ?? undefined;
  const availability =
    (searchParams.get("availability") as
      | "all"
      | "in_stock"
      | "out_of_stock"
      | null) ?? "all";
  const hidden =
    (searchParams.get("hidden") as "all" | "visible" | "hidden" | null) ??
    "all";
  const page = Number(searchParams.get("page") ?? "1");
  const limit = Number(searchParams.get("limit") ?? "24");

  try {
    const result = await getAllCatalogProductsAdmin({
      kind,
      search,
      availability,
      hidden,
      page,
      limit,
    });
    return NextResponse.json(result);
  } catch (error) {
    console.error("Admin catalog list error:", error);
    return NextResponse.json(
      { error: "No se pudo cargar el catálogo." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  invalidateCatalogCache();
  return NextResponse.json({ ok: true });
}
