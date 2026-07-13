"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  Bookmark,
  Layers,
  Package,
  ShoppingCart,
} from "lucide-react";
import {
  useCartStore,
  useSavedStore,
  useOrdersStore,
  useCreationsStore,
} from "@/lib/store";

export function DashboardStats() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const cartCount = useCartStore((s) =>
    s.items.reduce((sum, item) => sum + item.qty, 0)
  );
  const savedCount = useSavedStore((s) => s.saved.length);
  const creationsCount = useCreationsStore((s) => s.creations.length);
  const ordersCount = useOrdersStore((s) => s.orders.length);

  const stats = [
    {
      label: "En tu carrito",
      value: cartCount,
      empty: "Sin productos aún",
      href: "/app/carrito",
      icon: ShoppingCart,
    },
    {
      label: "Guardados",
      value: savedCount,
      empty: "Nada guardado",
      href: "/app/propuestas",
      icon: Bookmark,
    },
    {
      label: "Mis creaciones",
      value: creationsCount,
      empty: "Aún sin armar",
      href: "/app/propuestas",
      icon: Layers,
    },
    {
      label: "Mis pedidos",
      value: ordersCount,
      empty: "Sin pedidos",
      href: "/app/pedidos",
      icon: Package,
    },
  ];

  return (
    <section className="container-app pt-6">
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {stats.map((stat) => {
          const count = mounted ? stat.value : 0;
          return (
            <Link
              key={stat.label}
              href={stat.href}
              className="card-surface group flex flex-col justify-between p-4 sm:p-5"
            >
              <div className="flex items-center justify-between">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-sage text-brand-forest">
                  <stat.icon className="h-4 w-4" />
                </span>
                <ArrowRight className="h-4 w-4 text-brand-carbon/30 transition-transform group-hover:translate-x-0.5 group-hover:text-brand-forest" />
              </div>
              <div className="mt-4">
                <p className="font-serif text-2xl text-brand-forest">{count}</p>
                <p className="text-xs font-medium text-brand-carbon/70">
                  {stat.label}
                </p>
                {count === 0 && (
                  <p className="mt-0.5 text-[11px] text-brand-carbon/45">
                    {stat.empty}
                  </p>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
