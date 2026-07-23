import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  ArrowUpRight,
  Camera,
  CircleDashed,
  Layers,
  Leaf,
  PawPrint,
  Shapes,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Sprout,
  Star,
  Sun,
  Truck,
  type LucideIcon,
} from "lucide-react";
import { MarketingPlantCard } from "@/components/marketing/MarketingPlantCard";
import { MarketingPlanterCard } from "@/components/marketing/MarketingPlanterCard";
import { MarketingAccessoryCard } from "@/components/marketing/MarketingAccessoryCard";
import { testimonials } from "@/data/testimonials";
import {
  getPlantsFromDB,
  getPlantersFromDB,
  getAccessoriesFromDB,
} from "@/lib/supabase-queries";

export const revalidate = 3600;

const HERO_COLLAGE = [
  { src: "/images/plants/monstera-deliciosa.png", alt: "Monstera deliciosa" },
  { src: "/images/plants/calathea.png", alt: "Calathea" },
  { src: "/images/plants/pothos-golden.png", alt: "Pothos golden" },
  { src: "/images/plants/sansevieria-laurentii.png", alt: "Sansevieria" },
];

function HeroCollage({ className = "" }: { className?: string }) {
  return (
    <div className={`relative ${className}`}>
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        {HERO_COLLAGE.map((item, index) => (
          <div
            key={item.src}
            className={`relative aspect-square overflow-hidden rounded-xl2 border border-brand-beige/60 shadow-card ${
              index % 2 === 0 ? "" : "translate-y-6 sm:translate-y-8"
            }`}
          >
            <Image
              src={item.src}
              alt={item.alt}
              fill
              sizes="(min-width: 1024px) 25vw, 45vw"
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

      {/* Floating analysis annotations */}
      <AnalysisChip
        className="-left-3 top-12"
        icon={Sun}
        title="Luz media detectada"
        subtitle="Encaja en esta pared"
        delay="0s"
      />
      <AnalysisChip
        className="-right-3 bottom-24"
        icon={Sparkles}
        title="Recomendado para ti"
        subtitle="Pothos + maceta de barro"
        delay="1.4s"
      />

      {/* Live scan status */}
      <div className="absolute -bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full border border-brand-beige bg-white px-4 py-2 text-xs font-semibold text-brand-forest shadow-card">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping-ring rounded-full bg-brand-forest/60" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-brand-forest" />
        </span>
        Analizando tu espacio
      </div>
    </div>
  );
}

const perks = [
  { icon: Truck, title: "Entrega a domicilio", desc: "En toda la ciudad de Guatemala." },
  { icon: Sun, title: "Elegidas por su luz", desc: "Sabrás si encaja antes de comprar." },
  { icon: PawPrint, title: "Opciones pet friendly", desc: "Seguras para tus mascotas." },
  { icon: ShieldCheck, title: "Compra con cuenta", desc: "Guarda favoritos y pedidos." },
];

const steps = [
  { n: "01", title: "Sube una foto", desc: "O elige una planta directamente del catálogo." },
  { n: "02", title: "Recibe tu propuesta", desc: "Luz, estilo y espacio analizados al instante." },
  { n: "03", title: "Personaliza", desc: "Cambia planta, maceta o accesorios a tu gusto." },
  { n: "04", title: "Recíbela lista", desc: "Entrega, trasplante o instalación." },
];

function initials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

export default async function MarketingHomePage() {
  const [plants, planters, accessories] = await Promise.all([
    getPlantsFromDB(),
    getPlantersFromDB(),
    getAccessoriesFromDB(),
  ]);

  const totalProducts = plants.length + planters.length + accessories.length;
  const featuredPlants = plants.slice(0, 4);
  const featuredPlanters = planters.slice(0, 3);
  const featuredAccessories = accessories.slice(0, 4);

  const platoImage = accessories.find(
    (a) => a.category === "plato" && a.image
  )?.image;
  const mulchImage = accessories.find(
    (a) => a.category === "mulch" && a.image
  )?.image;

  const categories = [
    {
      label: "Plantas",
      description: "Interior, exterior y pet friendly",
      href: "/productos?tab=plantas",
      image:
        "https://gt.epaenlinea.com/media/catalog/product/cache/200d1c1e4e9e1e0b76530de77567e779/8/e/8ed1b49e-7699-4f88-9e67-338147004601.jpg",
      icon: Sprout,
    },
    {
      label: "Macetas",
      description: "Por material, color y tamaño",
      href: "/productos?tab=macetas",
      image:
        "https://gt.epaenlinea.com/media/catalog/product/cache/200d1c1e4e9e1e0b76530de77567e779/0/0/00c794f8-a0ab-43dc-b753-1d7dd6abcb38.jpg",
      icon: Shapes,
    },
    {
      label: "Platos",
      description: "El complemento ideal para tu maceta",
      href: "/productos?tab=platos",
      image: platoImage,
      icon: CircleDashed,
    },
    {
      label: "Sustratos",
      description: "La tierra ideal para cada especie",
      href: "/productos?tab=sustratos",
      image:
        "https://gt.epaenlinea.com/media/catalog/product/cache/200d1c1e4e9e1e0b76530de77567e779/a/f/af8403bd-2ece-479f-8c9c-6a60f4e8ee99.jpg",
      icon: Layers,
    },
    {
      label: "Cubiertas",
      description: "Decora y protege tu maceta",
      href: "/productos?tab=mulch",
      image: mulchImage,
      icon: Leaf,
    },
  ];

  return (
    <div className="bg-brand-cream text-brand-carbon">
      {/* HERO */}
      <section className="relative overflow-hidden border-b border-brand-beige/60 bg-gradient-to-br from-brand-sage/60 via-brand-cream to-brand-cream">
        <Leaf className="pointer-events-none absolute -left-10 top-10 h-48 w-48 rotate-12 text-brand-moss/10" />
        <Leaf className="pointer-events-none absolute bottom-0 left-1/3 h-40 w-40 -rotate-12 text-brand-moss/10" />

        <div className="flex w-full flex-col gap-10 px-4 py-10 sm:px-6 lg:flex-row lg:items-center lg:justify-center lg:gap-20 lg:px-10 lg:py-14 xl:px-12">
          <div className="w-full lg:max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-brand-forest/15 bg-white/70 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-brand-forest shadow-soft backdrop-blur">
              <Sprout className="h-3.5 w-3.5" />
              La planta correcta para cada rincón
            </span>
            <h1 className="mt-6 font-serif text-5xl leading-[1.05] text-brand-forest sm:text-6xl lg:text-7xl">
              Dale vida a tu espacio
            </h1>

            {/* Mobile-only collage, between title and subtitle */}
            <HeroCollage className="mx-auto mt-8 w-full max-w-xs sm:max-w-sm lg:hidden" />

            <p className="mt-6 max-w-2xl text-base leading-relaxed text-brand-carbon/70 sm:text-lg">
              Plantas, macetas, sustratos y accesorios elegidos para tu hogar u
              oficina. Compra directo del catálogo, o deja que Plantik te proponga
              la combinación perfecta a partir de una foto.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/productos"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-brand-forest px-7 py-4 text-sm font-semibold text-white shadow-card transition-transform hover:-translate-y-0.5"
              >
                <ShoppingBag className="h-4 w-4" />
                Explorar catálogo
              </Link>
              <Link
                href="/como-funciona"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-brand-forest/30 bg-white px-7 py-4 text-sm font-semibold text-brand-forest transition-colors hover:bg-brand-sage/60"
              >
                <Camera className="h-4 w-4" />
                Diseñar con una foto
              </Link>
            </div>

            <div className="mt-8 flex flex-wrap justify-center gap-x-10 gap-y-4 border-t border-brand-beige/60 pt-6 lg:justify-start">
              <HeroStat value={`${plants.length}+`} label="especies" />
              <HeroStat value={`${totalProducts}`} label="productos" />
              <HeroStat value="24h" label="soporte" />
            </div>
          </div>

          {/* Desktop-only collage on the right column */}
          <HeroCollage className="hidden w-full max-w-md shrink-0 lg:block" />
        </div>
      </section>

      <div className="w-full px-4 py-16 sm:px-6 lg:px-10 xl:px-12">
        {/* Perks */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {perks.map((perk) => (
            <div
              key={perk.title}
              className="flex items-center gap-3 rounded-xl2 border border-brand-beige/70 bg-white p-4 shadow-soft"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-sage text-brand-forest">
                <perk.icon className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-semibold text-brand-carbon">
                  {perk.title}
                </p>
                <p className="text-xs text-brand-carbon/55">{perk.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Shop by category */}
        <div className="mt-20">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <span className="eyebrow">Compra por categoría</span>
              <h2 className="mt-3 font-serif text-3xl text-brand-forest sm:text-4xl">
                Todo para tu planta, en un solo lugar
              </h2>
            </div>
            <Link
              href="/productos"
              className="inline-flex items-center gap-1 text-sm font-semibold text-brand-forest hover:opacity-70"
            >
              Ver todo el catálogo
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {categories.map((cat) => (
              <Link
                key={cat.label}
                href={cat.href}
                className="group flex h-64 flex-col overflow-hidden rounded-xl2 border border-brand-beige/70 bg-white shadow-soft transition-shadow hover:shadow-card"
              >
                <div className="relative flex flex-1 items-center justify-center overflow-hidden bg-white">
                  {cat.image ? (
                    <Image
                      src={cat.image}
                      alt={cat.label}
                      fill
                      className="object-contain p-4 transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <cat.icon className="h-16 w-16 text-brand-forest/30" />
                  )}

                  {/* Scanning effect */}
                  <div className="pointer-events-none absolute inset-0">
                    <div className="pointer-events-none absolute inset-x-0 animate-scan-line">
                      <div className="h-10 w-full bg-gradient-to-b from-brand-forest/15 to-transparent" />
                      <div className="h-px w-full bg-brand-forest/70 shadow-[0_0_10px_1px_rgba(45,74,54,0.55)]" />
                    </div>
                    <span className="absolute left-3 top-3 h-4 w-4 rounded-tl-md border-l-2 border-t-2 border-brand-forest/50" />
                    <span className="absolute right-3 top-3 h-4 w-4 rounded-tr-md border-r-2 border-t-2 border-brand-forest/50" />
                    <span className="absolute bottom-3 left-3 h-4 w-4 rounded-bl-md border-b-2 border-l-2 border-brand-forest/50" />
                    <span className="absolute bottom-3 right-3 h-4 w-4 rounded-br-md border-b-2 border-r-2 border-brand-forest/50" />
                  </div>
                </div>
                <div className="border-t border-brand-beige/60 bg-white p-4">
                  <h3 className="font-serif text-xl text-brand-forest">
                    {cat.label}
                  </h3>
                  <p className="mt-0.5 text-xs text-brand-carbon/55">
                    {cat.description}
                  </p>
                  <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-brand-forest">
                    Comprar
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Featured plants */}
        {featuredPlants.length > 0 && (
          <div className="mt-20">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <span className="eyebrow">Lo más querido</span>
                <h2 className="mt-3 font-serif text-3xl text-brand-forest sm:text-4xl">
                  Plantas destacadas
                </h2>
              </div>
              <Link
                href="/productos?tab=plantas"
                className="inline-flex items-center gap-1 text-sm font-semibold text-brand-forest hover:opacity-70"
              >
                Ver todas las plantas
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {featuredPlants.map((plant) => (
                <MarketingPlantCard key={plant.id} plant={plant} />
              ))}
            </div>
          </div>
        )}

        {/* Editorial split — design with a photo */}
        <div className="mt-20 overflow-hidden rounded-xl2 border border-brand-beige/70 bg-white shadow-soft">
          <div className="grid lg:grid-cols-2">
            <div className="relative min-h-[340px] overflow-hidden bg-white lg:min-h-full">
              <Image
                src="/images/plants/jacaranda.png"
                alt="Jacaranda"
                fill
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-contain p-6"
              />

              {/* AI scan overlay */}
              <div className="pointer-events-none absolute inset-x-0 animate-scan-line">
                <div className="h-16 w-full bg-gradient-to-b from-brand-terracotta/20 to-transparent" />
                <div className="h-px w-full bg-brand-terracotta shadow-[0_0_10px_1px_rgba(183,110,77,0.6)]" />
              </div>

              <div className="pointer-events-none absolute inset-6">
                <span className="absolute left-0 top-0 h-5 w-5 rounded-tl-md border-l-2 border-t-2 border-brand-forest/30" />
                <span className="absolute right-0 top-0 h-5 w-5 rounded-tr-md border-r-2 border-t-2 border-brand-forest/30" />
                <span className="absolute bottom-0 left-0 h-5 w-5 rounded-bl-md border-b-2 border-l-2 border-brand-forest/30" />
                <span className="absolute bottom-0 right-0 h-5 w-5 rounded-br-md border-b-2 border-r-2 border-brand-forest/30" />
              </div>

              <Reticle top="42%" left="52%" />

              <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full border border-brand-beige bg-white/90 px-3 py-1.5 text-xs font-semibold text-brand-forest shadow-card backdrop-blur">
                <Sun className="h-3.5 w-3.5" />
                Luz media detectada
              </div>

              <div className="absolute bottom-4 left-4 flex items-center gap-2 rounded-full border border-brand-beige bg-white px-3 py-1.5 text-xs font-semibold text-brand-forest shadow-card">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping-ring rounded-full bg-brand-forest/60" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-brand-forest" />
                </span>
                Analizando tu espacio
              </div>
            </div>
            <div className="flex flex-col justify-center p-8 sm:p-12">
              <span className="eyebrow inline-flex items-center gap-2">
                <Sparkles className="h-3.5 w-3.5" />
                Diseño con Plantik
              </span>
              <h2 className="mt-4 font-serif text-3xl text-brand-forest sm:text-4xl">
                ¿No sabes por dónde empezar? Sube una foto
              </h2>
              <p className="mt-4 max-w-md text-sm leading-relaxed text-brand-carbon/65">
                Analizamos la luz, el estilo y el espacio disponible de tu foto
                para proponerte plantas y macetas que realmente encajan. Es una
                función opcional — comprar del catálogo nunca requiere fotos.
              </p>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/app/disena-tu-espacio"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-brand-forest px-6 py-3.5 text-sm font-semibold text-white shadow-card transition-transform hover:-translate-y-0.5"
                >
                  <Camera className="h-4 w-4" />
                  Diseñar mi espacio
                </Link>
                <Link
                  href="/como-funciona"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-brand-forest/30 bg-white px-6 py-3.5 text-sm font-semibold text-brand-forest transition-colors hover:bg-brand-sage/60"
                >
                  Cómo funciona
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Featured planters */}
        {featuredPlanters.length > 0 && (
          <div className="mt-20">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <span className="eyebrow">Para combinar</span>
                <h2 className="mt-3 font-serif text-3xl text-brand-forest sm:text-4xl">
                  Macetas que van con todo
                </h2>
              </div>
              <Link
                href="/productos?tab=macetas"
                className="inline-flex items-center gap-1 text-sm font-semibold text-brand-forest hover:opacity-70"
              >
                Ver todas las macetas
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {featuredPlanters.map((planter) => (
                <MarketingPlanterCard key={planter.id} planter={planter} />
              ))}
            </div>
          </div>
        )}

        {/* Featured accessories */}
        {featuredAccessories.length > 0 && (
          <div className="mt-20">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <span className="eyebrow">Completa tu espacio</span>
                <h2 className="mt-3 font-serif text-3xl text-brand-forest sm:text-4xl">
                  Sustratos, platos y cubiertas
                </h2>
              </div>
              <Link
                href="/productos?tab=sustratos"
                className="inline-flex items-center gap-1 text-sm font-semibold text-brand-forest hover:opacity-70"
              >
                Ver accesorios
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {featuredAccessories.map((accessory) => (
                <MarketingAccessoryCard key={accessory.id} accessory={accessory} />
              ))}
            </div>
          </div>
        )}

        {/* How it works */}
        <div className="mt-20 rounded-xl2 border border-brand-beige/70 bg-white p-8 shadow-soft sm:p-10">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <span className="eyebrow">Cómo funciona</span>
              <h2 className="mt-3 max-w-lg font-serif text-3xl text-brand-forest">
                De una foto a una propuesta lista, en minutos
              </h2>
            </div>
            <Link
              href="/como-funciona"
              className="inline-flex items-center gap-1 text-sm font-semibold text-brand-forest hover:opacity-70"
            >
              Ver el proceso completo
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, i) => (
              <div
                key={step.n}
                className="relative rounded-xl border border-brand-beige/60 bg-brand-cream/40 p-5"
              >
                <span className="font-serif text-2xl text-brand-beige">
                  {step.n}
                </span>
                <h3 className="mt-2 text-base font-semibold text-brand-carbon">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm text-brand-carbon/60">{step.desc}</p>
                {i < steps.length - 1 && (
                  <ArrowRight className="absolute -right-3 top-1/2 hidden h-5 w-5 -translate-y-1/2 text-brand-moss/40 lg:block" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Testimonials */}
        <div className="mt-20">
          <div className="max-w-lg">
            <span className="eyebrow">Comunidad Plantik</span>
            <h2 className="mt-3 font-serif text-3xl text-brand-forest sm:text-4xl">
              Espacios que cambiaron con una planta
            </h2>
          </div>

          <div className="mt-10 grid gap-5 sm:grid-cols-3">
            {testimonials.map((t) => (
              <figure key={t.id} className="card-surface p-6">
                <div className="flex gap-0.5 text-brand-forest">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-current" />
                  ))}
                </div>
                <blockquote className="mt-4 text-sm leading-relaxed text-brand-carbon/70">
                  &ldquo;{t.quote}&rdquo;
                </blockquote>
                <figcaption className="mt-6 flex items-center gap-3 border-t border-brand-beige/60 pt-5">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-sage text-xs font-bold text-brand-forest">
                    {initials(t.name)}
                  </span>
                  <div>
                    <p className="text-xs font-semibold text-brand-carbon">
                      {t.name}
                    </p>
                    <p className="text-xs text-brand-carbon/50">{t.role}</p>
                  </div>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </div>

      {/* Final CTA */}
      <section className="relative overflow-hidden bg-brand-forest">
        <Leaf className="pointer-events-none absolute -left-8 -top-8 h-48 w-48 rotate-12 text-white/10" />
        <Leaf className="pointer-events-none absolute -bottom-10 right-6 h-40 w-40 -rotate-12 text-white/10" />
        <div className="relative mx-auto max-w-3xl px-4 py-20 text-center sm:px-6 lg:py-28">
          <Leaf className="mx-auto h-8 w-8 text-white/80" />
          <h2 className="mt-5 font-serif text-4xl text-white sm:text-5xl">
            Empieza a llenar tu espacio de verde
          </h2>
          <p className="mx-auto mt-4 max-w-md text-sm text-white/80 sm:text-base">
            Explora el catálogo y compra en minutos, o crea tu cuenta gratis para
            guardar favoritos y seguir tus pedidos.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/productos"
              className="inline-flex items-center gap-2 rounded-full bg-white px-7 py-4 text-sm font-semibold text-brand-forest shadow-card transition-transform hover:-translate-y-0.5"
            >
              <ShoppingBag className="h-4 w-4" />
              Explorar catálogo
            </Link>
            <Link
              href="/registro"
              className="inline-flex items-center gap-2 rounded-full border border-white/40 bg-white/5 px-7 py-4 text-sm font-semibold text-white backdrop-blur transition-colors hover:bg-white/15"
            >
              Crear cuenta gratis
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function ScanCorners() {
  const base = "absolute h-5 w-5 border-white/85";
  return (
    <div className="pointer-events-none absolute inset-3">
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

function AnalysisChip({
  className,
  icon: Icon,
  title,
  subtitle,
  delay,
}: {
  className?: string;
  icon: LucideIcon;
  title: string;
  subtitle: string;
  delay?: string;
}) {
  return (
    <div
      style={{ animationDelay: delay }}
      className={`absolute z-10 flex animate-float items-center gap-2.5 rounded-2xl border border-brand-beige/80 bg-white/95 px-3.5 py-2.5 shadow-card backdrop-blur ${
        className ?? ""
      }`}
    >
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-sage text-brand-forest">
        <Icon className="h-4 w-4" />
      </span>
      <div className="leading-tight">
        <p className="text-xs font-semibold text-brand-carbon">{title}</p>
        <p className="text-[11px] text-brand-carbon/55">{subtitle}</p>
      </div>
    </div>
  );
}

function HeroStat({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center lg:text-left">
      <p className="font-serif text-3xl text-brand-forest sm:text-4xl">{value}</p>
      <p className="mt-1 text-xs uppercase tracking-[0.12em] text-brand-carbon/50">
        {label}
      </p>
    </div>
  );
}
