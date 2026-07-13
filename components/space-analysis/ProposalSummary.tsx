"use client";

import Image from "next/image";
import { Plant, Planter } from "@/types";
import { Accessory } from "@/data/accessories";
import { PlacementLocation } from "@/types/space-analysis";
import { formatQ } from "@/lib/utils";
import { Check, Pencil, ShoppingCart, Sparkles, Loader2 } from "lucide-react";
import Link from "next/link";

export interface SelectedPlant {
  placementId: string;
  plantId: string;
  plant: Plant;
  quantity: number;
  size?: string;
  planterId?: string;
  platoId?: string;
}

interface ProposalSummaryProps {
  selectedPlants: SelectedPlant[];
  planters: Planter[];
  platos: Accessory[];
  onRemove?: (placementId: string) => void;
  onChangePlant?: (placementId: string) => void;
  onChangePlanter?: (placementId: string, planterId: string | undefined) => void;
  onChangePlato?: (placementId: string, platoId: string | undefined) => void;
  onSaveProposal?: (plants: SelectedPlant[]) => void;
  savedProposalId?: string | null;
  onGenerate?: (plants: SelectedPlant[]) => void;
  isGenerating?: boolean;
  hasVisualization?: boolean;
  onAddToCart?: (plants: SelectedPlant[]) => void;
  addedToCart?: boolean;
  isSaving?: boolean;
  placements: PlacementLocation[];
}

function planterPrice(planters: Planter[], planterId?: string): number {
  if (!planterId) return 0;
  return planters.find((p) => p.id === planterId)?.priceQ || 0;
}

function platoPrice(platos: Accessory[], platoId?: string): number {
  if (!platoId) return 0;
  return platos.find((p) => p.id === platoId)?.priceQ || 0;
}

export function ProposalSummary({
  selectedPlants,
  planters,
  platos,
  onRemove,
  onChangePlant,
  onSaveProposal,
  savedProposalId,
  onGenerate,
  isGenerating,
  hasVisualization,
  onAddToCart,
  addedToCart,
  isSaving,
  placements,
}: ProposalSummaryProps) {
  const totalPrice = selectedPlants.reduce(
    (sum, p) =>
      sum +
      (p.plant.basePriceQ +
        planterPrice(planters, p.planterId) +
        platoPrice(platos, p.platoId)) *
        p.quantity,
    0
  );

  const placementMap = new Map(placements.map((p) => [p.id, p]));

  return (
    <div className="space-y-6 rounded-xl border border-brand-beige bg-white p-6">
      <div>
        <h2 className="font-semibold text-brand-forest">Tu propuesta</h2>
        <p className="mt-1 text-xs text-brand-carbon/60">
          {selectedPlants.length} planta{selectedPlants.length !== 1 ? "s" : ""} seleccionada{selectedPlants.length !== 1 ? "s" : ""}
        </p>
      </div>

      {selectedPlants.length === 0 ? (
        <div className="rounded-lg bg-brand-cream/30 p-4 text-center">
          <p className="text-xs text-brand-carbon/60">
            Selecciona plantas para crear tu propuesta
          </p>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {selectedPlants.map((selected) => {
              const placement = placementMap.get(selected.placementId);
              const itemTotal =
                (selected.plant.basePriceQ +
                  planterPrice(planters, selected.planterId) +
                  platoPrice(platos, selected.platoId)) *
                selected.quantity;

              return (
                <div
                  key={`${selected.placementId}-${selected.plantId}`}
                  className="rounded-lg border border-brand-beige p-3"
                >
                  <div className="flex items-start gap-3">
                    <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg bg-brand-cream">
                      <Image
                        src={selected.plant.images?.[0] || "/images/plant-placeholder.svg"}
                        alt={selected.plant.name}
                        fill
                        className="object-cover"
                      />
                    </div>

                    <div className="flex-1">
                      <div className="flex items-baseline gap-2">
                        <p className="font-semibold text-brand-forest text-sm">
                          {selected.plant.name}
                        </p>
                        {placement && (
                          <p className="text-xs text-brand-carbon/50">
                            en {placement.placementType}
                          </p>
                        )}
                      </div>
                      <p className="text-xs text-brand-carbon/60 mt-1">
                        {formatQ(selected.plant.basePriceQ)} × {selected.quantity}
                        {selected.planterId && (
                          <> + maceta {formatQ(planterPrice(planters, selected.planterId))}</>
                        )}
                        {selected.platoId && (
                          <> + plato {formatQ(platoPrice(platos, selected.platoId))}</>
                        )}
                      </p>

                      <div className="mt-2 flex items-center gap-2 text-xs">
                        {onChangePlant && (
                          <button
                            onClick={() => onChangePlant(selected.placementId)}
                            className="flex items-center gap-1 text-brand-forest font-medium hover:opacity-70"
                          >
                            <Pencil className="h-3 w-3" />
                            Cambiar planta
                          </button>
                        )}
                        {onRemove && (
                          <>
                            <span className="text-brand-carbon/30">·</span>
                            <button
                              onClick={() => onRemove(selected.placementId)}
                              className="text-red-600 hover:text-red-700 font-medium"
                            >
                              Eliminar
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    <p className="font-semibold text-brand-forest text-sm">
                      {formatQ(itemTotal)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="border-t border-brand-beige pt-4">
            <div className="flex justify-between items-center">
              <p className="font-semibold text-brand-forest">Total</p>
              <p className="font-serif text-2xl text-brand-forest">
                {formatQ(totalPrice)}
              </p>
            </div>
          </div>

          {!hasVisualization ? (
            onGenerate && (
              <button
                type="button"
                onClick={() => onGenerate(selectedPlants)}
                disabled={isGenerating || selectedPlants.length === 0}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-brand-forest px-6 py-3 text-sm font-semibold text-white shadow-card transition-colors hover:opacity-90 disabled:opacity-50"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Generando visualización...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Generar visualización
                  </>
                )}
              </button>
            )
          ) : (
            <div className="space-y-3">
              {onAddToCart && (
                <button
                  type="button"
                  onClick={() => onAddToCart(selectedPlants)}
                  disabled={selectedPlants.length === 0}
                  className="flex w-full items-center justify-center gap-2 rounded-full bg-brand-forest px-6 py-3 text-sm font-semibold text-white shadow-card transition-colors hover:opacity-90 disabled:opacity-50"
                >
                  {addedToCart ? (
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
              )}

              {addedToCart && (
                <Link
                  href="/app/carrito"
                  className="flex w-full items-center justify-center gap-2 rounded-full border border-brand-forest/30 bg-white px-6 py-3 text-sm font-semibold text-brand-forest transition-colors hover:bg-brand-sage/50"
                >
                  Ir al carrito
                </Link>
              )}

              {onSaveProposal &&
                (savedProposalId ? (
                  <Link
                    href={`/app/propuestas/${savedProposalId}`}
                    className="flex w-full items-center justify-center gap-2 rounded-full border border-brand-forest/30 bg-brand-sage/40 px-6 py-3 text-sm font-semibold text-brand-forest transition-colors hover:bg-brand-sage/60"
                  >
                    <Check className="h-4 w-4" />
                    Propuesta guardada · Verla
                  </Link>
                ) : (
                  <button
                    type="button"
                    onClick={() => onSaveProposal(selectedPlants)}
                    disabled={isSaving || selectedPlants.length === 0}
                    className="flex w-full items-center justify-center gap-2 rounded-full border border-brand-forest/30 bg-white px-6 py-3 text-sm font-semibold text-brand-forest transition-colors hover:bg-brand-sage/50 disabled:opacity-50"
                  >
                    {isSaving ? (
                      <span>Guardando...</span>
                    ) : (
                      <>
                        <Check className="h-4 w-4" />
                        Guardar propuesta
                      </>
                    )}
                  </button>
                ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
