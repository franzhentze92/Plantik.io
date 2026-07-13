import { supabase } from "../supabase";
import { SpaceImage } from "@/types/space-analysis";

export async function createSpaceImage(
  spaceId: string,
  storagePath: string,
  publicUrl?: string,
  width?: number,
  height?: number
): Promise<SpaceImage> {
  const { data, error } = await supabase
    .from("space_images")
    .insert({
      space_id: spaceId,
      storage_path: storagePath,
      public_url: publicUrl,
      width,
      height,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating space image:", error);
    throw error;
  }

  return data as SpaceImage;
}

export async function getSpaceImagesById(
  spaceId: string
): Promise<SpaceImage[]> {
  const { data, error } = await supabase
    .from("space_images")
    .select()
    .eq("space_id", spaceId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching space images:", error);
    throw error;
  }

  return (data || []) as SpaceImage[];
}
