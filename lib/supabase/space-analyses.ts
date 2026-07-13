import { supabase } from "../supabase";
import {
  SpaceAnalysisRecord,
  RoomAnalysis,
  PlacementLocation,
  DecorativeStyle,
} from "@/types/space-analysis";

export async function createSpaceAnalysis(
  spaceId: string,
  imageId: string | null,
  analysis: RoomAnalysis
): Promise<SpaceAnalysisRecord> {
  const { data, error } = await supabase
    .from("space_analyses")
    .insert({
      space_id: spaceId,
      image_id: imageId || null,
      status: "completed",
      room_type: analysis.roomType,
      light_level: analysis.lightLevel,
      direct_sun: analysis.directSun,
      estimated_space_size: analysis.estimatedSpaceSize,
      styles: analysis.styles,
      dominant_colors: analysis.dominantColors,
      placements: analysis.placements,
      warnings: analysis.warnings,
      confidence: analysis.confidence,
      raw_response: analysis,
      completed_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating space analysis:", error);
    throw error;
  }

  return data as SpaceAnalysisRecord;
}

export async function getSpaceAnalysisById(
  analysisId: string
): Promise<SpaceAnalysisRecord | null> {
  const { data, error } = await supabase
    .from("space_analyses")
    .select()
    .eq("id", analysisId)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    console.error("Error fetching space analysis:", error);
    throw error;
  }

  return data as SpaceAnalysisRecord;
}

export async function getSpaceAnalysesBySpaceId(
  spaceId: string
): Promise<SpaceAnalysisRecord[]> {
  const { data, error } = await supabase
    .from("space_analyses")
    .select()
    .eq("space_id", spaceId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching space analyses:", error);
    throw error;
  }

  return (data || []) as SpaceAnalysisRecord[];
}

export async function updateSpaceAnalysisStatus(
  analysisId: string,
  status: "pending" | "analyzing" | "completed" | "failed",
  errorMessage?: string
): Promise<SpaceAnalysisRecord> {
  const { data, error } = await supabase
    .from("space_analyses")
    .update({
      status,
      error_message: errorMessage,
      completed_at:
        status === "completed" ? new Date().toISOString() : undefined,
    })
    .eq("id", analysisId)
    .select()
    .single();

  if (error) {
    console.error("Error updating space analysis status:", error);
    throw error;
  }

  return data as SpaceAnalysisRecord;
}
