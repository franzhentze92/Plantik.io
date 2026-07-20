"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  BookMarked,
  Check,
  Leaf,
  Loader2,
  ShoppingCart,
} from "lucide-react";
import { cn, formatQ } from "@/lib/utils";
import { track } from "@/lib/analytics";
import {
  useCartStore,
  useCreationsStore,
  type CreationComponent,
} from "@/lib/store";
import {
  getPlantsCached,
  getPlantersCached,
  getAccessoriesCached,
} from "@/lib/supabase-queries";
import {
  buildSaucers,
  buildSoils,
  buildMulches,
  getBuildOption,
  type BuildOption,
} from "@/data/build-components";
import { Plant, Planter } from "@/types";
import type { Accessory } from "@/data/accessories";
import { CreationThumbnail } from "@/components/creations/CreationThumbnail";
import { isCatalogProductId } from "@/lib/catalog-ids";

type StepKey = "saucer" | "planter" | "soil" | "mulch" | "plant";

const STEPS: { key: StepKey; label: string; title: string; hint: string }[] = [
  {
    key: "saucer",
    label: "Plato",
    title: "Elige tu plato macetero",
    hint: "La base que protege tus superficies y completa el look.",
  },
  {
    key: "planter",
    label: "Maceta",
    title: "Elige tu maceta",
    hint: "El recipiente donde vivirá tu planta.",
  },
  {
    key: "soil",
    label: "Tierra",
    title: "Elige el sustrato",
    hint: "La tierra ideal según el tipo de planta.",
  },
  {
    key: "mulch",
    label: "Mulch",
    title: "Añade una cubierta para maceta",
    hint: "Opcional: mejora la estética y retiene humedad.",
  },
  {
    key: "plant",
    label: "Planta",
    title: "Elige tu planta",
    hint: "La protagonista de tu creación.",
  },
];

interface Selections {
  saucer: string | null;
  planter: string | null;
  soil: string | null;
  mulch: string | null;
  plant: string | null;
}

export default function BuildPlantPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [plants, setPlants] = useState<Plant[]>([]);
  const [planters, setPlanters] = useState<Planter[]>([]);
  const [accessories, setAccessories] = useState<Accessory[]>([]);
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [name, setName] = useState("");
  const [savedOk, setSavedOk] = useState(false);
  const [addedOk, setAddedOk] = useState(false);
  const [selections, setSelections] = useState<Selections>({
    saucer: null,
    planter: null,
    soil: null,
    mulch: null,
    plant: null,
  });

  const addToCart = useCartStore((s) => s.add);
  const addCreation = useCreationsStore((s) => s.add);

  const stepTopRef = useRef<HTMLDivElement>(null);
  const summaryRef = useRef<HTMLDivElement>(null);

  function maybeScrollToStepTop() {
    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      stepTopRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  function scrollToSummary() {
    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      summaryRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  function goToStep(i: number) {
    setStepIndex(i);
    window.setTimeout(maybeScrollToStepTop, 60);
  }

  useEffect(() => {
    setMounted(true);
    track("page_view", { route: "/app/arma-tu-planta" });
    let active = true;
    Promise.all([
      getPlantsCached(),
      getPlantersCached(),
      getAccessoriesCached(),
    ])
      .then(([plantsData, plantersData, accessoriesData]) => {
        if (!active) return;
        setPlants(plantsData);
        setPlanters(plantersData);
        setAccessories(accessoriesData);
        setCatalogLoading(false);
      })
      .catch(() => setCatalogLoading(false));
    return () => {
      active = false;
    };
  }, []);

  const step = STEPS[stepIndex];

  const saucers = useMemo(() => buildSaucers(accessories), [accessories]);
  const soils = useMemo(() => buildSoils(accessories), [accessories]);
  const mulches = useMemo(() => buildMulches(accessories), [accessories]);

  const selectedSaucer = getBuildOption(saucers, selections.saucer);
  const selectedSoil = getBuildOption(soils, selections.soil);
  const selectedMulch = getBuildOption(mulches, selections.mulch);
  const selectedPlanter = planters.find((p) => p.id === selections.planter);
  const selectedPlant = plants.find((p) => p.id === selections.plant);

  const total = useMemo(() => {
    return (
      (selectedSaucer?.priceQ ?? 0) +
      (selectedPlanter?.priceQ ?? 0) +
      (selectedSoil?.priceQ ?? 0) +
      (selectedMulch?.priceQ ?? 0) +
      (selectedPlant?.basePriceQ ?? 0)
    );
  }, [selectedSaucer, selectedPlanter, selectedSoil, selectedMulch, selectedPlant]);

  // The creation is complete once the essentials are chosen.
  const isComplete = Boolean(
    selectedPlanter && selectedSoil && selectedPlant
  );

  // Each step needs a selection before continuing.
  const currentSelectionMade = Boolean(selections[step.key]);

  function select(key: StepKey, id: string) {
    setSelections((prev) => ({ ...prev, [key]: id }));
    setSavedOk(false);
    setAddedOk(false);

    const idx = STEPS.findIndex((s) => s.key === key);
    if (idx < STEPS.length - 1) {
      // Move straight to the next step so the user doesn't have to scroll
      // down to "Continuar" and back up to keep choosing.
      window.setTimeout(() => goToStep(idx + 1), 260);
    } else {
      // Last step (plant): bring the summary + actions into view on mobile.
      window.setTimeout(scrollToSummary, 260);
    }
  }

  function goNext() {
    if (stepIndex < STEPS.length - 1) goToStep(stepIndex + 1);
  }
  function goPrev() {
    if (stepIndex > 0) goToStep(stepIndex - 1);
  }

  function buildComponents(): CreationComponent[] {
    const list: CreationComponent[] = [];
    if (selectedSaucer)
      list.push({
        label: "Plato",
        name: selectedSaucer.name,
        priceQ: selectedSaucer.priceQ,
        image: selectedSaucer.image,
        description: selectedSaucer.description,
      });
    if (selectedPlanter)
      list.push({
        label: "Maceta",
        name: `${selectedPlanter.name} · ${selectedPlanter.size}`,
        priceQ: selectedPlanter.priceQ,
        image: selectedPlanter.image,
        description: [selectedPlanter.material, selectedPlanter.color]
          .filter(Boolean)
          .join(" · "),
      });
    if (selectedSoil)
      list.push({
        label: "Tierra",
        name: selectedSoil.name,
        priceQ: selectedSoil.priceQ,
        image: selectedSoil.image,
        description: selectedSoil.description,
      });
    if (selectedMulch)
      list.push({
        label: "Mulch",
        name: selectedMulch.name,
        priceQ: selectedMulch.priceQ,
        image: selectedMulch.image,
        description: selectedMulch.description,
      });
    if (selectedPlant)
      list.push({
        label: "Planta",
        name: selectedPlant.name,
        priceQ: selectedPlant.basePriceQ,
        image: selectedPlant.images?.[0],
        description: selectedPlant.scientificName,
      });
    return list;
  }

  function creationName() {
    return (
      name.trim() ||
      (selectedPlant ? `Mi ${selectedPlant.name}` : "Mi creación Plantik")
    );
  }

  function creationImage() {
    return (
      selectedPlant?.images?.[0] ||
      selectedPlanter?.image ||
      "/images/plant-placeholder.svg"
    );
  }

  function handleSave() {
    if (!isComplete) return;
    const id = `crea_${Date.now()}`;
    addCreation({
      id,
      name: creationName(),
      image: creationImage(),
      totalQ: total,
      components: buildComponents(),
      saucerId: selections.saucer,
      planterId: selections.planter,
      soilId: selections.soil,
      mulchId: selections.mulch,
      plantId: selectedPlant?.id,
      createdAt: new Date().toISOString(),
    });
    track("proposal_saved", { priceQ: total });
    setSavedOk(true);
  }

  function handleAddToCart() {
    if (!isComplete) return;
    addToCart({
      id: `crea_${Date.now()}`,
      kind: "creacion",
      name: creationName(),
      subtitle: `${selectedPlant?.name} + ${selectedPlanter?.name}`,
      image: creationImage(),
      priceQ: total,
      components: buildComponents(),
    });
    track("add_to_cart", { priceQ: total });
    setAddedOk(true);
  }

  if (!mounted) {
    return (
      <div className="container-app py-16">
        <p className="text-brand-carbon/60">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="container-app pt-10 pb-24 lg:pb-10">
      <div>
        <span className="eyebrow inline-flex items-center gap-2">
          <Leaf className="h-3.5 w-3.5" />
          Arma tu planta
          <Leaf className="h-3.5 w-3.5" />
        </span>
        <h1 className="mt-3 font-serif text-4xl text-brand-forest sm:text-5xl">
          Crea tu planta perfecta
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-brand-carbon/65">
          Combina plato, maceta, tierra, cubierta y planta paso a paso. Al
          terminar, guárdala en tus propuestas o agrégala directo al carrito.
        </p>
      </div>

      {/* Stepper */}
      <div className="mt-8 flex items-center gap-1 overflow-x-auto pb-2">
        {STEPS.map((s, i) => {
          const done = Boolean(selections[s.key]);
          const active = i === stepIndex;
          return (
            <div key={s.key} className="flex items-center">
              <button
                type="button"
                onClick={() => goToStep(i)}
                className={cn(
                  "flex items-center gap-2 rounded-full px-3.5 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-brand-forest text-white shadow-card"
                    : "text-brand-carbon/60 hover:bg-brand-sage/50"
                )}
              >
                <span
                  className={cn(
                    "flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold",
                    active
                      ? "bg-white/20 text-white"
                      : done
                        ? "bg-brand-forest text-white"
                        : "bg-brand-beige text-brand-carbon/60"
                  )}
                >
                  {done && !active ? <Check className="h-3.5 w-3.5" /> : i + 1}
                </span>
                <span className="whitespace-nowrap">{s.label}</span>
              </button>
              {i < STEPS.length - 1 && (
                <span className="mx-1 h-px w-4 shrink-0 bg-brand-beige sm:w-6" />
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
        {/* Step panel */}
        <div className="min-w-0">
          <div ref={stepTopRef} className="scroll-mt-4" />
          <h2 className="font-serif text-2xl text-brand-forest">{step.title}</h2>
          <p className="mt-1 text-sm text-brand-carbon/60">{step.hint}</p>

          <div className="mt-6">
            {step.key === "saucer" && (
              <OptionGrid
                options={saucers}
                selectedId={selections.saucer}
                onSelect={(id) => select("saucer", id)}
              />
            )}
            {step.key === "soil" && (
              <OptionGrid
                options={soils}
                selectedId={selections.soil}
                onSelect={(id) => select("soil", id)}
              />
            )}
            {step.key === "mulch" && (
              <OptionGrid
                options={mulches}
                selectedId={selections.mulch}
                onSelect={(id) => select("mulch", id)}
              />
            )}

            {step.key === "planter" && (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                {planters.map((p) => {
                  const active = selections.planter === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => select("planter", p.id)}
                      className={cn(
                        "card-surface group overflow-hidden text-left transition-all",
                        active
                          ? "ring-2 ring-brand-forest ring-offset-2"
                          : "hover:shadow-card"
                      )}
                    >
                      <div className="relative h-32 w-full overflow-hidden bg-white">
                        <Image
                          src={p.image}
                          alt={p.name}
                          fill
                          className="object-contain p-2 transition-transform duration-300 group-hover:scale-105"
                        />
                        {active && (
                          <span className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-brand-forest text-white">
                            <Check className="h-3.5 w-3.5" />
                          </span>
                        )}
                      </div>
                      <div className="p-3">
                        <h3 className="text-sm font-semibold text-brand-carbon break-words">
                          {p.name}
                        </h3>
                        <p className="text-[11px] text-brand-carbon/50">
                          {p.material} · Talla {p.size}
                        </p>
                        <p className="mt-1.5 text-sm font-semibold text-brand-forest">
                          {formatQ(p.priceQ)}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {step.key === "plant" && (
              <>
                {catalogLoading ? (
                  <div className="flex items-center gap-2 py-10 text-brand-carbon/60">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Cargando plantas...
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                    {plants.map((p) => {
                      const active = selections.plant === p.id;
                      const useContain = isCatalogProductId(p.id);
                      return (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => select("plant", p.id)}
                          className={cn(
                            "card-surface group overflow-hidden text-left transition-all",
                            active
                              ? "ring-2 ring-brand-forest ring-offset-2"
                              : "hover:shadow-card"
                          )}
                        >
                          <div
                            className={cn(
                              "relative h-32 w-full overflow-hidden",
                              useContain ? "bg-white" : "bg-brand-cream"
                            )}
                          >
                            <Image
                              src={p.images[0]}
                              alt={p.name}
                              fill
                              className={cn(
                                useContain ? "object-contain p-2" : "object-cover",
                                "transition-transform duration-300 group-hover:scale-105"
                              )}
                            />
                            {active && (
                              <span className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-brand-forest text-white">
                                <Check className="h-3.5 w-3.5" />
                              </span>
                            )}
                          </div>
                          <div className="p-3">
                            <h3 className="text-sm font-semibold text-brand-carbon break-words">
                              {p.name}
                            </h3>
                            <p className="text-[11px] italic text-brand-carbon/50">
                              {p.scientificName}
                            </p>
                            <p className="mt-1.5 text-sm font-semibold text-brand-forest">
                              {formatQ(p.basePriceQ)}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Step navigation */}
          <div className="mt-8 flex items-center justify-between">
            <button
              type="button"
              onClick={goPrev}
              disabled={stepIndex === 0}
              className="inline-flex items-center gap-2 rounded-full border border-brand-beige bg-white px-5 py-2.5 text-sm font-semibold text-brand-carbon/70 transition-colors hover:border-brand-forest/30 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ArrowLeft className="h-4 w-4" />
              Atrás
            </button>
            {stepIndex < STEPS.length - 1 && (
              <button
                type="button"
                onClick={goNext}
                disabled={!currentSelectionMade}
                className="inline-flex items-center gap-2 rounded-full bg-brand-forest px-5 py-2.5 text-sm font-semibold text-white shadow-card transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Continuar
                <ArrowRight className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Live summary */}
        <aside ref={summaryRef} className="min-w-0 scroll-mt-4 lg:sticky lg:top-24 lg:h-fit">
          <div className="card-surface overflow-hidden">
            <CreationThumbnail
              className="h-44 w-full"
              name={creationName()}
              showName
              pieces={[
                { label: "Planta", image: selectedPlant?.images?.[0] },
                { label: "Maceta", image: selectedPlanter?.image },
                { label: "Plato", image: selectedSaucer?.image },
                { label: "Tierra", image: selectedSoil?.image },
                { label: "Mulch", image: selectedMulch?.image },
              ]}
            />

            <div className="p-5">
              <h3 className="text-sm font-semibold text-brand-carbon">
                Tu creación
              </h3>

              <ul className="mt-3 space-y-2 text-sm">
                <SummaryRow
                  label="Plato"
                  value={selectedSaucer?.name}
                  price={selectedSaucer?.priceQ}
                />
                <SummaryRow
                  label="Maceta"
                  value={selectedPlanter?.name}
                  price={selectedPlanter?.priceQ}
                />
                <SummaryRow
                  label="Tierra"
                  value={selectedSoil?.name}
                  price={selectedSoil?.priceQ}
                />
                <SummaryRow
                  label="Mulch"
                  value={selectedMulch?.name}
                  price={selectedMulch?.priceQ}
                />
                <SummaryRow
                  label="Planta"
                  value={selectedPlant?.name}
                  price={selectedPlant?.basePriceQ}
                />
              </ul>

              <div className="mt-4 flex items-center justify-between border-t border-brand-beige/60 pt-3">
                <span className="text-sm font-semibold text-brand-carbon">
                  Total
                </span>
                <span className="text-lg font-semibold text-brand-forest">
                  {formatQ(total)}
                </span>
              </div>

              <label className="mt-4 block">
                <span className="text-xs font-medium text-brand-carbon/60">
                  Nombre de tu creación
                </span>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={
                    selectedPlant ? `Mi ${selectedPlant.name}` : "Mi creación"
                  }
                  className="mt-1 w-full rounded-xl border border-brand-beige bg-white px-3.5 py-2.5 text-sm text-brand-carbon focus:border-brand-forest/40 focus:outline-none"
                />
              </label>

              {!isComplete && (
                <p className="mt-3 rounded-xl bg-brand-cream/70 px-3 py-2 text-[11px] text-brand-carbon/60">
                  Selecciona al menos maceta, tierra y planta para guardar o
                  comprar.
                </p>
              )}

              <div className="mt-4 space-y-2.5">
                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={!isComplete}
                  className="flex w-full items-center justify-center gap-2 rounded-full bg-brand-forest px-5 py-3 text-sm font-semibold text-white shadow-card transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
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
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={!isComplete}
                  className="flex w-full items-center justify-center gap-2 rounded-full border border-brand-forest/30 bg-white px-5 py-3 text-sm font-semibold text-brand-forest transition-colors hover:bg-brand-sage/50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {savedOk ? (
                    <>
                      <Check className="h-4 w-4" /> Guardada en propuestas
                    </>
                  ) : (
                    <>
                      <BookMarked className="h-4 w-4" /> Guardar en propuestas
                    </>
                  )}
                </button>
              </div>

              {(savedOk || addedOk) && (
                <div className="mt-3 flex gap-3 text-xs font-medium">
                  {savedOk && (
                    <Link
                      href="/app/propuestas"
                      className="text-brand-forest underline-offset-2 hover:underline"
                    >
                      Ver mis propuestas
                    </Link>
                  )}
                  {addedOk && (
                    <button
                      type="button"
                      onClick={() => router.push("/app/carrito")}
                      className="text-brand-forest underline-offset-2 hover:underline"
                    >
                      Ir al carrito
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </aside>
      </div>

      {/* Sticky mobile action bar — keeps total + primary action always reachable */}
      <div className="sticky bottom-4 z-30 mt-6 lg:hidden">
        <div className="flex items-center justify-between gap-3 rounded-full border border-brand-beige bg-white/95 px-4 py-2.5 shadow-card backdrop-blur">
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-wide text-brand-carbon/50">
              Total
            </p>
            <p className="font-serif text-lg leading-none text-brand-forest">
              {formatQ(total)}
            </p>
          </div>
          {stepIndex < STEPS.length - 1 ? (
            <button
              type="button"
              onClick={goNext}
              disabled={!currentSelectionMade}
              className="inline-flex shrink-0 items-center gap-2 rounded-full bg-brand-forest px-5 py-2.5 text-sm font-semibold text-white shadow-card transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Continuar
              <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={isComplete ? handleAddToCart : scrollToSummary}
              disabled={!isComplete}
              className="inline-flex shrink-0 items-center gap-2 rounded-full bg-brand-forest px-5 py-2.5 text-sm font-semibold text-white shadow-card transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {addedOk ? (
                <>
                  <Check className="h-4 w-4" /> Agregado
                </>
              ) : (
                <>
                  <ShoppingCart className="h-4 w-4" /> Agregar
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function OptionGrid({
  options,
  selectedId,
  onSelect,
}: {
  options: BuildOption[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {options.map((opt) => {
        const Icon = opt.icon;
        const active = selectedId === opt.id;
        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => onSelect(opt.id)}
            className={cn(
              "card-surface flex items-start gap-3 p-4 text-left transition-all",
              active
                ? "ring-2 ring-brand-forest ring-offset-2"
                : "hover:shadow-card"
            )}
          >
            {opt.image ? (
              <span className="relative mt-0.5 h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-brand-beige/60 bg-white">
                <Image
                  src={opt.image}
                  alt={opt.name}
                  fill
                  className="object-contain p-1"
                />
              </span>
            ) : (
              <span
                className="mt-0.5 flex h-14 w-14 shrink-0 items-center justify-center rounded-xl ring-1 ring-black/5"
                style={{ backgroundColor: opt.swatch }}
              >
                <Icon className="h-5 w-5 text-brand-carbon/70" />
              </span>
            )}
            <span className="min-w-0 flex-1">
              <span className="flex items-start justify-between gap-2">
                <span className="text-sm font-semibold text-brand-carbon break-words">
                  {opt.name}
                </span>
                {active && (
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand-forest" />
                )}
              </span>
              <span className="mt-0.5 block text-[11px] leading-relaxed text-brand-carbon/55">
                {opt.description}
              </span>
              <span className="mt-1.5 block text-sm font-semibold text-brand-forest">
                {opt.priceQ === 0 ? "Incluido" : formatQ(opt.priceQ)}
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );
}

function SummaryRow({
  label,
  value,
  price,
}: {
  label: string;
  value?: string;
  price?: number;
}) {
  return (
    <li className="flex items-center justify-between gap-2">
      <span className="text-brand-carbon/55">{label}</span>
      {value ? (
        <span className="flex min-w-0 items-center gap-2">
          <span className="truncate text-brand-carbon">{value}</span>
          <span className="shrink-0 text-brand-carbon/50">
            {price === 0 ? "—" : formatQ(price ?? 0)}
          </span>
        </span>
      ) : (
        <span className="text-brand-carbon/35">Sin elegir</span>
      )}
    </li>
  );
}
