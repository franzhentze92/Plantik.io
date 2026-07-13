import { aiRecommendationSets } from "@/data/ai-recommendations";
import { AiRecommendationSet, RoomAnswers } from "@/types";

/**
 * Simulates a multimodal room-analysis AI using predefined rules.
 * Swap this implementation later for a real call to a vision model —
 * the function signature and return type are designed to stay stable.
 */
export function simulateRoomAnalysis(answers: RoomAnswers): AiRecommendationSet {
  const bySpace = aiRecommendationSets.filter((set) =>
    set.matchesSpaceType.includes(answers.spaceType)
  );

  const candidates = bySpace.length > 0 ? bySpace : aiRecommendationSets;

  if (answers.light === "baja") {
    const lowLight = candidates.find((set) => set.id === "poca-luz-bienestar");
    if (lowLight) return lowLight;
  }

  if (answers.style) {
    const styleMatch = candidates.find((set) =>
      set.matchesStyle.some((s) => s === answers.style)
    );
    if (styleMatch) return styleMatch;
  }

  return candidates[0] ?? aiRecommendationSets[0];
}

export const ANALYSIS_PHASES = [
  "Analizando iluminación",
  "Detectando estilo",
  "Identificando espacios disponibles",
  "Buscando plantas compatibles",
  "Preparando propuesta",
] as const;
