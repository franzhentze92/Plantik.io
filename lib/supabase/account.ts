import { supabase } from "../supabase";
import type { UserProfile, UserSettings } from "@/lib/store";

export interface DbUserProfile extends UserProfile {
  session_id: string;
  avatarUrl: string | null;
  settings: UserSettings;
  created_at: string;
  updated_at: string;
}

export interface UserAddress {
  id: string;
  session_id: string;
  label: string;
  line1: string;
  line2: string | null;
  city: string;
  zone: string | null;
  is_default: boolean;
  created_at: string;
}

export interface UserPaymentCard {
  id: string;
  session_id: string;
  label: string;
  brand: string;
  last4: string;
  exp_month: string;
  exp_year: string;
  cardholder: string;
  is_default: boolean;
  created_at: string;
}

const DEFAULT_SETTINGS: UserSettings = {
  emailNotifications: true,
  orderUpdates: true,
  designTips: true,
  marketingEmails: false,
  petFriendlyDefault: false,
  lowMaintenanceDefault: true,
};

function mapProfile(row: any): DbUserProfile {
  return {
    session_id: row.session_id,
    name: row.name ?? "",
    email: row.email ?? "",
    phone: row.phone ?? "",
    workspace: row.workspace ?? "Work",
    avatarUrl: row.avatar_url ?? null,
    settings: { ...DEFAULT_SETTINGS, ...(row.settings ?? {}) },
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

export async function getProfileBySession(
  sessionId: string
): Promise<DbUserProfile | null> {
  const { data, error } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("session_id", sessionId)
    .maybeSingle();

  if (error) {
    console.error("Error fetching profile:", error);
    return null;
  }

  return data ? mapProfile(data) : null;
}

export async function upsertProfile(
  sessionId: string,
  profile: Partial<UserProfile> & { avatarUrl?: string | null; settings?: UserSettings }
): Promise<DbUserProfile> {
  const payload: Record<string, unknown> = {
    session_id: sessionId,
    updated_at: new Date().toISOString(),
  };

  if (profile.name !== undefined) payload.name = profile.name;
  if (profile.email !== undefined) payload.email = profile.email;
  if (profile.phone !== undefined) payload.phone = profile.phone;
  if (profile.workspace !== undefined) payload.workspace = profile.workspace;
  if (profile.avatarUrl !== undefined) payload.avatar_url = profile.avatarUrl;
  if (profile.settings !== undefined) payload.settings = profile.settings;

  const { data, error } = await supabase
    .from("user_profiles")
    .upsert(payload, { onConflict: "session_id" })
    .select()
    .single();

  if (error) {
    console.error("Error upserting profile:", error);
    throw error;
  }

  return mapProfile(data);
}

export async function getAddressesBySession(
  sessionId: string
): Promise<UserAddress[]> {
  const { data, error } = await supabase
    .from("user_addresses")
    .select("*")
    .eq("session_id", sessionId)
    .order("is_default", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching addresses:", error);
    return [];
  }

  return (data ?? []) as UserAddress[];
}

export async function addAddress(
  sessionId: string,
  address: Omit<UserAddress, "id" | "session_id" | "created_at">
): Promise<UserAddress> {
  if (address.is_default) {
    await supabase
      .from("user_addresses")
      .update({ is_default: false })
      .eq("session_id", sessionId);
  }

  const { data, error } = await supabase
    .from("user_addresses")
    .insert({ session_id: sessionId, ...address })
    .select()
    .single();

  if (error) {
    console.error("Error adding address:", error);
    throw error;
  }

  return data as UserAddress;
}

export async function deleteAddress(id: string): Promise<void> {
  const { error } = await supabase.from("user_addresses").delete().eq("id", id);
  if (error) {
    console.error("Error deleting address:", error);
    throw error;
  }
}

export async function setDefaultAddress(
  sessionId: string,
  id: string
): Promise<void> {
  await supabase
    .from("user_addresses")
    .update({ is_default: false })
    .eq("session_id", sessionId);

  const { error } = await supabase
    .from("user_addresses")
    .update({ is_default: true })
    .eq("id", id);

  if (error) {
    console.error("Error setting default address:", error);
    throw error;
  }
}

export async function getCardsBySession(
  sessionId: string
): Promise<UserPaymentCard[]> {
  const { data, error } = await supabase
    .from("user_payment_cards")
    .select("*")
    .eq("session_id", sessionId)
    .order("is_default", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching cards:", error);
    return [];
  }

  return (data ?? []) as UserPaymentCard[];
}

export async function addPaymentCard(
  sessionId: string,
  card: Omit<UserPaymentCard, "id" | "session_id" | "created_at">
): Promise<UserPaymentCard> {
  if (card.is_default) {
    await supabase
      .from("user_payment_cards")
      .update({ is_default: false })
      .eq("session_id", sessionId);
  }

  const { data, error } = await supabase
    .from("user_payment_cards")
    .insert({ session_id: sessionId, ...card })
    .select()
    .single();

  if (error) {
    console.error("Error adding card:", error);
    throw error;
  }

  return data as UserPaymentCard;
}

export async function deletePaymentCard(id: string): Promise<void> {
  const { error } = await supabase
    .from("user_payment_cards")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error deleting card:", error);
    throw error;
  }
}

export async function setDefaultCard(
  sessionId: string,
  id: string
): Promise<void> {
  await supabase
    .from("user_payment_cards")
    .update({ is_default: false })
    .eq("session_id", sessionId);

  const { error } = await supabase
    .from("user_payment_cards")
    .update({ is_default: true })
    .eq("id", id);

  if (error) {
    console.error("Error setting default card:", error);
    throw error;
  }
}

export function formatAddressLine(address: UserAddress): string {
  const parts = [address.line1, address.line2, address.city, address.zone].filter(
    Boolean
  );
  return parts.join(", ");
}
