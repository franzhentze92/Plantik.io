"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Bell, Camera, Leaf, Sparkles, Sprout } from "lucide-react";
import { useProfileStore } from "@/lib/store";

const COLLAGE = [
  { src: "/images/plants/monstera-deliciosa.png", alt: "Monstera deliciosa" },
  { src: "/images/plants/calathea.png", alt: "Calathea" },
  { src: "/images/plants/pothos-golden.png", alt: "Pothos golden" },
  { src: "/images/plants/sansevieria-laurentii.png", alt: "Sansevieria" },
];

const HIGHLIGHTS = [
  {
    icon: Sparkles,
    title: "Diseño con Plantik",
    subtitle: "Sube una foto de tu espacio",
  },
  {
    icon: Sprout,
    title: "100+ especies",
    subtitle: "Elegidas para cada tipo de luz",
  },
  {
    icon: Bell,
    title: "Cuidado guiado",
    subtitle: "Recordatorios y tips a tu ritmo",
  },
];

function greeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Buenos días";
  if (hour < 19) return "Buenas tardes";
  return "Buenas noches";
}

function ScanCorners() {
  const base = "absolute h-4 w-4 border-white/85";
  return (
    <div className="pointer-events-none absolute inset-2.5">
      <span className={`${base} left-0 top-0 rounded-tl-md border-l-2 border-t-2`} />
      <span className={`${base} right-0 top-0 rounded-tr-md border-r-2 border-t-2`} />
      <span className={`${base} bottom-0 left-0 rounded-bl-md border-b-2 border-l-2`} />
      <span className={`${base} bottom-0 right-0 rounded-br-md border-b-2 border-r-2`} />
    </div>
  );
}

function Reticle({ top, left }: { top: string; left: string }) {
  return (
    <div className="pointer-events-none absolute" style={{ top, left }}>
      <span className="absolute -inset-3 rounded-full border border-brand-terracotta/70 animate-ping-ring" />
      <span className="relative block h-3 w-3 animate-reticle rounded-full bg-brand-terracotta ring-4 ring-white/70" />
    </div>
  );
}

export function DashboardHero() {
  const name = useProfileStore((s) => s.profile.name);
  const firstName = name.trim().split(/\s+/)[0] || "";

  return (
    <section className="container-app pt-6 sm:pt-8 lg:pt-10">
      <div className="grid gap-6 rounded-xl2 border border-brand-beige/70 bg-white p-5 shadow-soft sm:gap-8 sm:p-6 lg:grid-cols-[1.1fr_1fr] lg:items-center lg:p-8">
        <div className="animate-fade-up">
          <span className="eyebrow inline-flex items-center gap-2">
            <Leaf className="h-3.5 w-3.5" />
            {greeting()}
          </span>
          <h1 className="mt-3 font-serif text-2xl leading-[1.15] text-brand-forest sm:text-4xl sm:leading-[1.1]">
            Hola{firstName ? `, ${firstName}` : ""}. ¿Qué le sumamos a tu
            espacio hoy?
          </h1>
          <p className="mt-4 max-w-lg text-sm text-brand-carbon/70 sm:text-base">
            Explora el catálogo y compra directo, o sube una foto y deja que
            Plantik diseñe una propuesta a tu medida.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/app/plantas"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-brand-forest px-6 py-3 text-sm font-semibold text-white shadow-card transition-transform hover:-translate-y-0.5"
            >
              <Leaf className="h-4 w-4" />
              Explorar catálogo
            </Link>
            <Link
              href="/app/disena-tu-espacio"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-brand-forest/30 bg-white px-6 py-3 text-sm font-semibold text-brand-forest transition-colors hover:bg-brand-sage"
            >
              <Camera className="h-4 w-4" />
              Diseñar con una foto
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-8 grid gap-4 border-t border-brand-beige/70 pt-6 sm:grid-cols-3">
            {HIGHLIGHTS.map((item) => (
              <div key={item.title} className="flex items-start gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-sage text-brand-forest">
                  <item.icon className="h-4 w-4" />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-brand-carbon">
                    {item.title}
                  </p>
                  <p className="mt-0.5 text-xs leading-snug text-brand-carbon/55">
                    {item.subtitle}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative">
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            {COLLAGE.map((item, index) => (
              <div
                key={item.src}
                className={`relative aspect-square overflow-hidden rounded-xl2 border border-brand-beige/60 shadow-soft ${
                  index % 2 === 0 ? "" : "translate-y-4 sm:translate-y-6"
                }`}
              >
                <Image
                  src={item.src}
                  alt={item.alt}
                  fill
                  sizes="(max-width: 640px) 45vw, 22vw"
                  className="object-cover"
                />

                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-brand-forest/12 via-transparent to-transparent" />

                {(index === 0 || index === 3) && (
                  <div className="pointer-events-none absolute inset-x-0 animate-scan-line">
                    <div className="h-14 w-full bg-gradient-to-b from-brand-terracotta/25 to-transparent" />
                    <div className="h-px w-full bg-brand-terracotta shadow-[0_0_10px_1px_rgba(183,110,77,0.7)]" />
                  </div>
                )}

                <ScanCorners />
                {index === 0 && <Reticle top="38%" left="46%" />}
                {index === 2 && <Reticle top="44%" left="52%" />}
              </div>
            ))}
          </div>

          <div className="absolute -bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full border border-brand-beige bg-white px-4 py-2 text-xs font-semibold text-brand-forest shadow-card">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping-ring rounded-full bg-brand-forest/60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-brand-forest" />
            </span>
            Analizando tu espacio
          </div>
        </div>
      </div>
    </section>
  );
}
