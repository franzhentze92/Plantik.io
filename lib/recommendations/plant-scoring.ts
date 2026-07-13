import { Plant } from "@/types";
import { RoomAnalysis, PlacementLocation } from "@/types/space-analysis";
import { RecommendationUserPreferences } from "./user-preferences";

export interface PlantScore {
  plantId: string;
  plantLight: string;
  total: number;
  lightScore: number;
  sunScore: number;
  sizeScore: number;
  roomScore: number;
  careScore: number;
  petScore: number;
  styleScore: number;
  stockScore: number;
  petWarning: boolean;
  sunWarning: boolean;
}

export function scorePlant(
  plant: Plant,
  placement: PlacementLocation,
  analysis: RoomAnalysis,
  userPreferences?: RecommendationUserPreferences
): PlantScore {
  let total = 0;

  // 1. LIGHT COMPATIBILITY (35 points max)
  const lightScore = scoreLightCompatibility(plant.light, analysis.lightLevel);
  total += lightScore;

  // 1b. DIRECT SUN (-15 to +12 points). User's answer is authoritative about
  // their space; fall back to the AI's read of the photo when not provided.
  const effectiveDirectSun =
    userPreferences?.directSun ?? analysis.directSun ?? false;
  const sunScore = scoreDirectSun(plant.light, effectiveDirectSun);
  total += sunScore;

  // Shade-loving plants under direct sun risk scorching.
  const sunWarning = effectiveDirectSun && plant.light === "baja";

  // 2. SIZE COMPATIBILITY (20 points max)
  const sizeScore = scoreSizeForPlacement(
    plant.matureHeightCm,
    placement.recommendedPlantSize,
    placement.availableWidth
  );
  total += sizeScore;

  // 3. ROOM TYPE COMPATIBILITY (15 points max). The user's own answer is
  // authoritative about where the plant will live; fall back to the AI read.
  const effectiveRoomType = userPreferences?.roomType || analysis.roomType;
  const roomScore = scoreRoomType(plant.category, effectiveRoomType);
  total += roomScore;

  // 4. CARE LEVEL (10 points max)
  const careScore = scoreCareLevel(
    plant.care,
    userPreferences?.desiredMaintenance
  );
  total += careScore;

  // 5. PET SAFETY (10 points max)
  const petScore = scorePetSafety(
    plant.petFriendly,
    userPreferences?.hasPets
  );
  total += petScore;

  // 6. STYLE MATCH (5 points max)
  const styleScore = scoreStyleMatch(plant.category, analysis.styles);
  total += styleScore;

  // 7. STOCK & BUDGET (5 points max)
  const stockScore = scoreAvailability(
    plant.stock,
    plant.basePriceQ,
    userPreferences?.maxBudget
  );
  total += stockScore;

  // Pet warning
  const petWarning =
    userPreferences?.hasPets && !plant.petFriendly ? true : false;

  // If pet warning and user has pets, heavily penalize
  if (petWarning) {
    total = Math.max(0, total - 50);
  }

  return {
    plantId: plant.id,
    plantLight: plant.light,
    total: Math.max(0, total),
    lightScore,
    sunScore,
    sizeScore,
    roomScore,
    careScore,
    petScore,
    styleScore,
    stockScore,
    petWarning,
    sunWarning,
  };
}

/**
 * Direct sunlight impact. When the space receives direct sun, sun-tolerant
 * plants (high light) are rewarded and shade-loving plants (low light) are
 * penalized because they scorch. Without direct sun, shade/medium plants are
 * favored slightly and full-sun lovers are nudged down. This ensures the
 * "¿Entra sol directo?" answer measurably reorders recommendations.
 */
function scoreDirectSun(plantLight: string, directSun: boolean): number {
  if (directSun) {
    if (plantLight === "alta") return 12;
    if (plantLight === "media") return 4;
    return -15; // "baja": shade lover exposed to direct sun
  }
  // No direct sun
  if (plantLight === "baja") return 8;
  if (plantLight === "media") return 4;
  return -6; // "alta": full-sun lover starved of direct light
}

function scoreLightCompatibility(
  plantLight: string,
  analysisLight: string
): number {
  const lightLevels = ["baja", "media", "alta"];
  const analysisLightMap: { [key: string]: string } = {
    "very-low": "baja",
    low: "baja",
    medium: "media",
    bright: "alta",
  };
  const normalizedAnalysisLight = analysisLightMap[analysisLight] || analysisLight;
  const analysisIndex = lightLevels.indexOf(normalizedAnalysisLight);
  const plantIndex = lightLevels.indexOf(plantLight);

  if (analysisIndex === -1 || plantIndex === -1) return 0;

  // Perfect match
  if (analysisIndex === plantIndex) return 35;

  // One level off
  if (Math.abs(analysisIndex - plantIndex) === 1) return 20;

  // Two levels off
  return 5;
}

function scoreSizeForPlacement(
  matureHeightCm: number,
  recommendedSize: string,
  availableWidth: string
): number {
  // Match recommended size
  if (
    (recommendedSize === "desktop" && matureHeightCm < 30) ||
    (recommendedSize === "small" && matureHeightCm >= 30 && matureHeightCm < 60) ||
    (recommendedSize === "medium" &&
      matureHeightCm >= 60 &&
      matureHeightCm < 150) ||
    (recommendedSize === "large" && matureHeightCm >= 150)
  ) {
    return 20;
  }

  // One size off
  const sizeRanges = [
    { name: "desktop", min: 0, max: 30 },
    { name: "small", min: 30, max: 60 },
    { name: "medium", min: 60, max: 150 },
    { name: "large", min: 150, max: 500 },
  ];

  const plantRange = sizeRanges.find(
    (r) => matureHeightCm >= r.min && matureHeightCm < r.max
  );
  const recommendedRange = sizeRanges.find((r) => r.name === recommendedSize);

  if (plantRange && recommendedRange) {
    const plantIndex = sizeRanges.indexOf(plantRange);
    const recommendedIndex = sizeRanges.indexOf(recommendedRange);
    if (Math.abs(plantIndex - recommendedIndex) === 1) {
      return 10;
    }
  }

  return 0;
}

function scoreRoomType(plantCategories: string[], roomType: string): number {
  const roomMap: { [key: string]: string[] } = {
    bedroom: ["interior", "bajo-mantenimiento", "poca-luz"],
    "living-room": ["interior", "grandes", "decorativa", "escultural"],
    office: ["interior", "bajo-mantenimiento", "oficina", "escritorio"],
    bathroom: ["interior", "humedad", "poca-luz"],
    balcony: ["exterior", "succulenta", "colorida"],
    "dining-room": ["interior", "decorativa", "colorida"],
    kitchen: ["interior", "pequeña", "escritorio"],
    other: ["interior"],
  };

  const preferredCategories = roomMap[roomType] || ["interior"];
  const matches = plantCategories.filter((cat) =>
    preferredCategories.includes(cat)
  ).length;

  return Math.min(15, matches * 5);
}

function scoreCareLevel(
  plantCare: string,
  desiredMaintenance?: string
): number {
  if (!desiredMaintenance) return 10;

  const careMatch: { [key: string]: { [key: string]: number } } = {
    facil: { easy: 10, moderate: 5, demanding: 0 },
    moderado: { easy: 5, moderate: 10, demanding: 5 },
    exigente: { easy: 0, moderate: 5, demanding: 10 },
  };

  return careMatch[plantCare]?.[desiredMaintenance] || 5;
}

function scorePetSafety(
  plantPetFriendly: boolean,
  hasPets?: boolean
): number {
  if (!hasPets) return 10;
  if (plantPetFriendly) return 10;
  return 0;
}

function scoreStyleMatch(
  plantCategories: string[],
  analysisStyles: string[]
): number {
  if (analysisStyles.length === 0) return 5;

  const styleInCategory = analysisStyles.some((style) =>
    plantCategories.some(
      (cat) =>
        cat.includes(style) ||
        (style === "tropical" && cat.includes("tropical")) ||
        (style === "boho" && (cat.includes("tropical") || cat.includes("bohemian")))
    )
  );

  return styleInCategory ? 5 : 0;
}

function scoreAvailability(
  stock: string,
  price: number,
  maxBudget?: number
): number {
  let score = 0;

  // Stock availability
  if (stock === "disponible") score += 3;
  else if (stock === "pocas_unidades") score += 1;
  else return 0; // Agotado = no score

  // Budget
  if (!maxBudget) {
    score += 2;
  } else if (price <= maxBudget) {
    score += 2;
  }

  return Math.min(5, score);
}
