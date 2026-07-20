import { supabase } from "@/lib/supabase";

const SESSION_STORAGE_KEY = "verdea_session_id";

/**
 * Anonymous per-browser id (localStorage). Used for guests and as a migration
 * source when the user later signs in on this device.
 */
export function getBrowserSessionId(): string {
  if (typeof window === "undefined") return "server";

  let sessionId = localStorage.getItem(SESSION_STORAGE_KEY);
  if (!sessionId) {
    sessionId = `session-${crypto.randomUUID()}`;
    localStorage.setItem(SESSION_STORAGE_KEY, sessionId);
  }
  return sessionId;
}

/** @deprecated Prefer getAccountOwnerId() for account data. */
export function getOrCreateSessionId(): string {
  return getBrowserSessionId();
}

/**
 * Stable account key for profiles, addresses and cards:
 * - signed-in → `user:<supabase auth uuid>` (same across browsers)
 * - guest → browser session id
 */
export async function getAccountOwnerId(): Promise<string> {
  if (typeof window === "undefined") return "server";

  const { data } = await supabase.auth.getUser();
  if (data.user?.id) {
    return `user:${data.user.id}`;
  }
  return getBrowserSessionId();
}

export function accountOwnerIdFromUserId(userId: string): string {
  return `user:${userId}`;
}
