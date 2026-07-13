"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { formatQ } from "@/lib/utils";
import { getProposalById } from "@/lib/supabase/proposals";
import {
  getPlantById,
  getPlantersCached,
  getAccessoriesCached,
  getAccessoriesByCategory,
} from "@/lib/supabase-queries";
import { ArrowLeft, Check, Download, ShoppingCart } from "lucide-react";
import { Plant, Planter } from "@/types";
import { Accessory } from "@/data/accessories";
import { CreationComponent, useCartStore } from "@/lib/store";
import { track } from "@/lib/analytics";

interface ProposalWithPlants {
  id: string;
  name: string;
  total_price_q: number;
  generated_image_url?: string | null;
  generated_image_status?: string;
  updated_at: string;
  items: Array<{
    placementId?: string;
    plantId: string;
    quantity: number;
    priceQ: number;
    planterId?: string;
    planterPriceQ?: number;
    platoId?: string;
    platoPriceQ?: number;
    plant?: Plant;
  }>;
}

export default function ProposalDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [proposal, setProposal] = useState<ProposalWithPlants | null>(null);
  const [planters, setPlanters] = useState<Planter[]>([]);
  const [platos, setPlatos] = useState<Accessory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addedOk, setAddedOk] = useState(false);
  const imageRef = useRef<HTMLDivElement>(null);
  const addToCart = useCartStore((s) => s.add);

  useEffect(() => {
    async function loadProposal() {
      try {
        const proposalId = params.id as string;
        const data = await getProposalById(proposalId);
        const plantersData = await getPlantersCached();
        setPlanters(plantersData);
        try {
          const accessories = await getAccessoriesCached();
          setPlatos(getAccessoriesByCategory(accessories, "plato"));
        } catch {
          setPlatos([]);
        }

        if (!data) {
          setError("Propuesta no encontrada");
          return;
        }

        // Load plant details for each item
        const itemsWithPlants = await Promise.all(
          (data.items || []).map(async (item: any) => {
            let plant: Plant | null = null;
            try {
              plant = await getPlantById(item.plantId);
            } catch (e) {
              console.error(`Error loading plant ${item.plantId}:`, e);
            }
            return { ...item, plant };
          })
        );

        setProposal({
          ...data,
          items: itemsWithPlants,
        } as ProposalWithPlants);
      } catch (err) {
        setError("Error cargando propuesta");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadProposal();
  }, [params]);

  // On mobile, once the generated visualization is available, scroll up to it so
  // the user clearly sees the result (the image sits above the fold and first-time
  // users often don't realize a visualization was produced).
  useEffect(() => {
    if (!proposal?.generated_image_url) return;
    if (typeof window === "undefined" || window.innerWidth >= 1024) return;
    const id = window.requestAnimationFrame(() => {
      imageRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
    return () => window.cancelAnimationFrame(id);
  }, [proposal?.generated_image_url]);

  function handleAddToCart() {
    if (!proposal) return;

    proposal.items.forEach((item, idx) => {
      const planter = item.planterId
        ? planters.find((p) => p.id === item.planterId)
        : undefined;
      const plato = item.platoId
        ? platos.find((p) => p.id === item.platoId)
        : undefined;
      const planterPriceQ = item.planterPriceQ ?? planter?.priceQ ?? 0;
      const platoPriceQ = item.platoPriceQ ?? plato?.priceQ ?? 0;
      const plantPriceQ =
        item.plant?.basePriceQ ?? item.priceQ - planterPriceQ - platoPriceQ;

      const components: CreationComponent[] = [
        {
          label: "Planta",
          name: item.plant?.name || item.plantId,
          priceQ: plantPriceQ,
          image: item.plant?.images?.[0],
          description:
            item.plant?.shortDescription || item.plant?.scientificName,
        },
      ];
      if (planter) {
        components.push({
          label: "Maceta",
          name: `${planter.name} (${planter.color})`,
          priceQ: planterPriceQ,
          image: planter.image,
          description: [planter.material, planter.color]
            .filter(Boolean)
            .join(" · "),
        });
      }
      if (plato) {
        components.push({
          label: "Plato",
          name: plato.attrs?.["Color"] || plato.name,
          priceQ: platoPriceQ,
          image: plato.image,
          description: plato.attrs?.["Material"],
        });
      }

      addToCart(
        {
          id: `propuesta-${proposal.id}-${item.placementId || idx}`,
          kind: "propuesta",
          name: item.plant?.name || "Planta",
          subtitle: proposal.name,
          image:
            item.plant?.images?.[0] ||
            proposal.generated_image_url ||
            "/images/plant-placeholder.svg",
          priceQ: item.priceQ,
          components,
        },
        item.quantity
      );
    });

    track("add_to_cart", {
      source: "proposal",
      proposalId: proposal.id,
      priceQ: proposal.total_price_q,
    });
    setAddedOk(true);
  }

  if (loading) {
    return (
      <div className="container-app py-10">
        <p className="text-brand-carbon/60">Cargando...</p>
      </div>
    );
  }

  if (error || !proposal) {
    return (
      <div className="container-app py-10">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm font-semibold text-brand-forest hover:opacity-70 mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Atrás
        </button>
        <p className="text-red-600">{error || "Propuesta no encontrada"}</p>
      </div>
    );
  }

  return (
    <div className="container-app py-8 lg:py-10">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-sm font-semibold text-brand-forest hover:opacity-70 mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Atrás
      </button>

      <div>
        <div className="mb-8">
          <span className="eyebrow">Tu propuesta</span>
          <h1 className="mt-3 font-serif text-3xl text-brand-forest sm:text-4xl">
            {proposal.name}
          </h1>
          <p className="mt-2 text-sm text-brand-carbon/60">
            {proposal.items.length} planta
            {proposal.items.length !== 1 ? "s" : ""} ·{" "}
            {new Date(proposal.updated_at).toLocaleDateString("es-ES", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>

        <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)]">
          <div className="space-y-6">
            {proposal.generated_image_url ? (
              <div
                ref={imageRef}
                className="scroll-mt-24 rounded-xl border border-brand-beige bg-white p-4"
              >
                <p className="text-xs font-semibold text-brand-carbon/60 uppercase mb-3">
                  Así se vería tu espacio
                </p>
                <div className="relative flex w-full justify-center overflow-hidden rounded-lg bg-brand-cream/40">
                  <Image
                    src={proposal.generated_image_url}
                    alt="Visualización de tu espacio con las plantas propuestas"
                    width={1024}
                    height={1024}
                    className="h-auto max-h-[70vh] w-auto max-w-full rounded-lg object-contain"
                  />
                </div>
              </div>
            ) : proposal.generated_image_status === "failed" ? (
              <div className="rounded-xl border border-brand-beige bg-brand-cream/30 p-6 text-center">
                <p className="text-sm text-brand-carbon/60">
                  No pudimos generar la visualización de tu espacio. Tus plantas siguen guardadas abajo.
                </p>
              </div>
            ) : (
              <div className="rounded-xl border border-brand-beige bg-brand-cream/30 p-6 text-center">
                <p className="text-sm text-brand-carbon/60">
                  Generando visualización de tu espacio...
                </p>
              </div>
            )}

            <div className="rounded-xl border border-brand-beige bg-white p-6">
              <h2 className="font-semibold text-brand-forest mb-4">
                Plantas seleccionadas ({proposal.items.length})
              </h2>

              <div className="grid gap-4 xl:grid-cols-2">
                {proposal.items.map((item, idx) => {
                  const planter = item.planterId
                    ? planters.find((p) => p.id === item.planterId)
                    : undefined;
                  const plato = item.platoId
                    ? platos.find((p) => p.id === item.platoId)
                    : undefined;
                  const planterPriceQ =
                    item.planterPriceQ ?? planter?.priceQ ?? 0;
                  const platoPriceQ = item.platoPriceQ ?? plato?.priceQ ?? 0;
                  const plantPriceQ =
                    item.plant?.basePriceQ ??
                    item.priceQ - planterPriceQ - platoPriceQ;

                  return (
                    <div
                      key={idx}
                      className="rounded-lg border border-brand-beige p-4"
                    >
                      <div className="flex items-start gap-4">
                        {item.plant?.images?.[0] && (
                          <div className="relative h-16 w-16 flex-shrink-0 rounded-lg overflow-hidden">
                            <Image
                              src={item.plant.images[0]}
                              alt={item.plant.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                        )}

                        <div className="flex-1">
                          <h3 className="font-semibold text-brand-forest">
                            {item.plant?.name || item.plantId}
                          </h3>
                          {item.plant?.scientificName && (
                            <p className="text-xs italic text-brand-carbon/50 mt-0.5">
                              {item.plant.scientificName}
                            </p>
                          )}
                          <p className="text-xs text-brand-carbon/60 mt-2">
                            Cantidad: {item.quantity}
                          </p>
                        </div>

                        <div className="text-right">
                          <p className="font-semibold text-brand-forest">
                            {formatQ(item.priceQ * item.quantity)}
                          </p>
                          <p className="text-xs text-brand-carbon/50">
                            {formatQ(item.priceQ)} c/u
                          </p>
                        </div>
                      </div>

                      <div className="mt-3 space-y-1.5 border-t border-brand-beige/60 pt-3">
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-brand-carbon/50">
                          Piezas incluidas
                        </p>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-brand-carbon/75">
                            Planta · {item.plant?.name || item.plantId}
                          </span>
                          <span className="font-medium text-brand-forest">
                            {formatQ(plantPriceQ)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-brand-carbon/75">
                            Maceta{planter ? ` · ${planter.name} (${planter.color})` : ""}
                          </span>
                          <span className="font-medium text-brand-forest">
                            {planter ? formatQ(planterPriceQ) : "Sin maceta"}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-brand-carbon/75">
                            Plato{plato ? ` · ${plato.attrs?.["Color"] || plato.name}` : ""}
                          </span>
                          <span className="font-medium text-brand-forest">
                            {plato ? formatQ(platoPriceQ) : "Sin plato"}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="space-y-4 lg:sticky lg:top-6">
            <div className="rounded-xl border border-brand-beige bg-white p-6">
              <p className="text-xs font-semibold text-brand-carbon/60 uppercase mb-3">
                Resumen
              </p>

              <div className="space-y-2 border-b border-brand-beige pb-4 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-brand-carbon/75">Plantas</span>
                  <span className="font-semibold text-brand-forest">
                    {proposal.items.reduce((sum, i) => sum + i.quantity, 0)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-brand-carbon/75">Macetas</span>
                  <span className="font-semibold text-brand-forest">
                    {proposal.items.reduce(
                      (sum, i) => sum + (i.planterId ? i.quantity : 0),
                      0
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-brand-carbon/75">Platos</span>
                  <span className="font-semibold text-brand-forest">
                    {proposal.items.reduce(
                      (sum, i) => sum + (i.platoId ? i.quantity : 0),
                      0
                    )}
                  </span>
                </div>
              </div>

              <div className="mb-6">
                <div className="flex justify-between items-baseline">
                  <p className="text-sm text-brand-carbon/75">Total</p>
                  <p className="font-serif text-2xl text-brand-forest">
                    {formatQ(proposal.total_price_q || 0)}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <button
                  type="button"
                  onClick={handleAddToCart}
                  className="flex w-full items-center justify-center gap-2 rounded-full bg-brand-forest px-6 py-3 text-sm font-semibold text-white shadow-card transition-colors hover:opacity-90"
                >
                  {addedOk ? (
                    <>
                      <Check className="h-4 w-4" />
                      Agregado al carrito
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="h-4 w-4" />
                      Agregar al carrito
                    </>
                  )}
                </button>

                {addedOk && (
                  <Link
                    href="/app/carrito"
                    className="flex w-full items-center justify-center gap-2 rounded-full border border-brand-forest/30 bg-white px-6 py-3 text-sm font-semibold text-brand-forest transition-colors hover:bg-brand-sage/50"
                  >
                    Ir al carrito
                  </Link>
                )}

                {proposal.generated_image_url ? (
                  <a
                    href={proposal.generated_image_url}
                    download={`propuesta-${proposal.id}.png`}
                    className="flex w-full items-center justify-center gap-2 rounded-full border border-brand-forest/30 bg-white px-6 py-3 text-sm font-semibold text-brand-forest transition-colors hover:bg-brand-sage/50"
                  >
                    <Download className="h-4 w-4" />
                    Descargar visualización
                  </a>
                ) : (
                  <button
                    disabled
                    title="La visualización aún no está lista"
                    className="flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-full border border-brand-beige bg-white px-6 py-3 text-sm font-semibold text-brand-carbon/40 opacity-60"
                  >
                    <Download className="h-4 w-4" />
                    Descargar visualización
                  </button>
                )}
              </div>
            </div>

            <div className="rounded-lg bg-brand-cream/50 p-4">
              <p className="text-xs text-brand-carbon/60">
                Propuesta creada {new Date(proposal.updated_at).toLocaleDateString("es-ES")}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
