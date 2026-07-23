import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import type { CatalogOverrideInput } from "@/lib/catalog-overrides";
import { invalidateCatalogCache } from "@/lib/supabase-queries";
import {
  getCatalogProductAdmin,
  resetCatalogOverride,
  upsertCatalogOverride,
} from "@/lib/supabase/catalog-admin";

export const runtime = "nodejs";

type RouteContext = { params: { id: string } };

export async function GET(request: NextRequest, { params }: RouteContext) {
  const auth = await requireAdmin(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const publicId = decodeURIComponent(params.id);

  try {
    const product = await getCatalogProductAdmin(publicId);
    if (!product) {
      return NextResponse.json(
        { error: "Producto no encontrado." },
        { status: 404 }
      );
    }
    return NextResponse.json({ product });
  } catch (error) {
    console.error("Admin catalog detail error:", error);
    return NextResponse.json(
      { error: "No se pudo cargar el producto." },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  const auth = await requireAdmin(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const publicId = decodeURIComponent(params.id);

  let body: CatalogOverrideInput;
  try {
    body = (await request.json()) as CatalogOverrideInput;
  } catch {
    return NextResponse.json(
      { error: "Cuerpo de la solicitud inválido." },
      { status: 400 }
    );
  }

  try {
    const product = await upsertCatalogOverride(publicId, body, auth.email);
    invalidateCatalogCache();
    return NextResponse.json({ product });
  } catch (error) {
    console.error("Admin catalog update error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "No se pudo guardar el producto.",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteContext) {
  const auth = await requireAdmin(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const publicId = decodeURIComponent(params.id);

  try {
    await resetCatalogOverride(publicId);
    invalidateCatalogCache();
    const product = await getCatalogProductAdmin(publicId);
    return NextResponse.json({ product });
  } catch (error) {
    console.error("Admin catalog reset error:", error);
    return NextResponse.json(
      { error: "No se pudo restaurar el producto." },
      { status: 500 }
    );
  }
}
