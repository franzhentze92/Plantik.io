import { Plant } from "@/types";
import { RoomAnalysis, PlacementLocation } from "@/types/space-analysis";
import { scorePlant, PlantScore } from "./plant-scoring";
import { RecommendationUserPreferences } from "./user-preferences";

export interface RecommendationForPlacement {
  placementId: string;
  placement: PlacementLocation;
  recommendations: Array<{
    plant: Plant;
    score: PlantScore;
  }>;
}

export function scorePlantsForPlacement(
  placement: PlacementLocation,
  analysis: RoomAnalysis,
  plants: Plant[],
  userPreferences?: RecommendationUserPreferences
): Array<{ plant: Plant; score: PlantScore }> {
  return plants
    .map((plant) => ({
      plant,
      score: scorePlant(plant, placement, analysis, userPreferences),
    }))
    .filter(({ score }) => score.total > 0)
    .sort((a, b) => b.score.total - a.score.total);
}

export function recommendPlantsForAnalysis(
  analysis: RoomAnalysis,
  plants: Plant[],
  userPreferences?: RecommendationUserPreferences,
  limitPerPlacement = 3
): RecommendationForPlacement[] {
  return analysis.placements.map((placement) => ({
    placementId: placement.id,
    placement,
    recommendations: scorePlantsForPlacement(
      placement,
      analysis,
      plants,
      userPreferences
    ).slice(0, limitPerPlacement),
  }));
}

export function getReasonsForScore(score: PlantScore): {
  positive: string[];
  warnings: string[];
} {
  const positive: string[] = [];
  const warnings: string[] = [];

  if (score.lightScore > 0) {
    positive.push(`La luz ${getPlantLightNeed(score.plantLight)} es compatible`);
  }

  if (score.sunScore > 0) {
    positive.push(
      score.plantLight === "alta"
        ? "Aprovecha el sol directo del espacio"
        : "Tolera bien las condiciones de luz del espacio"
    );
  }

  if (score.sizeScore > 0) {
    positive.push("El tamaño es apropiado para esta ubicación");
  }

  if (score.roomScore > 0) {
    positive.push("Está diseñada para este tipo de espacio");
  }

  if (score.careScore > 0) {
    positive.push("El nivel de cuidado es manejable");
  }

  if (score.styleScore > 0) {
    positive.push("Complementa el estilo del espacio");
  }

  if (score.stockScore < 5) {
    warnings.push("Stock limitado");
  }

  if (score.sunWarning) {
    warnings.push("⚠️ El sol directo puede quemar sus hojas");
  }

  if (score.petWarning) {
    warnings.push("⚠️ No es segura para mascotas");
  }

  return { positive, warnings };
}

function getPlantLightNeed(light: string): string {
  const map: { [key: string]: string } = {
    baja: "baja que requiere",
    media: "media que requiere",
    alta: "brillante que requiere",
  };
  return map[light] || light;
}
