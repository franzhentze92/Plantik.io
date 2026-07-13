import { supabase } from "../supabase";
import { Space, RoomType } from "@/types/space-analysis";

export async function createSpace(
  sessionId: string,
  name?: string,
  roomType?: RoomType
): Promise<Space> {
  const { data, error } = await supabase
    .from("spaces")
    .insert({
      session_id: sessionId,
      name,
      room_type: roomType,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating space:", error);
    throw error;
  }

  return data as Space;
}

export async function getSpaceById(spaceId: string): Promise<Space | null> {
  const { data, error } = await supabase
    .from("spaces")
    .select()
    .eq("id", spaceId)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    console.error("Error fetching space:", error);
    throw error;
  }

  return data as Space;
}

export async function getSpacesBySessionId(sessionId: string): Promise<Space[]> {
  const { data, error } = await supabase
    .from("spaces")
    .select()
    .eq("session_id", sessionId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching spaces:", error);
    throw error;
  }

  return (data || []) as Space[];
}

export async function updateSpace(
  spaceId: string,
  updates: { name?: string; room_type?: RoomType }
): Promise<Space> {
  const { data, error } = await supabase
    .from("spaces")
    .update(updates)
    .eq("id", spaceId)
    .select()
    .single();

  if (error) {
    console.error("Error updating space:", error);
    throw error;
  }

  return data as Space;
}
