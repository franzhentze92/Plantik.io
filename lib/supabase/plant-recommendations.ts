import { supabase } from "../supabase";
import { PlantRecommendation } from "@/types/space-analysis";

export async function createPlantRecommendations(
  analysisId: string,
  recommendations: Array<{
    plantId: string;
    placementId?: string;
    score: number;
    reasons: string[];
    warnings: string[];
    rank: number;
  }>
): Promise<PlantRecommendation[]> {
  const { data, error } = await supabase
    .from("plant_recommendations")
    .insert(
      recommendations.map((rec) => ({
        analysis_id: analysisId,
        plant_id: rec.plantId,
        placement_id: rec.placementId,
        score: rec.score,
        reasons: rec.reasons,
        warnings: rec.warnings,
        rank: rec.rank,
      }))
    )
    .select();

  if (error) {
    console.error("Error creating plant recommendations:", error);
    throw error;
  }

  return (data || []) as PlantRecommendation[];
}

export async function getPlantRecommendationsByAnalysisId(
  analysisId: string
): Promise<PlantRecommendation[]> {
  const { data, error } = await supabase
    .from("plant_recommendations")
    .select()
    .eq("analysis_id", analysisId)
    .order("rank", { ascending: true });

  if (error) {
    console.error("Error fetching plant recommendations:", error);
    throw error;
  }

  return (data || []) as PlantRecommendation[];
}

export async function getPlantRecommendationsByPlacementId(
  analysisId: string,
  placementId: string
): Promise<PlantRecommendation[]> {
  const { data, error } = await supabase
    .from("plant_recommendations")
    .select()
    .eq("analysis_id", analysisId)
    .eq("placement_id", placementId)
    .order("rank", { ascending: true });

  if (error) {
    console.error("Error fetching plant recommendations:", error);
    throw error;
  }

  return (data || []) as PlantRecommendation[];
}
