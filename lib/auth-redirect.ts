/** Default landing route after sign-in or sign-up. */
export const AUTH_DASHBOARD_PATH = "/app";

/** Where to send the user after auth — always the app dashboard unless `next` is an in-app path. */
export function resolvePostAuthPath(next?: string | null): string {
  if (!next?.startsWith("/")) return AUTH_DASHBOARD_PATH;
  if (next === AUTH_DASHBOARD_PATH || next.startsWith("/app/")) return next;
  return AUTH_DASHBOARD_PATH;
}
