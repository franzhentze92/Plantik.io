"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Check,
  Layers,
  Leaf,
  Moon,
  ShoppingCart,
  Sun,
  SunMedium,
  Trash2,
} from "lucide-react";
import { formatQ } from "@/lib/utils";
import { track } from "@/lib/analytics";
import { CreationComponent, useCartStore, useCreationsStore } from "@/lib/store";
import { getPlantsCached, getPlantersCached, getAccessoriesCached } from "@/lib/supabase-queries";
import {
  buildSaucers,
  buildSoils,
  buildMulches,
  getBuildOption,
} from "@/data/build-components";
import { Plant, Planter } from "@/types";
import type { Accessory } from "@/data/accessories";
import { EmptyState } from "@/components/ui/EmptyState";

const LIGHT_META: Record<string, { icon: typeof Sun; label: string }> = {
  baja: { icon: Moon, label: "Luz baja" },
  media: { icon: SunMedium, label: "Luz media" },
  alta: { icon: Sun, label: "Luz alta" },
};

// EPA product photos sit on white backgrounds, so we contain them (like the
// catalog) instead of cropping with object-cover.
function isEpaImage(url?: string): boolean {
  return Boolean(url && url.includes("gt.epaenlinea.com"));
}

export default function CreationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = String(params.id);

  const [mounted, setMounted] = useState(false);
  const [plants, setPlants] = useState<Plant[]>([]);
  const [planters, setPlanters] = useState<Planter[]>([]);
  const [accessories, setAccessories] = useState<Accessory[]>([]);
  const [addedOk, setAddedOk] = useState(false);

  const creation = useCreationsStore((s) =>
    s.creations.find((c) => c.id === id)
  );
  const removeCreation = useCreationsStore((s) => s.remove);
  const addToCart = useCartStore((s) => s.add);

  useEffect(() => {
    setMounted(true);
    track("page_view", { route: "/app/creaciones/[id]" });
    Promise.all([
      getPlantsCached(),
      getPlantersCached(),
      getAccessoriesCached(),
    ])
      .then(([plantsData, plantersData, accessoriesData]) => {
        setPlants(plantsData);
        setPlanters(plantersData);
        setAccessories(accessoriesData);
      })
      .catch(() => {
        setPlants([]);
        setPlanters([]);
        setAccessories([]);
      });
  }, []);

  if (!mounted) {
    return (
      <div className="container-app py-16">
        <p className="text-brand-carbon/60">Cargando...</p>
      </div>
    );
  }

  if (!creation) {
    return (
      <div className="container-app py-16">
        <EmptyState
          icon={Layers}
          title="No encontramos esta creación"
          description="Es posible que la hayas eliminado o que el enlace no sea válido."
          action={
            <Link
              href="/app/propuestas"
              className="rounded-full bg-brand-forest px-5 py-2.5 text-sm font-semibold text-white"
            >
              Ver mis propuestas
            </Link>
          }
        />
      </div>
    );
  }

  const saucers = buildSaucers(accessories);
  const soils = buildSoils(accessories);
  const mulches = buildMulches(accessories);
  const saucer = getBuildOption(saucers, creation.saucerId ?? null);
  const soil = getBuildOption(soils, creation.soilId ?? null);
  const mulch = getBuildOption(mulches, creation.mulchId ?? null);
  const planter = planters.find((p) => p.id === creation.planterId);
  const plant = plants.find((p) => p.id === creation.plantId);
  const light = plant ? LIGHT_META[plant.light] ?? LIGHT_META.media : null;
  const LightIcon = light?.icon;

  // Older creations saved before component IDs existed: fall back to the
  // stored component snapshot so they still render their variants.
  const hasResolved = Boolean(plant || planter || saucer || soil || mulch);

  function handleAddToCart() {
    if (!creation) return;

    const resolvedComponents: CreationComponent[] = hasResolved
      ? [
          plant && {
            label: "Planta",
            name: plant.name,
            priceQ: plant.basePriceQ,
            image: plant.images?.[0],
            description: plant.shortDescription || plant.scientificName,
          },
          planter && {
            label: "Maceta",
            name: `${planter.name} (${planter.color})`,
            priceQ: planter.priceQ,
            image: planter.image,
            description: [planter.material, planter.color]
              .filter(Boolean)
              .join(" · "),
          },
          saucer && {
            label: "Plato",
            name: saucer.name,
            priceQ: saucer.priceQ,
            image: saucer.image,
            description: saucer.description,
          },
          soil && {
            label: "Sustrato",
            name: soil.name,
            priceQ: soil.priceQ,
            image: soil.image,
            description: soil.description,
          },
          mulch && {
            label: "Cubierta",
            name: mulch.name,
            priceQ: mulch.priceQ,
            image: mulch.image,
            description: mulch.description,
          },
        ].filter(Boolean as unknown as (v: unknown) => v is CreationComponent)
      : creation.components;

    addToCart({
      id: creation.id,
      kind: "creacion",
      name: creation.name,
      subtitle: creation.components
        .map((c) => c.name)
        .slice(0, 2)
        .join(" + "),
      image: creation.image,
      priceQ: creation.totalQ,
      components: resolvedComponents,
    });
    track("add_to_cart", { priceQ: creation.totalQ });
    setAddedOk(true);
  }

  function handleDelete() {
    if (!creation) return;
    removeCreation(creation.id);
    router.push("/app/propuestas");
  }

  const createdLabel = new Date(creation.createdAt).toLocaleDateString("es-GT", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const componentCount = [plant, planter, saucer, soil, mulch].filter(
    Boolean
  ).length;

  return (
    <div className="container-app py-10">
      <Link
        href="/app/propuestas"
        className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-brand-forest hover:opacity-70"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver a mis propuestas
      </Link>

      {/* Header */}
      <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="eyebrow inline-flex items-center gap-2">
            <Layers className="h-3.5 w-3.5" />
            Creación personalizada
          </span>
          <h1 className="mt-2 font-serif text-4xl text-brand-forest sm:text-5xl">
            {creation.name}
          </h1>
          <p className="mt-2 text-sm text-brand-carbon/55">
            Armada el {createdLabel}
            {componentCount > 0 && (
              <>
                {" · "}
                {componentCount}{" "}
                {componentCount === 1 ? "componente" : "componentes"}
              </>
            )}
          </p>
        </div>
        <div className="shrink-0 rounded-xl2 border border-brand-beige bg-white px-6 py-4 text-right shadow-soft">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-brand-carbon/45">
            Precio total
          </p>
          <p className="font-serif text-3xl text-brand-forest">
            {formatQ(creation.totalQ)}
          </p>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_1.1fr]">
        {/* Hero image */}
        <div className="relative overflow-hidden rounded-xl2 shadow-card">
          <div
            className={`relative flex h-96 items-center justify-center lg:h-[34rem] ${
              isEpaImage(creation.image)
                ? "bg-gradient-to-b from-brand-sage/45 via-brand-cream to-white"
                : "bg-brand-cream"
            }`}
          >
            <Leaf className="pointer-events-none absolute -left-8 -top-8 h-40 w-40 rotate-12 text-brand-moss/[0.06]" />
            <Leaf className="pointer-events-none absolute -bottom-10 -right-8 h-44 w-44 -rotate-12 text-brand-moss/[0.06]" />
            <Image
              src={creation.image}
              alt={creation.name}
              fill
              className={
                isEpaImage(creation.image)
                  ? "object-contain p-10"
                  : "object-cover"
              }
              sizes="(max-width: 1024px) 100vw, 45vw"
              priority
            />
          </div>
        </div>

        {/* Details */}
        <div className="flex flex-col">
          <span className="eyebrow inline-flex items-center gap-2">
            <Leaf className="h-3.5 w-3.5" />
            Tu creación
          </span>
          <h2 className="mt-3 font-serif text-2xl text-brand-forest">
            Componentes seleccionados
          </h2>
          <p className="mt-1 text-sm text-brand-carbon/60">
            Estas son todas las variantes que elegiste para armar tu planta.
          </p>

          <div className="mt-6 space-y-3">
            {!hasResolved &&
              creation.components.map((c, idx) => (
                <VariantRow
                  key={idx}
                  label={c.label}
                  title={c.name}
                  price={c.priceQ}
                  swatch="#E8E2D4"
                  icon={<Layers className="h-5 w-5 text-brand-carbon/70" />}
                />
              ))}

            {/* Planta */}
            {plant && (
              <VariantRow
                label="Planta"
                title={plant.name}
                subtitle={plant.scientificName}
                price={plant.basePriceQ}
                image={plant.images[0]}
                badge={
                  light && LightIcon ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-brand-sage px-2 py-0.5 text-[10px] font-medium text-brand-forest">
                      <LightIcon className="h-3 w-3" />
                      {light.label}
                    </span>
                  ) : null
                }
              />
            )}

            {/* Maceta */}
            {planter && (
              <VariantRow
                label="Maceta"
                title={planter.name}
                subtitle={`${planter.material} · Talla ${planter.size} · ${planter.color}`}
                price={planter.priceQ}
                image={planter.image}
              />
            )}

            {/* Plato */}
            {saucer && (
              <VariantRow
                label="Plato macetero"
                title={saucer.name}
                subtitle={saucer.description}
                price={saucer.priceQ}
                image={saucer.image}
                swatch={saucer.swatch}
                icon={<saucer.icon className="h-5 w-5 text-brand-carbon/70" />}
              />
            )}

            {/* Tierra */}
            {soil && (
              <VariantRow
                label="Tierra / sustrato"
                title={soil.name}
                subtitle={soil.description}
                price={soil.priceQ}
                image={soil.image}
                swatch={soil.swatch}
                icon={<soil.icon className="h-5 w-5 text-brand-carbon/70" />}
              />
            )}

            {/* Mulch */}
            {mulch && (
              <VariantRow
                label="Cubierta (mulch)"
                title={mulch.name}
                subtitle={mulch.description}
                price={mulch.priceQ}
                image={mulch.image}
                swatch={mulch.swatch}
                icon={<mulch.icon className="h-5 w-5 text-brand-carbon/70" />}
              />
            )}
          </div>

          <div className="mt-6 flex items-center justify-between rounded-xl2 border border-brand-beige bg-brand-cream/50 px-5 py-4">
            <span className="text-sm font-semibold text-brand-carbon">
              Precio total
            </span>
            <span className="font-serif text-2xl text-brand-forest">
              {formatQ(creation.totalQ)}
            </span>
          </div>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={handleAddToCart}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-brand-forest px-6 py-3.5 text-sm font-semibold text-white shadow-card transition-transform hover:-translate-y-0.5"
            >
              {addedOk ? (
                <>
                  <Check className="h-4 w-4" /> Agregado al carrito
                </>
              ) : (
                <>
                  <ShoppingCart className="h-4 w-4" /> Agregar al carrito
                </>
              )}
            </button>
            {addedOk && (
              <Link
                href="/app/carrito"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-brand-forest/30 bg-white px-6 py-3.5 text-sm font-semibold text-brand-forest transition-colors hover:bg-brand-sage/50"
              >
                Ir al carrito
              </Link>
            )}
            <button
              type="button"
              onClick={handleDelete}
              aria-label="Eliminar creación"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-brand-beige bg-white px-5 py-3.5 text-sm font-semibold text-brand-carbon/60 transition-colors hover:border-red-300 hover:text-red-500"
            >
              <Trash2 className="h-4 w-4" />
              Eliminar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function VariantRow({
  label,
  title,
  subtitle,
  price,
  image,
  swatch,
  icon,
  badge,
}: {
  label: string;
  title: string;
  subtitle?: string;
  price: number;
  image?: string;
  swatch?: string;
  icon?: React.ReactNode;
  badge?: React.ReactNode;
}) {
  return (
    <div className="card-surface flex items-center gap-4 p-3 transition-shadow hover:shadow-card">
      <div className="relative h-[4.5rem] w-[4.5rem] shrink-0 overflow-hidden rounded-xl border border-brand-beige/60 bg-white">
        {image ? (
          <Image
            src={image}
            alt={title}
            fill
            className={isEpaImage(image) ? "object-contain p-2" : "object-cover"}
          />
        ) : (
          <span
            className="flex h-full w-full items-center justify-center"
            style={{ backgroundColor: swatch }}
          >
            {icon}
          </span>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <span className="text-[10px] font-semibold uppercase tracking-wide text-brand-carbon/45">
          {label}
        </span>
        <div className="flex items-center gap-2">
          <h3 className="truncate text-sm font-semibold text-brand-carbon">
            {title}
          </h3>
          {badge}
        </div>
        {subtitle && (
          <p className="line-clamp-2 text-xs text-brand-carbon/55">{subtitle}</p>
        )}
      </div>
      <span className="shrink-0 text-sm font-semibold text-brand-forest">
        {price === 0 ? "Incluido" : formatQ(price)}
      </span>
    </div>
  );
}
