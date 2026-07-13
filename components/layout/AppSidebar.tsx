"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { ArrowRight, Leaf, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCartStore, useSavedStore } from "@/lib/store";
import { navItems } from "./nav-items";

export function AppSidebar() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const savedCount = useSavedStore((s) => s.saved.length);
  const cartCount = useCartStore((s) =>
    s.items.reduce((sum, i) => sum + i.qty, 0)
  );

  useEffect(() => setMounted(true), []);

  return (
    <aside className="group sticky top-0 z-30 hidden h-screen w-20 shrink-0 overflow-hidden border-r border-brand-beige/70 bg-brand-cream text-brand-carbon transition-[width] duration-300 ease-out lg:flex lg:flex-col hover:w-[17.5rem]">
      <div className="flex h-full w-full flex-col overflow-hidden">
        <Leaf className="pointer-events-none absolute -left-10 bottom-20 h-48 w-48 rotate-12 text-brand-moss/[0.06]" />
        <Leaf className="pointer-events-none absolute -right-8 top-1/3 h-32 w-32 -rotate-12 text-brand-moss/[0.05]" />
        <div className="pointer-events-none absolute -top-12 right-0 h-48 w-48 rounded-full bg-brand-sage/60 blur-3xl" />

        {/* Inner content is fixed at the expanded width and clipped by the rail */}
        <div className="relative flex h-full w-[17.5rem] flex-col">
          <Link href="/app" className="relative flex items-center gap-3 px-5 py-7">
            <span className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl2 bg-brand-forest">
              <Leaf className="relative h-5 w-5 text-white" />
            </span>
            <span className="min-w-0 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
              <Image
                src="/plantik-no-background.png"
                alt="Plantik"
                width={548}
                height={83}
                className="h-6 w-auto"
              />
              <span className="mt-1.5 block whitespace-nowrap text-[11px] text-brand-carbon/50">
                Plantas. Diseño. Bienestar.
              </span>
            </span>
          </Link>

          <nav className="relative flex flex-1 flex-col gap-0.5 px-3 py-2">
            {navItems.map((item) => {
              const active =
                item.href === "/app"
                  ? pathname === "/app"
                  : pathname.startsWith(item.href);
              const Icon = item.icon;
              const badge =
                mounted && item.href === "/app/propuestas" && savedCount > 0
                  ? savedCount
                  : mounted && item.href === "/app/carrito" && cartCount > 0
                    ? cartCount
                    : null;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={item.label}
                  className={cn(
                    "relative flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all",
                    active
                      ? "bg-brand-sage text-brand-forest"
                      : "text-brand-carbon/65 hover:bg-brand-sage/50 hover:text-brand-forest"
                  )}
                >
                  {active && (
                    <span className="absolute -right-3 top-1/2 h-9 w-1 -translate-y-1/2 rounded-l-full bg-brand-forest" />
                  )}
                  <span className="relative flex h-5 w-5 shrink-0 items-center justify-center">
                    <Icon className={cn("h-4 w-4", active && "text-brand-forest")} />
                    {badge !== null && (
                      <span className="absolute -right-1.5 -top-1.5 h-2 w-2 rounded-full bg-brand-forest transition-opacity duration-200 group-hover:opacity-0" />
                    )}
                  </span>
                  <span className="whitespace-nowrap opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                    {item.label}
                  </span>
                  {badge !== null && (
                    <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-forest px-1.5 text-[10px] font-bold text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                      {badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="relative mx-3 mb-6 overflow-hidden rounded-xl2 border border-brand-beige/70 bg-white p-4 opacity-0 shadow-soft transition-opacity duration-200 group-hover:opacity-100">
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-brand-sage/40 to-transparent" />
            <Sparkles className="absolute right-3 top-3 h-4 w-4 text-brand-moss" />
            <p className="relative text-xs font-semibold text-brand-forest">
              ¿Primera vez en Plantik?
            </p>
            <p className="relative mt-1.5 text-[11px] leading-relaxed text-brand-carbon/60">
              Sube una foto de tu espacio y recibe una propuesta en segundos.
            </p>
            <Link
              href="/app/disena-tu-espacio"
              className="relative mt-3 inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-brand-forest px-3.5 py-1.5 text-xs font-semibold text-white transition-transform hover:-translate-y-0.5"
            >
              Diseñar mi espacio
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </aside>
  );
}
