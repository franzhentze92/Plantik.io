"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BookMarked, Package, ShoppingBag } from "lucide-react";
import { formatQ } from "@/lib/utils";
import { getAccountOwnerId } from "@/lib/session";
import {
  getProposalsBySessionId,
  type Proposal,
} from "@/lib/supabase/proposals";
import { getOrdersBySessionId } from "@/lib/supabase/orders";
import {
  useCreationsStore,
  useSavedStore,
  type Order,
  type SavedPlant,
} from "@/lib/store";

const PLACEHOLDER = "/images/plant-placeholder.svg";

const statusLabel: Record<string, string> = {
  draft: "Borrador",
  completed: "Lista",
};

interface PurchasedItem {
  key: string;
  orderId: string;
  name: string;
  image: string;
  priceQ: number;
  qty: number;
}

interface RecentProposal {
  key: string;
  href: string;
  image: string;
  title: string;
  subtitle: string;
  priceQ: number;
  date: string;
  badge: string;
}

function savedHref(item: SavedPlant): string {
  return (
    item.href ??
    (item.kind === "planter"
      ? `/app/macetas/${item.id}`
      : item.kind === "accesorio"
        ? `/app/accesorios/${item.id}`
        : `/app/plantas/${item.id}`)
  );
}

export function DashboardActivity() {
  const [mounted, setMounted] = useState(false);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingProposals, setLoadingProposals] = useState(true);
  const savedItems = useSavedStore((s) => s.saved);
  const creations = useCreationsStore((s) => s.creations);

  useEffect(() => {
    setMounted(true);
    let active = true;
    getAccountOwnerId()
      .then(async (ownerId) => {
        const [proposalData, orderData] = await Promise.all([
          getProposalsBySessionId(ownerId),
          getOrdersBySessionId(ownerId),
        ]);
        if (!active) return;
        setProposals(proposalData);
        setOrders(orderData);
      })
      .catch((err) => console.error("Error loading dashboard activity:", err))
      .finally(() => {
        if (active) setLoadingProposals(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const recentProposals: RecentProposal[] = useMemo(() => {
    if (!mounted) return [];
    const fromProposals: RecentProposal[] = proposals.map((p) => ({
      key: `prop-${p.id}`,
      href: `/app/propuestas/${p.id}`,
      image: p.generated_image_url || PLACEHOLDER,
      title: p.name || "Propuesta",
      subtitle: `${p.items.length} planta${p.items.length !== 1 ? "s" : ""}`,
      priceQ: p.total_price_q || 0,
      date: p.created_at,
      badge: statusLabel[p.status] || p.status,
    }));
    const fromCreations: RecentProposal[] = creations.map((c) => ({
      key: `crea-${c.id}`,
      href: `/app/creaciones/${c.id}`,
      image: c.image || PLACEHOLDER,
      title: c.name,
      subtitle: "Creación propia",
      priceQ: c.totalQ,
      date: c.createdAt,
      badge: "Creación",
    }));
    const fromSaved: RecentProposal[] = savedItems.map((s) => ({
      key: `saved-${s.id}`,
      href: savedHref(s),
      image: s.image || PLACEHOLDER,
      title: s.name,
      subtitle: s.scientificName || s.subtitle || "Producto guardado",
      priceQ: s.priceQ,
      date: s.savedAt,
      badge: "Guardado",
    }));
    return [...fromProposals, ...fromCreations, ...fromSaved]
      .sort((a, b) => +new Date(b.date) - +new Date(a.date))
      .slice(0, 5);
  }, [mounted, proposals, creations, savedItems]);

  const recentPurchases: PurchasedItem[] = mounted
    ? orders
        .flatMap((order) =>
          order.items.map((item) => ({
            key: `${order.id}-${item.id}`,
            orderId: order.id,
            name: item.name,
            image: item.image || PLACEHOLDER,
            priceQ: item.priceQ,
            qty: item.qty,
          }))
        )
        .slice(0, 5)
    : [];

  return (
    <section className="container-app pt-10 sm:pt-14">
      <div className="grid gap-5 sm:gap-6 lg:grid-cols-2">
        {/* Últimas propuestas */}
        <div className="card-surface flex flex-col p-5 sm:p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-sage text-brand-forest">
                <BookMarked className="h-4 w-4" />
              </span>
              <h2 className="font-serif text-xl text-brand-forest">
                Últimas propuestas
              </h2>
            </div>
            <Link
              href="/app/propuestas"
              className="inline-flex items-center gap-1 text-xs font-semibold text-brand-forest hover:opacity-70"
            >
              Ver todas
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="mt-5 flex-1">
            {!mounted || loadingProposals ? (
              <ListSkeleton />
            ) : recentProposals.length === 0 ? (
              <EmptyBlock
                message="Aún no tienes propuestas guardadas."
                ctaLabel="Diseñar mi espacio"
                ctaHref="/app/disena-tu-espacio"
              />
            ) : (
              <ul className="space-y-3">
                {recentProposals.map((proposal) => (
                  <li key={proposal.key}>
                    <Link
                      href={proposal.href}
                      className="group flex items-center gap-3 rounded-xl2 border border-brand-beige/60 bg-white p-2.5 transition-colors hover:border-brand-forest/30"
                    >
                      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-white">
                        <Image
                          src={proposal.image}
                          alt={proposal.title}
                          fill
                          sizes="56px"
                          className="object-contain p-1"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="truncate text-sm font-semibold text-brand-carbon">
                            {proposal.title}
                          </p>
                          <span className="shrink-0 rounded-full bg-brand-sage px-2 py-0.5 text-[10px] font-semibold text-brand-forest">
                            {proposal.badge}
                          </span>
                        </div>
                        <p className="mt-0.5 text-xs text-brand-carbon/50">
                          {new Date(proposal.date).toLocaleDateString("es-GT")} ·{" "}
                          {proposal.subtitle}
                        </p>
                      </div>
                      <span className="shrink-0 text-sm font-semibold text-brand-forest">
                        {formatQ(proposal.priceQ)}
                      </span>
                      <ArrowRight className="h-4 w-4 shrink-0 text-brand-carbon/30 transition-transform group-hover:translate-x-0.5 group-hover:text-brand-forest" />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Últimos artículos comprados */}
        <div className="card-surface flex flex-col p-5 sm:p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-sage text-brand-forest">
                <ShoppingBag className="h-4 w-4" />
              </span>
              <h2 className="font-serif text-xl text-brand-forest">
                Últimas compras
              </h2>
            </div>
            <Link
              href="/app/pedidos"
              className="inline-flex items-center gap-1 text-xs font-semibold text-brand-forest hover:opacity-70"
            >
              Ver pedidos
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="mt-5 flex-1">
            {!mounted ? (
              <ListSkeleton />
            ) : recentPurchases.length === 0 ? (
              <EmptyBlock
                message="Todavía no has comprado nada."
                ctaLabel="Explorar catálogo"
                ctaHref="/app/plantas"
              />
            ) : (
              <ul className="space-y-3">
                {recentPurchases.map((item) => (
                  <li
                    key={item.key}
                    className="flex items-center gap-3 rounded-xl2 border border-brand-beige/60 bg-white p-2.5"
                  >
                    <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-white">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        sizes="56px"
                        className="object-contain p-1"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-brand-carbon">
                        {item.name}
                        {item.qty > 1 && (
                          <span className="text-brand-carbon/45"> × {item.qty}</span>
                        )}
                      </p>
                      <p className="mt-0.5 text-xs text-brand-carbon/50">
                        {formatQ(item.priceQ * item.qty)}
                      </p>
                    </div>
                    <Link
                      href={`/app/pedidos#order-${item.orderId}`}
                      className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-brand-forest/30 bg-white px-3 py-1.5 text-xs font-semibold text-brand-forest transition-colors hover:bg-brand-sage/60"
                    >
                      <Package className="h-3.5 w-3.5" />
                      Ver orden
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function ListSkeleton() {
  return (
    <ul className="space-y-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <li
          key={i}
          className="h-[76px] animate-pulse rounded-xl2 border border-brand-beige/50 bg-brand-cream/60"
        />
      ))}
    </ul>
  );
}

function EmptyBlock({
  message,
  ctaLabel,
  ctaHref,
}: {
  message: string;
  ctaLabel: string;
  ctaHref: string;
}) {
  return (
    <div className="flex h-full flex-col items-center justify-center rounded-xl2 border border-dashed border-brand-beige bg-brand-cream/40 px-6 py-10 text-center">
      <p className="text-sm text-brand-carbon/60">{message}</p>
      <Link
        href={ctaHref}
        className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-brand-forest px-4 py-2 text-xs font-semibold text-white transition-transform hover:-translate-y-0.5"
      >
        {ctaLabel}
        <ArrowRight className="h-3.5 w-3.5" />
      </Link>
    </div>
  );
}
