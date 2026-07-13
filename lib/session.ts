const SESSION_STORAGE_KEY = "verdea_session_id";

/**
 * Without real auth, "my proposals" is scoped to a stable per-browser
 * session id persisted in localStorage — previously every save minted a
 * fresh `session-${Date.now()}` id, so nothing could ever be looked up
 * again by session.
 */
export function getOrCreateSessionId(): string {
  if (typeof window === "undefined") return "server";

  let sessionId = localStorage.getItem(SESSION_STORAGE_KEY);
  if (!sessionId) {
    sessionId = `session-${crypto.randomUUID()}`;
    localStorage.setItem(SESSION_STORAGE_KEY, sessionId);
  }
  return sessionId;
}
