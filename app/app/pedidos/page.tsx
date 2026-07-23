"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronRight, Leaf, Package, ShoppingBag } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import { track } from "@/lib/analytics";
import { getAccountOwnerId } from "@/lib/session";
import { getOrdersBySessionId } from "@/lib/supabase/orders";
import { formatOrderStatus, orderStatusBadgeClass } from "@/lib/order-display";
import { formatQ } from "@/lib/utils";
import { Order, OrderItem, useOrdersStore } from "@/lib/store";

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

export default function OrdersPage() {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const orders = useOrdersStore((s) => s.orders);
  const setOrders = useOrdersStore((s) => s.setOrders);

  useEffect(() => {
    setMounted(true);
    track("page_view", { route: "/app/pedidos" });

    let active = true;
    getAccountOwnerId()
      .then((ownerId) => getOrdersBySessionId(ownerId))
      .then((data) => {
        if (active) setOrders(data);
      })
      .catch((err) => console.error("Error loading orders:", err))
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [setOrders]);

  if (!mounted || loading) {
    return (
      <div className="container-app py-16">
        <p className="text-brand-carbon/60">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="container-app py-12">
      <span className="eyebrow inline-flex items-center gap-2">
        <Leaf className="h-3.5 w-3.5" />
        Mis pedidos
        <Leaf className="h-3.5 w-3.5" />
      </span>
      <h1 className="mt-3 font-serif text-4xl text-brand-forest sm:text-5xl">
        Historial de compras
      </h1>
      <p className="mt-2 text-sm text-brand-carbon/65">
        {orders.length > 0
          ? `${orders.length} pedido${orders.length !== 1 ? "s" : ""} registrado${
              orders.length !== 1 ? "s" : ""
            }.`
          : "Aquí verás tus compras una vez completes un pago."}
      </p>

      {orders.length === 0 ? (
        <div className="mt-10">
          <EmptyState
            icon={Package}
            title="Aún no tienes pedidos"
            description="Cuando completes una compra en el carrito, aparecerá aquí con su número de confirmación."
            action={
              <Link
                href="/app/plantas"
                className="rounded-full bg-brand-forest px-5 py-2.5 text-sm font-semibold text-white"
              >
                Explorar catálogo
              </Link>
            }
          />
        </div>
      ) : (
        <div className="mt-10 space-y-4">
          {orders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      )}
    </div>
  );
}

function OrderCard({ order }: { order: Order }) {
  const itemCount = order.items.reduce((sum, i) => sum + i.qty, 0);

  return (
    <article
      id={`order-${order.id}`}
      className="card-surface scroll-mt-24 overflow-hidden"
    >
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-brand-beige/60 px-5 py-4 sm:px-6">
        <div>
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-4 w-4 text-brand-forest" />
            <h2 className="text-sm font-semibold text-brand-carbon">
              Pedido {order.id}
            </h2>
          </div>
          <p className="mt-1 text-xs text-brand-carbon/50">
            {formatOrderDate(order.createdAt)}
            {order.customerName ? ` · ${order.customerName}` : ""}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span
            className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${orderStatusBadgeClass(order.status)}`}
          >
            {formatOrderStatus(order.status)}
          </span>
          <span className="text-sm font-semibold text-brand-forest">
            {formatQ(order.totalQ)}
          </span>
        </div>
      </div>

      <ul className="divide-y divide-brand-beige/40 px-5 sm:px-6">
        {order.items.map((item) => (
          <OrderLineItem key={`${order.id}-${item.id}`} item={item} />
        ))}
      </ul>

      <div className="flex flex-wrap items-center justify-between gap-3 bg-brand-cream/40 px-5 py-3 text-xs text-brand-carbon/55 sm:px-6">
        <span>
          {itemCount} artículo{itemCount !== 1 ? "s" : ""}
        </span>
        <div className="flex items-center gap-4">
          {order.customerAddress && (
            <span className="hidden max-w-xs truncate md:inline">
              Entrega: {order.customerAddress}
            </span>
          )}
          {order.customerEmail && (
            <span className="hidden sm:inline">
              Confirmación enviada a {order.customerEmail}
            </span>
          )}
          <Link
            href={`/app/pedidos/${encodeURIComponent(order.id)}`}
            className="inline-flex items-center gap-1.5 rounded-full bg-brand-forest px-4 py-1.5 text-xs font-semibold text-white transition-colors hover:opacity-90"
          >
            Ver detalles
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </article>
  );
}

function OrderLineItem({ item }: { item: OrderItem }) {
  return (
    <li className="flex items-center gap-3 py-3">
      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-brand-cream">
        <Image
          src={item.image || PLACEHOLDER_IMAGE}
          alt={item.name}
          fill
          className="object-cover"
        />
      </div>
      <div className="flex min-w-0 flex-1 items-center justify-between gap-3 text-sm">
        <span className="truncate text-brand-carbon/80">
          {item.name}
          <span className="text-brand-carbon/45"> × {item.qty}</span>
        </span>
        <span className="shrink-0 font-medium text-brand-carbon">
          {formatQ(item.priceQ * item.qty)}
        </span>
      </div>
    </li>
  );
}
