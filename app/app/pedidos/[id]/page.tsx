"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Check,
  Layers,
  Leaf,
  Mail,
  MapPin,
  Package,
  ShoppingBag,
  Truck,
} from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import { track } from "@/lib/analytics";
import {
  formatDeliveryDate,
  formatOrderStatus,
  orderShippingQ,
  orderStatusBadgeClass,
  orderSubtotalQ,
} from "@/lib/order-display";
import { getAccountOwnerId } from "@/lib/session";
import { getOrderByNumber } from "@/lib/supabase/orders";
import { formatQ } from "@/lib/utils";
import { CreationComponent, Order, OrderItem } from "@/lib/store";

const PLACEHOLDER_IMAGE = "/images/plant-placeholder.svg";

function formatOrderDate(iso: string) {
  return new Date(iso).toLocaleDateString("es-GT", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const KIND_LABELS: Record<string, string> = {
  plant: "Planta",
  planter: "Maceta",
  accesorio: "Accesorio",
  creacion: "Creación",
  propuesta: "Propuesta",
};

export default function OrderDetailPage() {
  const params = useParams();
  const orderId = decodeURIComponent(String(params?.id ?? ""));
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    setMounted(true);
    track("page_view", { route: "/app/pedidos/[id]" });

    let active = true;
    getAccountOwnerId()
      .then((ownerId) => getOrderByNumber(ownerId, orderId))
      .then((data) => {
        if (active) setOrder(data);
      })
      .catch((err) => console.error("Error loading order:", err))
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [orderId]);

  if (!mounted || loading) {
    return (
      <div className="container-app py-16">
        <p className="text-brand-carbon/60">Cargando...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container-app py-16">
        <EmptyState
          icon={Package}
          title="No encontramos este pedido"
          description="Es posible que el enlace no sea válido o que el pedido ya no esté disponible."
          action={
            <Link
              href="/app/pedidos"
              className="rounded-full bg-brand-forest px-5 py-2.5 text-sm font-semibold text-white"
            >
              Ver mis pedidos
            </Link>
          }
        />
      </div>
    );
  }

  const itemCount = order.items.reduce((sum, i) => sum + i.qty, 0);
  const subtotal = orderSubtotalQ(order);
  const shipping = orderShippingQ(order);
  const hasCustomerDetails =
    order.customerName || order.customerEmail || order.customerAddress;

  return (
    <div className="container-app py-10">
      <Link
        href="/app/pedidos"
        className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-brand-forest hover:opacity-70"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver a mis pedidos
      </Link>

      <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="eyebrow inline-flex items-center gap-2">
            <Leaf className="h-3.5 w-3.5" />
            Detalle del pedido
          </span>
          <h1 className="mt-2 flex items-center gap-2 font-serif text-3xl text-brand-forest sm:text-4xl">
            <ShoppingBag className="h-6 w-6" />
            Pedido {order.id}
          </h1>
          <p className="mt-2 text-sm text-brand-carbon/55">
            {formatOrderDate(order.createdAt)}
            {order.customerName ? ` · ${order.customerName}` : ""}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span
            className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${orderStatusBadgeClass(order.status)}`}
          >
            {order.status === "entregado" && <Check className="h-3.5 w-3.5" />}
            {formatOrderStatus(order.status)}
          </span>
        </div>
      </div>

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
          <h2 className="font-semibold text-brand-forest">Entrega</h2>
          <div className="mt-4 space-y-4">
            <div className="flex items-start gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-sage text-brand-forest">
                <Truck className="h-4 w-4" />
              </span>
              <div>
                <p className="text-xs uppercase tracking-wide text-brand-carbon/45">
                  Entrega estimada
                </p>
                <p className="text-sm font-semibold text-brand-carbon">Mañana</p>
                <p className="text-xs text-brand-carbon/55">
                  {formatDeliveryDate(order.createdAt)}
                </p>
              </div>
            </div>
            {order.customerAddress ? (
              <div className="flex items-start gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-sage text-brand-forest">
                  <MapPin className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-xs uppercase tracking-wide text-brand-carbon/45">
                    Dirección de entrega
                  </p>
                  <p className="text-sm leading-relaxed text-brand-carbon/80">
                    {order.customerAddress}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-brand-carbon/55">
                No hay dirección registrada para este pedido.
              </p>
            )}
          </div>
        </div>

        {hasCustomerDetails && (
          <div className="rounded-xl2 border border-brand-beige bg-white p-6 shadow-soft">
            <h2 className="font-semibold text-brand-forest">
              Datos de la compra
            </h2>
            <dl className="mt-4 space-y-4 text-sm">
              {order.customerName && (
                <div>
                  <dt className="text-xs uppercase tracking-wide text-brand-carbon/45">
                    Cliente
                  </dt>
                  <dd className="text-brand-carbon/80">{order.customerName}</dd>
                </div>
              )}
              {order.customerEmail && (
                <div className="flex items-start gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-sage text-brand-forest">
                    <Mail className="h-4 w-4" />
                  </span>
                  <div className="min-w-0">
                    <dt className="text-xs uppercase tracking-wide text-brand-carbon/45">
                      Confirmación enviada a
                    </dt>
                    <dd className="break-all text-brand-carbon/80">
                      {order.customerEmail}
                    </dd>
                  </div>
                </div>
              )}
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
            </dl>
          </div>
        )}
      </div>

      {/* Artículos a todo el ancho */}
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
        {piece.description && (
          <p className="truncate text-xs text-brand-carbon/55">
            {piece.description}
          </p>
        )}
      </div>
      <span className="shrink-0 text-sm font-medium text-brand-carbon">
        {piece.priceQ > 0 ? formatQ(piece.priceQ) : "Incluido"}
      </span>
    </li>
  );
}
