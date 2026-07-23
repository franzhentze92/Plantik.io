import { createClient } from "@supabase/supabase-js";
import { isAdminEmail } from "@/lib/admin";

type AdminAuthResult =
  | { ok: true; email: string; userId: string }
  | { ok: false; status: number; error: string };

export async function requireAdmin(request: Request): Promise<AdminAuthResult> {
  const authHeader = request.headers.get("Authorization");
  const token = authHeader?.replace(/^Bearer\s+/i, "").trim();

  if (!token) {
    return { ok: false, status: 401, error: "No autenticado." };
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(token);

  if (error || !user?.email) {
    return { ok: false, status: 401, error: "Sesión inválida." };
  }

  if (!isAdminEmail(user.email)) {
    return { ok: false, status: 403, error: "Acceso denegado." };
  }

  return { ok: true, email: user.email, userId: user.id };
}
