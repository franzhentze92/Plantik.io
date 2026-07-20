"use client";

import Image from "next/image";
import { Plant, Planter } from "@/types";
import { Accessory } from "@/data/accessories";
import { formatQ } from "@/lib/utils";
import { getCompatiblePlanters } from "@/lib/plant-planter-compat";

interface PlacementAccessorySelectorProps {
  plant: Plant;
  planters: Planter[];
  platos: Accessory[];
  planterId?: string;
  platoId?: string;
  onChangePlanter: (planterId: string | undefined) => void;
  onChangePlato: (platoId: string | undefined) => void;
}

export function PlacementAccessorySelector({
  plant,
  planters,
  platos,
  planterId,
  platoId,
  onChangePlanter,
  onChangePlato,
}: PlacementAccessorySelectorProps) {
  const compatiblePlanters = getCompatiblePlanters(
    plant.potDiameterCm,
    planters
  );

  return (
    <div className="space-y-4">
      <div>
        <p className="mb-2 text-xs font-semibold uppercase text-brand-carbon/60">
          Maceta
        </p>
        <div className="grid grid-cols-[repeat(3,minmax(0,1fr))] gap-2 sm:grid-cols-[repeat(4,minmax(0,1fr))]">
          <button
            type="button"
            onClick={() => onChangePlanter(undefined)}
            className={`flex min-w-0 w-full flex-col items-center justify-center gap-1 rounded-lg border-2 p-2 text-center transition-colors ${
              !planterId
                ? "border-brand-forest bg-brand-forest/5"
                : "border-brand-beige bg-white hover:border-brand-forest/30"
            }`}
          >
            <span className="flex h-12 w-full items-center justify-center rounded-md bg-brand-cream/60 text-[10px] font-medium text-brand-carbon/50">
              Sin maceta
            </span>
            <span className="text-[10px] font-medium text-brand-carbon/60">
              Ninguna
            </span>
          </button>
          {compatiblePlanters.map((planter) => (
            <button
              key={planter.id}
              type="button"
              onClick={() => onChangePlanter(planter.id)}
              title={`${planter.name} (${planter.color}) — ${formatQ(planter.priceQ)}`}
              className={`flex min-w-0 w-full flex-col items-center gap-1 rounded-lg border-2 p-2 transition-colors ${
                planterId === planter.id
                  ? "border-brand-forest bg-brand-forest/5"
                  : "border-brand-beige bg-white hover:border-brand-forest/30"
              }`}
            >
              <span className="relative h-12 w-full overflow-hidden rounded-md bg-white">
                <Image
                  src={planter.image || "/images/plant-placeholder.svg"}
                  alt={`${planter.name} ${planter.color}`}
                  fill
                  sizes="80px"
                  className="object-contain"
                />
              </span>
              <span className="w-full truncate text-center text-[10px] font-medium text-brand-carbon/70">
                {planter.color}
              </span>
            </button>
          ))}
        </div>
      </div>

      {platos.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-semibold uppercase text-brand-carbon/60">
            Plato
          </p>
          <div className="grid grid-cols-[repeat(3,minmax(0,1fr))] gap-2 sm:grid-cols-[repeat(4,minmax(0,1fr))]">
            <button
              type="button"
              onClick={() => onChangePlato(undefined)}
              className={`flex min-w-0 w-full flex-col items-center justify-center gap-1 rounded-lg border-2 p-2 text-center transition-colors ${
                !platoId
                  ? "border-brand-forest bg-brand-forest/5"
                  : "border-brand-beige bg-white hover:border-brand-forest/30"
              }`}
            >
              <span className="flex h-12 w-full items-center justify-center rounded-md bg-brand-cream/60 text-[10px] font-medium text-brand-carbon/50">
                Sin plato
              </span>
              <span className="text-[10px] font-medium text-brand-carbon/60">
                Ninguno
              </span>
            </button>
            {platos.map((plato) => (
              <button
                key={plato.id}
                type="button"
                onClick={() => onChangePlato(plato.id)}
                title={`${plato.name} — ${formatQ(plato.priceQ)}`}
                className={`flex min-w-0 w-full flex-col items-center gap-1 rounded-lg border-2 p-2 transition-colors ${
                  platoId === plato.id
                    ? "border-brand-forest bg-brand-forest/5"
                    : "border-brand-beige bg-white hover:border-brand-forest/30"
                }`}
              >
                <span className="relative h-12 w-full overflow-hidden rounded-md bg-white">
                  <Image
                    src={plato.image || "/images/plant-placeholder.svg"}
                    alt={plato.attrs?.["Color"] || plato.name}
                    fill
                    sizes="80px"
                    className="object-contain"
                  />
                </span>
                <span className="w-full truncate text-center text-[10px] font-medium text-brand-carbon/70">
                  {plato.attrs?.["Color"] || "Plato"}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
