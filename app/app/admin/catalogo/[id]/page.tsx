"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Eye,
  EyeOff,
  ImagePlus,
  Loader2,
  RotateCcw,
  Save,
  Shield,
  Trash2,
} from "lucide-react";
import { adminFetch } from "@/lib/admin-api";
import { grossMarginFromMarkupRate } from "@/lib/catalog-pricing";
import type { AdminCatalogProduct } from "@/lib/supabase/catalog-admin";
import { cn, formatQ } from "@/lib/utils";
import { EmptyState } from "@/components/ui/EmptyState";
import { Package } from "lucide-react";

const PLACEHOLDER_IMAGE = "/images/plant-placeholder.svg";

export default function AdminCatalogEditPage() {
  const params = useParams();
  const productId = decodeURIComponent(String(params?.id ?? ""));

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [product, setProduct] = useState<AdminCatalogProduct | null>(null);

  const [name, setName] = useState("");
  const [scientificName, setScientificName] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [description, setDescription] = useState("");
  const [retailPriceQ, setRetailPriceQ] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [extraImages, setExtraImages] = useState<string[]>([]);
  const [newImageUrl, setNewImageUrl] = useState("");
  const [availability, setAvailability] = useState<
    "in_stock" | "out_of_stock"
  >("in_stock");
  const [hidden, setHidden] = useState(false);

  const loadProduct = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminFetch(
        `/api/admin/catalog/${encodeURIComponent(productId)}`
      );
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(body.error ?? "Error al cargar producto");
      }
      const data = (await res.json()) as { product: AdminCatalogProduct };
      hydrateForm(data.product);
      setProduct(data.product);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
      setProduct(null);
    } finally {
      setLoading(false);
    }
  }, [productId]);

  function hydrateForm(item: AdminCatalogProduct) {
    setName(item.name);
    setScientificName(item.scientificName ?? "");
    setShortDescription(item.shortDescription);
    setDescription(item.description);
    setRetailPriceQ(String(item.retailPriceQ));
    setImageUrl(item.imageUrl === PLACEHOLDER_IMAGE ? "" : item.imageUrl);
    setExtraImages(
      item.images.filter(
        (url) => url !== item.imageUrl && url !== PLACEHOLDER_IMAGE
      )
    );
    setAvailability(item.availability);
    setHidden(item.hidden);
  }

  useEffect(() => {
    void loadProduct();
  }, [loadProduct]);

  const marginPct = useMemo(() => {
    const retail = Number(retailPriceQ);
    const wholesale = product?.wholesalePriceQ ?? 0;
    if (!Number.isFinite(retail) || retail <= 0 || wholesale <= 0) return 0;
    return ((retail - wholesale) / retail) * 100;
  }, [retailPriceQ, product?.wholesalePriceQ]);

  const defaultMarginPct = useMemo(() => {
    if (!product) return 0;
    return grossMarginFromMarkupRate(product.markupRate) * 100;
  }, [product]);

  const allImages = useMemo(() => {
    const primary = imageUrl.trim();
    const gallery = extraImages.filter(Boolean);
    if (primary) return [primary, ...gallery.filter((u) => u !== primary)];
    return gallery;
  }, [imageUrl, extraImages]);

  async function handleSave() {
    if (!product) return;
    setSaving(true);
    setError(null);
    setSuccess(null);

    const parsedPrice = Number(retailPriceQ);
    if (!Number.isFinite(parsedPrice) || parsedPrice < 0) {
      setError("Ingresa un precio de venta válido.");
      setSaving(false);
      return;
    }

    try {
      const res = await adminFetch(
        `/api/admin/catalog/${encodeURIComponent(productId)}`,
        {
          method: "PATCH",
          body: JSON.stringify({
            name: name.trim() || product.name,
            scientificName: scientificName.trim() || null,
            shortDescription: shortDescription.trim(),
            description: description.trim(),
            priceQ: parsedPrice,
            imageUrl: imageUrl.trim() || null,
            images: allImages,
            availability,
            hidden,
          }),
        }
      );

      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(body.error ?? "No se pudo guardar");
      }

      const data = (await res.json()) as { product: AdminCatalogProduct };
      setProduct(data.product);
      hydrateForm(data.product);
      setSuccess("Cambios guardados correctamente.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setSaving(false);
    }
  }

  async function handleReset() {
    if (!product?.hasOverrides) return;
    if (!window.confirm("¿Restaurar este producto a los valores originales del catálogo?")) {
      return;
    }

    setResetting(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await adminFetch(
        `/api/admin/catalog/${encodeURIComponent(productId)}`,
        { method: "DELETE" }
      );
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(body.error ?? "No se pudo restaurar");
      }
      const data = (await res.json()) as { product: AdminCatalogProduct };
      setProduct(data.product);
      hydrateForm(data.product);
      setSuccess("Producto restaurado a valores originales.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setResetting(false);
    }
  }

  function addImageUrl() {
    const url = newImageUrl.trim();
    if (!url) return;
    if (!allImages.includes(url)) {
      if (!imageUrl.trim()) setImageUrl(url);
      else setExtraImages((prev) => [...prev, url]);
    }
    setNewImageUrl("");
  }

  function removeImage(url: string) {
    if (imageUrl === url) {
      const next = extraImages[0] ?? "";
      setImageUrl(next);
      setExtraImages((prev) => prev.filter((u) => u !== url && u !== next));
      return;
    }
    setExtraImages((prev) => prev.filter((u) => u !== url));
  }

  if (loading) {
    return (
      <div className="container-app py-16">
        <p className="text-brand-carbon/60">Cargando producto...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container-app py-16">
        <EmptyState
          icon={Package}
          title="Producto no encontrado"
          description={error ?? "El producto que buscas no existe."}
          action={
            <Link
              href="/app/admin/catalogo"
              className="rounded-full bg-brand-forest px-5 py-2.5 text-sm font-semibold text-white"
            >
              Volver al catálogo
            </Link>
          }
        />
      </div>
    );
  }

  const previewImage = allImages[0] || PLACEHOLDER_IMAGE;

  return (
    <div className="container-app py-10">
      <Link
        href="/app/admin/catalogo"
        className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-brand-forest hover:opacity-70"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver al catálogo
      </Link>

      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <span className="eyebrow inline-flex items-center gap-2">
            <Shield className="h-3.5 w-3.5" />
            Admin · Editar producto
          </span>
          <h1 className="mt-2 font-serif text-3xl text-brand-forest sm:text-4xl">
            {product.name}
          </h1>
          <p className="mt-2 text-sm text-brand-carbon/55">
            ID {product.id} · {product.epaCategory}
            {product.hasOverrides && " · Con ediciones personalizadas"}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {product.hasOverrides && (
            <button
              type="button"
              onClick={() => void handleReset()}
              disabled={resetting || saving}
              className="inline-flex items-center gap-2 rounded-full border border-brand-beige bg-white px-4 py-2 text-sm font-semibold text-brand-carbon/70 disabled:opacity-50"
            >
              {resetting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RotateCcw className="h-4 w-4" />
              )}
              Restaurar original
            </button>
          )}
          <button
            type="button"
            onClick={() => void handleSave()}
            disabled={saving || resetting}
            className="inline-flex items-center gap-2 rounded-full bg-brand-forest px-5 py-2 text-sm font-semibold text-white disabled:opacity-50"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Guardar cambios
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-xl2 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 rounded-xl2 border border-brand-sage bg-brand-sage/30 px-4 py-3 text-sm text-brand-forest">
          {success}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <div className="space-y-4">
          <div className="overflow-hidden rounded-xl2 border border-brand-beige bg-white shadow-soft">
            <div className="relative aspect-square bg-brand-cream">
              <Image
                src={previewImage}
                alt={name || product.name}
                fill
                unoptimized
                sizes="320px"
                className="object-cover"
              />
            </div>
            <div className="p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-brand-carbon/45">
                Vista previa
              </p>
              <p className="mt-2 font-semibold text-brand-forest">{name || product.name}</p>
              <p className="mt-1 font-serif text-2xl text-brand-forest">
                {formatQ(Number(retailPriceQ) || 0)}
              </p>
            </div>
          </div>

          {allImages.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {allImages.map((url) => (
                <button
                  key={url}
                  type="button"
                  onClick={() => setImageUrl(url)}
                  className={cn(
                    "relative aspect-square overflow-hidden rounded-lg border",
                    imageUrl === url
                      ? "border-brand-forest ring-2 ring-brand-forest/30"
                      : "border-brand-beige"
                  )}
                >
                  <Image src={url} alt="" fill unoptimized sizes="80px" className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <section className="rounded-xl2 border border-brand-beige bg-white p-6 shadow-soft">
            <h2 className="font-semibold text-brand-forest">Información básica</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Field label="Nombre comercial">
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={inputClass}
                />
              </Field>
              {product.kind === "plant" && (
                <Field label="Nombre científico">
                  <input
                    value={scientificName}
                    onChange={(e) => setScientificName(e.target.value)}
                    className={inputClass}
                  />
                </Field>
              )}
              <Field label="Descripción corta" className="sm:col-span-2">
                <input
                  value={shortDescription}
                  onChange={(e) => setShortDescription(e.target.value)}
                  className={inputClass}
                />
              </Field>
              <Field label="Descripción completa" className="sm:col-span-2">
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={6}
                  className={cn(inputClass, "resize-y")}
                />
              </Field>
            </div>
          </section>

          <section className="rounded-xl2 border border-brand-beige bg-white p-6 shadow-soft">
            <h2 className="font-semibold text-brand-forest">Precios</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              <div className="rounded-xl bg-brand-cream/60 p-4">
                <p className="text-xs text-brand-carbon/50">Precio mayorista</p>
                <p className="mt-1 font-serif text-xl text-brand-carbon">
                  {formatQ(product.wholesalePriceQ)}
                </p>
              </div>
              <div className="rounded-xl bg-brand-cream/60 p-4">
                <p className="text-xs text-brand-carbon/50">Precio sugerido</p>
                <p className="mt-1 font-serif text-xl text-brand-carbon">
                  {formatQ(product.defaultRetailPriceQ)}
                </p>
                <p className="mt-1 text-[11px] text-brand-carbon/45">
                  Margen ~{defaultMarginPct.toFixed(0)}%
                </p>
              </div>
              <Field label="Precio de venta (Q)">
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={retailPriceQ}
                  onChange={(e) => setRetailPriceQ(e.target.value)}
                  className={inputClass}
                />
                <p className="mt-1 text-[11px] text-brand-carbon/45">
                  Margen actual ~{marginPct.toFixed(0)}%
                </p>
              </Field>
            </div>
          </section>

          <section className="rounded-xl2 border border-brand-beige bg-white p-6 shadow-soft">
            <h2 className="font-semibold text-brand-forest">Imágenes</h2>
            <p className="mt-1 text-sm text-brand-carbon/55">
              Pega URLs de imagen. La primera imagen se usa como principal en el catálogo.
            </p>
            <div className="mt-4 space-y-3">
              <Field label="Imagen principal (URL)">
                <input
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://..."
                  className={inputClass}
                />
              </Field>
              <div className="flex gap-2">
                <input
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  placeholder="Agregar otra URL..."
                  className={cn(inputClass, "flex-1")}
                />
                <button
                  type="button"
                  onClick={addImageUrl}
                  className="inline-flex items-center gap-1 rounded-xl bg-brand-sage px-4 py-2 text-sm font-semibold text-brand-forest"
                >
                  <ImagePlus className="h-4 w-4" />
                  Agregar
                </button>
              </div>
              {allImages.length > 0 && (
                <ul className="space-y-2">
                  {allImages.map((url) => (
                    <li
                      key={url}
                      className="flex items-center gap-3 rounded-xl border border-brand-beige/70 bg-brand-cream/30 px-3 py-2"
                    >
                      <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg">
                        <Image src={url} alt="" fill unoptimized sizes="40px" className="object-cover" />
                      </div>
                      <span className="min-w-0 flex-1 truncate text-xs text-brand-carbon/70">
                        {url}
                      </span>
                      {imageUrl === url && (
                        <span className="text-[10px] font-semibold text-brand-forest">
                          Principal
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => removeImage(url)}
                        className="text-brand-carbon/45 hover:text-red-600"
                        aria-label="Eliminar imagen"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>

          <section className="rounded-xl2 border border-brand-beige bg-white p-6 shadow-soft">
            <h2 className="font-semibold text-brand-forest">Disponibilidad y visibilidad</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Field label="Stock">
                <select
                  value={availability}
                  onChange={(e) =>
                    setAvailability(e.target.value as typeof availability)
                  }
                  className={inputClass}
                >
                  <option value="in_stock">En stock</option>
                  <option value="out_of_stock">Agotado</option>
                </select>
              </Field>
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-brand-carbon/45">
                  Visibilidad en catálogo
                </p>
                <button
                  type="button"
                  onClick={() => setHidden((v) => !v)}
                  className={cn(
                    "inline-flex w-full items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition-colors",
                    hidden
                      ? "border-red-200 bg-red-50 text-red-700"
                      : "border-brand-beige bg-white text-brand-forest"
                  )}
                >
                  {hidden ? (
                    <>
                      <EyeOff className="h-4 w-4" />
                      Oculto del catálogo
                    </>
                  ) : (
                    <>
                      <Eye className="h-4 w-4" />
                      Visible en catálogo
                    </>
                  )}
                </button>
              </div>
            </div>
          </section>

          {Object.keys(product.attributes).length > 0 && (
            <section className="rounded-xl2 border border-brand-beige bg-white p-6 shadow-soft">
              <h2 className="font-semibold text-brand-forest">
                Atributos del proveedor
              </h2>
              <p className="mt-1 text-sm text-brand-carbon/55">
                Información importada del catálogo original (solo lectura).
              </p>
              <dl className="mt-4 grid gap-3 sm:grid-cols-2">
                {Object.entries(product.attributes).map(([key, value]) => (
                  <div
                    key={key}
                    className="rounded-xl bg-brand-cream/40 px-3 py-2 text-sm"
                  >
                    <dt className="text-[11px] font-semibold uppercase tracking-wide text-brand-carbon/45">
                      {key}
                    </dt>
                    <dd className="mt-0.5 text-brand-carbon/80">{value}</dd>
                  </div>
                ))}
              </dl>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={className}>
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-brand-carbon/45">
        {label}
      </span>
      {children}
    </label>
  );
}

const inputClass =
  "w-full rounded-xl border border-brand-beige bg-white px-3 py-2.5 text-sm text-brand-carbon outline-none ring-brand-forest/20 focus:ring-2";
