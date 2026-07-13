import { supabase } from "../supabase";

export interface ProposalItem {
  placementId?: string;
  plantId: string;
  quantity: number;
  plantSize?: string;
  priceQ: number;
  planterId?: string;
  planterPriceQ?: number;
  platoId?: string;
  platoPriceQ?: number;
}

export interface Proposal {
  id: string;
  session_id: string;
  space_id?: string;
  analysis_id?: string;
  name?: string;
  status: string;
  total_price_q?: number;
  items: ProposalItem[];
  generated_image_url?: string | null;
  generated_image_status?: "pending" | "completed" | "failed";
  created_at: string;
  updated_at: string;
}

export async function createProposal(
  sessionId: string,
  spaceId: string,
  analysisId: string,
  items: ProposalItem[],
  name?: string
): Promise<Proposal> {
  const totalPrice = items.reduce((sum, item) => sum + item.priceQ * item.quantity, 0);

  const { data, error } = await supabase
    .from("proposals")
    .insert({
      session_id: sessionId,
      space_id: spaceId,
      analysis_id: analysisId,
      name: name || `Propuesta ${new Date().toLocaleDateString()}`,
      status: "draft",
      total_price_q: totalPrice,
      items,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating proposal:", error);
    throw error;
  }

  return data as Proposal;
}

export async function getProposalById(proposalId: string): Promise<Proposal | null> {
  const { data, error } = await supabase
    .from("proposals")
    .select()
    .eq("id", proposalId)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    console.error("Error fetching proposal:", error);
    throw error;
  }

  return data as Proposal;
}

export async function getProposalsBySessionId(
  sessionId: string
): Promise<Proposal[]> {
  const { data, error } = await supabase
    .from("proposals")
    .select()
    .eq("session_id", sessionId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching proposals:", error);
    throw error;
  }

  return (data || []) as Proposal[];
}

export async function getProposalsByAnalysisId(
  analysisId: string
): Promise<Proposal[]> {
  const { data, error } = await supabase
    .from("proposals")
    .select()
    .eq("analysis_id", analysisId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching proposals:", error);
    throw error;
  }

  return (data || []) as Proposal[];
}

export async function updateProposal(
  proposalId: string,
  updates: Partial<Proposal>
): Promise<Proposal> {
  const { data, error } = await supabase
    .from("proposals")
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq("id", proposalId)
    .select()
    .single();

  if (error) {
    console.error("Error updating proposal:", error);
    throw error;
  }

  return data as Proposal;
}

export async function deleteProposal(proposalId: string): Promise<void> {
  const { error } = await supabase
    .from("proposals")
    .delete()
    .eq("id", proposalId);

  if (error) {
    console.error("Error deleting proposal:", error);
    throw error;
  }
}
