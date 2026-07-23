"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowRight,
  Lock,
  Mail,
  ShieldCheck,
  Sprout,
  User,
} from "lucide-react";
import {
  AuthFormCard,
  AuthIconField,
  AuthPageLayout,
} from "@/components/marketing/AuthPageLayout";
import { AuthProviderDivider } from "@/components/auth/AuthProviderDivider";
import { GoogleAuthButton } from "@/components/auth/GoogleAuthButton";
import { useAuthStore, useProfileStore } from "@/lib/store";
import { supabase } from "@/lib/supabase";
import { authErrorMessage } from "@/lib/auth-errors";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next");
  const login = useAuthStore((s) => s.login);
  const updateProfile = useProfileStore((s) => s.updateProfile);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ email: "", password: "" });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: form.email.trim(),
      password: form.password,
    });
    if (signInError) {
      setError(authErrorMessage(signInError.message));
      setLoading(false);
      return;
    }
    login(form.email.trim());
    if (form.email) updateProfile({ email: form.email.trim() });
    const destination = next?.startsWith("/") ? next : "/app";
    router.push(destination);
  }

  const registerHref = next
    ? `/registro?next=${encodeURIComponent(next)}`
    : "/registro";

  return (
    <AuthPageLayout
      eyebrow="Iniciar sesión"
      title="Tu espacio verde te espera"
      subtitle="Accede a tus propuestas, favoritos y compras. Todo en un solo lugar."
    >
      <AuthFormCard
        icon={Sprout}
        title="Bienvenido de vuelta"
        subtitle="Ingresa con tu correo y contraseña, o usa Google."
      >
        <GoogleAuthButton nextPath={next} label="Continuar con Google" />
        <AuthProviderDivider label="o con correo" />

        <form onSubmit={handleSubmit} className="space-y-4">
          <AuthIconField
            label="Correo"
            icon={Mail}
            type="email"
            value={form.email}
            onChange={(v) => setForm((f) => ({ ...f, email: v }))}
            placeholder="tucorreo@ejemplo.com"
            autoComplete="email"
            required
          />
          <AuthIconField
            label="Contraseña"
            icon={Lock}
            type="password"
            value={form.password}
            onChange={(v) => setForm((f) => ({ ...f, password: v }))}
            placeholder="••••••••"
            autoComplete="current-password"
            required
          />

          <div className="flex justify-end">
            <button
              type="button"
              className="text-xs font-medium text-brand-forest hover:opacity-70"
            >
              ¿Olvidaste tu contraseña?
            </button>
          </div>

          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-600">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-brand-forest px-5 py-3 text-sm font-semibold text-white shadow-card transition-colors hover:bg-brand-forest/90 disabled:opacity-60"
          >
            {loading ? "Ingresando…" : "Iniciar sesión"}
            {!loading && <ArrowRight className="h-4 w-4" />}
          </button>

          <p className="flex items-center justify-center gap-1.5 text-xs text-brand-carbon/50">
            <ShieldCheck className="h-3.5 w-3.5 text-brand-forest" />
            Conexión segura y cifrada.
          </p>
        </form>

        <p className="mt-6 text-center text-sm text-brand-carbon/55">
          ¿No tienes cuenta?{" "}
          <Link href={registerHref} className="font-semibold text-brand-forest hover:opacity-70">
            Regístrate gratis
          </Link>
        </p>
        <p className="mt-3 text-center text-sm">
          <Link
            href="/app"
            className="text-brand-carbon/45 transition-colors hover:text-brand-forest"
          >
            Continuar como invitado
          </Link>
        </p>
      </AuthFormCard>
    </AuthPageLayout>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
