"use client";

import { useState } from "react";
import Image from "next/image";
import { Plant } from "@/types";
import { PlantScore } from "@/lib/recommendations/plant-scoring";
import { AlertCircle, Check, Info, X } from "lucide-react";
import { formatQ } from "@/lib/utils";

interface PlantRecommendationCardProps {
  plant: Plant;
  score: PlantScore;
  onSelect?: () => void;
  isSelected?: boolean;
  positiveReasons: string[];
  warnings: string[];
}

const stockLabel = (stock: Plant["stock"]) =>
  stock === "disponible"
    ? "Disponible"
    : stock === "pocas_unidades"
      ? "Pocas unidades"
      : "Agotado";

export function PlantRecommendationCard({
  plant,
  score,
  onSelect,
  isSelected,
  positiveReasons,
  warnings,
}: PlantRecommendationCardProps) {
  const [showDetails, setShowDetails] = useState(false);
  const compatibilityPercentage = Math.min(100, Math.round(score.total));

  return (
    <>
      <div
        className={`flex flex-col overflow-hidden rounded-xl border-2 transition-all ${
          isSelected
            ? "border-brand-forest bg-brand-forest/5"
            : "border-brand-beige bg-white hover:border-brand-forest/30"
        }`}
      >
        <div className="relative aspect-[4/3] w-full bg-white">
          <Image
            src={plant.images?.[0] || "/images/plant-placeholder.svg"}
            alt={plant.name}
            fill
            sizes="(min-width: 1024px) 20vw, 45vw"
            className="object-cover"
          />

          <button
            type="button"
            onClick={() => setShowDetails(true)}
            aria-label={`Ver detalles de ${plant.name}`}
            className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-brand-forest shadow-card backdrop-blur transition-colors hover:bg-white"
          >
            <Info className="h-4 w-4" />
          </button>

          <span className="absolute left-2 top-2 rounded-full bg-brand-forest/90 px-2 py-0.5 text-[11px] font-semibold text-white backdrop-blur">
            {compatibilityPercentage}%
          </span>

          {warnings.length > 0 && (
            <span className="absolute bottom-2 left-2 flex items-center gap-1 rounded-full bg-amber-500/90 px-2 py-0.5 text-[10px] font-semibold text-white backdrop-blur">
              <AlertCircle className="h-3 w-3" />
              Ojo
            </span>
          )}
        </div>

        <div className="flex flex-1 flex-col p-3">
          <h3 className="truncate text-sm font-semibold text-brand-forest">
            {plant.name}
          </h3>
          <p className="mt-0.5 text-sm font-semibold text-brand-carbon">
            {formatQ(plant.basePriceQ)}
          </p>

          {onSelect && (
            <button
              onClick={onSelect}
              className={`mt-3 w-full rounded-lg py-2 text-xs font-semibold transition-colors ${
                isSelected
                  ? "bg-brand-forest text-white"
                  : "border border-brand-forest text-brand-forest hover:bg-brand-forest/10"
              }`}
            >
              {isSelected ? "Seleccionada" : "Seleccionar"}
            </button>
          )}
        </div>
      </div>

      {showDetails && (
        <div
          className="fixed inset-0 z-[60] flex items-end justify-center bg-black/40 p-0 backdrop-blur-sm sm:items-center sm:p-4"
          onClick={() => setShowDetails(false)}
        >
          <div
            className="max-h-[85vh] w-full max-w-md overflow-y-auto rounded-t-2xl bg-white shadow-xl sm:rounded-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative aspect-[4/3] w-full bg-white">
              <Image
                src={plant.images?.[0] || "/images/plant-placeholder.svg"}
                alt={plant.name}
                fill
                sizes="(min-width: 640px) 28rem, 100vw"
                className="object-cover"
              />
              <button
                type="button"
                onClick={() => setShowDetails(false)}
                aria-label="Cerrar"
                className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-brand-carbon shadow-card backdrop-blur transition-colors hover:bg-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="font-serif text-xl text-brand-forest">
                    {plant.name}
                  </h3>
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold text-brand-forest">
                    {formatQ(plant.basePriceQ)}
                  </p>
                  <p className="text-xs text-brand-carbon/50">
                    {stockLabel(plant.stock)}
                  </p>
                </div>
              </div>

              <div className="mt-4 flex items-center gap-2">
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-brand-beige">
                  <div
                    className="h-full bg-brand-forest transition-all"
                    style={{ width: `${compatibilityPercentage}%` }}
                  />
                </div>
                <span className="text-xs font-semibold text-brand-forest">
                  {compatibilityPercentage}% compatible
                </span>
              </div>

              {plant.shortDescription && (
                <p className="mt-4 text-sm leading-relaxed text-brand-carbon/75">
                  {plant.shortDescription}
                </p>
              )}

              {positiveReasons.length > 0 && (
                <div className="mt-4 space-y-1.5">
                  {positiveReasons.map((reason, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600" />
                      <p className="text-sm text-brand-carbon/75">{reason}</p>
                    </div>
                  ))}
                </div>
              )}

              {warnings.length > 0 && (
                <div className="mt-3 space-y-1.5">
                  {warnings.map((warning, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-600" />
                      <p className="text-sm text-amber-700">{warning}</p>
                    </div>
                  ))}
                </div>
              )}

              {onSelect && (
                <button
                  onClick={() => {
                    onSelect();
                    setShowDetails(false);
                  }}
                  className={`mt-5 w-full rounded-full py-3 text-sm font-semibold transition-colors ${
                    isSelected
                      ? "bg-brand-forest text-white"
                      : "border border-brand-forest text-brand-forest hover:bg-brand-forest/10"
                  }`}
                >
                  {isSelected ? "Seleccionada" : "Seleccionar esta planta"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
