"use client";

import { Plant } from "@/types";
import { PlacementLocation } from "@/types/space-analysis";
import { PlantScore } from "@/lib/recommendations/plant-scoring";
import { getReasonsForScore } from "@/lib/recommendations/recommend-plants";
import { PlantRecommendationCard } from "./PlantRecommendationCard";

interface RecommendationPanelProps {
  placement: PlacementLocation;
  recommendations: Array<{
    plant: Plant;
    score: PlantScore;
  }>;
  selectedPlantId?: string;
  onSelectPlant?: (plantId: string, plant: Plant) => void;
  showFullCatalog?: boolean;
  onToggleCatalog?: (expanded: boolean) => void;
  catalogLoading?: boolean;
}

const placementTypeLabels: { [key: string]: string } = {
  floor: "Piso",
  table: "Mesa o escritorio",
  shelf: "Repisa",
  hanging: "Colgante",
};

const widthLabels: { [key: string]: string } = {
  narrow: "Estrecho",
  medium: "Mediano",
  wide: "Amplio",
};

export function RecommendationPanel({
  placement,
  recommendations,
  selectedPlantId,
  onSelectPlant,
  showFullCatalog = false,
  onToggleCatalog,
  catalogLoading = false,
}: RecommendationPanelProps) {
  return (
    <div className="space-y-4">
      <div className="rounded-lg bg-brand-cream/50 p-4">
        <h3 className="font-semibold text-brand-forest">Ubicación</h3>
        <p className="text-xs text-brand-carbon/60 mt-1">
          {placementTypeLabels[placement.placementType]}
          {" · "}
          Ancho: {widthLabels[placement.availableWidth]}
        </p>
        <p className="text-xs text-brand-carbon/50 mt-2 italic">
          {placement.reasoning}
        </p>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs font-semibold text-brand-carbon/60 uppercase">
            {showFullCatalog
              ? "Catálogo completo"
              : "Recomendaciones para esta ubicación"}
          </p>
          {onToggleCatalog && (
            <button
              type="button"
              onClick={() => onToggleCatalog(!showFullCatalog)}
              disabled={catalogLoading}
              className="text-xs font-semibold text-brand-forest hover:opacity-70 disabled:opacity-50"
            >
              {catalogLoading
                ? "Cargando..."
                : showFullCatalog
                  ? "Ver solo top 3"
                  : "Ver catálogo completo"}
            </button>
          )}
        </div>

        {recommendations.length === 0 ? (
          <div className="rounded-lg border border-brand-beige bg-brand-cream/30 p-4 text-center">
            <p className="text-xs text-brand-carbon/60">
              No hay plantas compatibles para esta ubicación
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {recommendations.map(({ plant, score }) => {
              const { positive, warnings } = getReasonsForScore(score);
              return (
                <PlantRecommendationCard
                  key={plant.id}
                  plant={plant}
                  score={score}
                  positiveReasons={positive}
                  warnings={warnings}
                  isSelected={selectedPlantId === plant.id}
                  onSelect={() => onSelectPlant?.(plant.id, plant)}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
