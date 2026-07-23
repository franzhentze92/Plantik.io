import { supabase } from "@/lib/supabase";

function appOrigin(): string {
  if (typeof window !== "undefined") return window.location.origin;
  return process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") || "http://localhost:3000";
}

export function buildAuthCallbackUrl(nextPath?: string | null): string {
  const next = nextPath?.startsWith("/") ? nextPath : "/app";
  return `${appOrigin()}/auth/callback?next=${encodeURIComponent(next)}`;
}

export async function signInWithGoogle(nextPath?: string | null) {
  return supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: buildAuthCallbackUrl(nextPath),
      queryParams: {
        access_type: "online",
        prompt: "select_account",
      },
    },
  });
}

export function profileFromAuthMetadata(
  metadata: Record<string, unknown> | undefined
): { name: string; avatarUrl: string | null } {
  const name = String(metadata?.full_name || metadata?.name || "").trim();
  const avatarUrl =
    (metadata?.avatar_url as string | undefined) ||
    (metadata?.picture as string | undefined) ||
    null;
  return { name, avatarUrl };
}
