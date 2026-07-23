"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Check,
  CreditCard,
  Layers,
  Leaf,
  Loader2,
  Mail,
  MapPin,
  Package,
  Shield,
  Truck,
  User,
} from "lucide-react";
import { adminFetch } from "@/lib/admin-api";
import {
  formatDeliveryDate,
  formatOrderStatus,
  orderShippingQ,
  orderStatusBadgeClass,
  orderSubtotalQ,
} from "@/lib/order-display";
import type { AdminOrder } from "@/lib/supabase/orders";
import { CreationComponent, Order, OrderItem } from "@/lib/store";
import { cn, formatQ } from "@/lib/utils";
import { EmptyState } from "@/components/ui/EmptyState";

const PLACEHOLDER_IMAGE = "/images/plant-placeholder.svg";

const STATUS_OPTIONS: Order["status"][] = [
  "en_proceso",
  "entregado",
  "pendiente_pago",
  "cancelado",
];

const KIND_LABELS: Record<string, string> = {
  plant: "Planta",
  planter: "Maceta",
  accesorio: "Accesorio",
  creacion: "Creación",
  propuesta: "Propuesta",
};

function formatOrderDate(iso: string) {
  return new Date(iso).toLocaleDateString("es-GT", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AdminOrderDetailPage() {
  const params = useParams();
  const orderId = decodeURIComponent(String(params?.id ?? ""));
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<AdminOrder | null>(null);
  const [statusDraft, setStatusDraft] = useState<Order["status"]>("en_proceso");

  const loadOrder = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminFetch(
        `/api/admin/orders/${encodeURIComponent(orderId)}`
      );
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(body.error ?? "Error al cargar el pedido");
      }
      const data = (await res.json()) as { order: AdminOrder };
      setOrder(data.order);
      setStatusDraft(data.order.status);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
      setOrder(null);
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    void loadOrder();
  }, [loadOrder]);

  async function handleStatusSave() {
    if (!order || statusDraft === order.status) return;
    setSaving(true);
    setError(null);
    try {
      const res = await adminFetch(
        `/api/admin/orders/${encodeURIComponent(orderId)}`,
        {
          method: "PATCH",
          body: JSON.stringify({ status: statusDraft }),
        }
      );
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(body.error ?? "No se pudo actualizar el estado");
      }
      const data = (await res.json()) as { order: AdminOrder };
      setOrder(data.order);
      setStatusDraft(data.order.status);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="container-app py-16">
        <p className="text-brand-carbon/60">Cargando pedido...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container-app py-16">
        <EmptyState
          icon={Package}
          title="Pedido no encontrado"
          description={
            error ??
            "El pedido que buscas no existe o ya no está disponible."
          }
          action={
            <Link
              href="/app/admin/pedidos"
              className="rounded-full bg-brand-forest px-5 py-2.5 text-sm font-semibold text-white"
            >
              Volver al listado
            </Link>
          }
        />
      </div>
    );
  }

  const itemCount = order.items.reduce((sum, i) => sum + i.qty, 0);
  const subtotal = orderSubtotalQ(order);
  const shipping = orderShippingQ(order);
  const statusChanged = statusDraft !== order.status;

  return (
    <div className="container-app py-10">
      <Link
        href="/app/admin/pedidos"
        className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-brand-forest hover:opacity-70"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver a pedidos
      </Link>

      <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <span className="eyebrow inline-flex items-center gap-2">
            <Shield className="h-3.5 w-3.5" />
            Admin · Detalle
          </span>
          <h1 className="mt-2 font-serif text-3xl text-brand-forest sm:text-4xl">
            Pedido {order.id}
          </h1>
          <p className="mt-2 text-sm text-brand-carbon/55">
            Creado el {formatOrderDate(order.createdAt)}
            {order.updatedAt !== order.createdAt &&
              ` · Actualizado el ${formatOrderDate(order.updatedAt)}`}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold",
              orderStatusBadgeClass(order.status)
            )}
          >
            <Check className="h-3.5 w-3.5" />
            {formatOrderStatus(order.status)}
          </span>
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded-xl2 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-xl2 border border-brand-beige bg-white p-6 shadow-soft">
          <h2 className="font-semibold text-brand-forest">Resumen</h2>
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between text-brand-carbon/70">
              <dt>Artículos ({itemCount})</dt>
              <dd>{formatQ(subtotal)}</dd>
            </div>
            <div className="flex justify-between text-brand-carbon/70">
              <dt>Envío</dt>
              <dd>{shipping > 0 ? formatQ(shipping) : "Gratis"}</dd>
            </div>
            <div className="mt-2 flex justify-between border-t border-brand-beige pt-3 text-base font-semibold text-brand-forest">
              <dt>Total</dt>
              <dd className="font-serif text-xl">{formatQ(order.totalQ)}</dd>
            </div>
          </dl>
        </div>

        <div className="rounded-xl2 border border-brand-beige bg-white p-6 shadow-soft">
          <h2 className="font-semibold text-brand-forest">Cliente</h2>
          <dl className="mt-4 space-y-4 text-sm">
            <div className="flex items-start gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-sage text-brand-forest">
                <User className="h-4 w-4" />
              </span>
              <div>
                <dt className="text-xs uppercase tracking-wide text-brand-carbon/45">
                  Nombre
                </dt>
                <dd className="text-brand-carbon/80">
                  {order.customerName ?? "—"}
                </dd>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-sage text-brand-forest">
                <Mail className="h-4 w-4" />
              </span>
              <div className="min-w-0">
                <dt className="text-xs uppercase tracking-wide text-brand-carbon/45">
                  Email
                </dt>
                <dd className="break-all text-brand-carbon/80">
                  {order.customerEmail ?? "—"}
                </dd>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-sage text-brand-forest">
                <MapPin className="h-4 w-4" />
              </span>
              <div>
                <dt className="text-xs uppercase tracking-wide text-brand-carbon/45">
                  Dirección
                </dt>
                <dd className="leading-relaxed text-brand-carbon/80">
                  {order.customerAddress ?? "Sin dirección registrada"}
                </dd>
              </div>
            </div>
          </dl>
        </div>

        <div className="rounded-xl2 border border-brand-beige bg-white p-6 shadow-soft">
          <h2 className="font-semibold text-brand-forest">Pago y sistema</h2>
          <dl className="mt-4 space-y-4 text-sm">
            <div className="flex items-start gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-sage text-brand-forest">
                <CreditCard className="h-4 w-4" />
              </span>
              <div>
                <dt className="text-xs uppercase tracking-wide text-brand-carbon/45">
                  Método de pago
                </dt>
                <dd className="capitalize text-brand-carbon/80">
                  {order.paymentMethod}
                  {order.paymentProvider
                    ? ` · ${order.paymentProvider}`
                    : ""}
                </dd>
              </div>
            </div>
            {order.checkoutId && (
              <div>
                <dt className="text-xs uppercase tracking-wide text-brand-carbon/45">
                  Referencia de pago
                </dt>
                <dd className="break-all font-mono text-xs text-brand-carbon/70">
                  {order.checkoutId}
                </dd>
              </div>
            )}
            <div>
              <dt className="text-xs uppercase tracking-wide text-brand-carbon/45">
                ID interno
              </dt>
              <dd className="break-all font-mono text-xs text-brand-carbon/70">
                {order.dbId}
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-brand-carbon/45">
                Sesión
              </dt>
              <dd className="break-all font-mono text-xs text-brand-carbon/70">
                {order.sessionId}
              </dd>
              {order.sessionId.startsWith("user:") && (
                <Link
                  href={`/app/admin/usuarios/${encodeURIComponent(order.sessionId.slice(5))}`}
                  className="mt-2 inline-block text-xs font-semibold text-brand-forest hover:underline"
                >
                  Ver perfil del cliente
                </Link>
              )}
            </div>
            <div className="flex items-start gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-sage text-brand-forest">
                <Truck className="h-4 w-4" />
              </span>
              <div>
                <dt className="text-xs uppercase tracking-wide text-brand-carbon/45">
                  Entrega estimada
                </dt>
                <dd className="text-brand-carbon/80">
                  {formatDeliveryDate(order.createdAt)}
                </dd>
              </div>
            </div>
          </dl>
        </div>
      </div>

      <div className="mt-6 rounded-xl2 border border-brand-beige bg-white p-6 shadow-soft">
        <h2 className="font-semibold text-brand-forest">Estado del pedido</h2>
        <p className="mt-1 text-sm text-brand-carbon/55">
          Los pedidos nuevos quedan en proceso. Al guardar un cambio de estado se
          notifica por correo al cliente y al admin (entregado, cancelado, etc.).
        </p>
        <div className="mt-4 flex flex-wrap items-end gap-3">
          <div>
            <label
              htmlFor="order-status"
              className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-brand-carbon/45"
            >
              Estado
            </label>
            <select
              id="order-status"
              value={statusDraft}
              onChange={(e) =>
                setStatusDraft(e.target.value as Order["status"])
              }
              className="rounded-xl border border-brand-beige bg-white px-3 py-2.5 text-sm text-brand-carbon outline-none ring-brand-forest/20 focus:ring-2"
            >
              {STATUS_OPTIONS.map((status) => (
                <option key={status} value={status}>
                  {formatOrderStatus(status)}
                </option>
              ))}
            </select>
          </div>
          <button
            type="button"
            onClick={() => void handleStatusSave()}
            disabled={!statusChanged || saving}
            className="inline-flex items-center gap-2 rounded-full bg-brand-forest px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-40"
          >
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            Guardar estado
          </button>
        </div>
      </div>

      <h2 className="mb-4 mt-8 font-serif text-xl text-brand-forest">
        Artículos del pedido
      </h2>
      <div className="space-y-4">
        {order.items.map((item) => (
          <OrderItemCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}

function OrderItemCard({ item }: { item: OrderItem }) {
  const kindLabel = item.kind ? KIND_LABELS[item.kind] : undefined;
  const hasPieces = item.components && item.components.length > 0;

  return (
    <article className="overflow-hidden rounded-xl2 border border-brand-beige bg-white shadow-soft">
      <div className="flex gap-4 p-4 sm:p-5">
        <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-xl bg-brand-cream">
          <Image
            src={item.image || PLACEHOLDER_IMAGE}
            alt={item.name}
            fill
            sizes="112px"
            className="object-cover"
          />
        </div>
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              {kindLabel && (
                <span className="inline-flex items-center gap-1 rounded-full bg-brand-sage px-2 py-0.5 text-[10px] font-semibold text-brand-forest">
                  {(item.kind === "creacion" || item.kind === "propuesta") && (
                    <Layers className="h-2.5 w-2.5" />
                  )}
                  {kindLabel}
                </span>
              )}
              <h3 className="mt-1 truncate font-semibold text-brand-forest">
                {item.name}
              </h3>
              {item.subtitle && (
                <p className="truncate text-xs text-brand-carbon/55">
                  {item.subtitle}
                </p>
              )}
            </div>
            <div className="shrink-0 text-right">
              <p className="font-semibold text-brand-forest">
                {formatQ(item.priceQ * item.qty)}
              </p>
              <p className="text-xs text-brand-carbon/50">
                {formatQ(item.priceQ)} × {item.qty}
              </p>
            </div>
          </div>
        </div>
      </div>

      {hasPieces && (
        <div className="border-t border-brand-beige/60 bg-brand-cream/30 px-4 py-4 sm:px-5">
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-wide text-brand-carbon/50">
            Piezas incluidas
          </p>
          <ul className="space-y-3">
            {item.components!.map((piece, idx) => (
              <PieceRow key={idx} piece={piece} />
            ))}
          </ul>
        </div>
      )}
    </article>
  );
}

function PieceRow({ piece }: { piece: CreationComponent }) {
  return (
    <li className="flex items-center gap-3">
      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-brand-beige/60 bg-white">
        {piece.image ? (
          <Image
            src={piece.image}
            alt={piece.name}
            fill
            sizes="56px"
            className="object-contain"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-brand-carbon/30">
            <Leaf className="h-5 w-5" />
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-brand-carbon/45">
          {piece.label}
        </p>
        <p className="truncate text-sm font-medium text-brand-carbon">
          {piece.name}
        </p>
      </div>
      <span className="shrink-0 text-sm font-medium text-brand-carbon">
        {piece.priceQ > 0 ? formatQ(piece.priceQ) : "Incluido"}
      </span>
    </li>
  );
}
