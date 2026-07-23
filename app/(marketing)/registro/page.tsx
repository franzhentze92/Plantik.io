"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowRight,
  Lock,
  Mail,
  ShieldCheck,
  Sparkles,
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

const SIGNUP_BENEFITS = [
  "Cuenta gratis — sin tarjeta para empezar",
  "Diseña tu espacio con Plantik en menos de 2 minutos",
  "Explora y compra del catálogo completo",
  "Guarda favoritos y propuestas para decidir con calma",
];

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next");
  const login = useAuthStore((s) => s.login);
  const updateProfile = useProfileStore((s) => s.updateProfile);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", email: "", password: "" });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const email = form.email.trim().toLowerCase();

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/auth-signup`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          },
          body: JSON.stringify({
            email,
            password: form.password,
            name: form.name.trim(),
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        setError(authErrorMessage(result.error || "No se pudo crear la cuenta"));
        return;
      }

      if (result.session) {
        await supabase.auth.setSession({
          access_token: result.session.access_token,
          refresh_token: result.session.refresh_token,
        });
      }

      login(email);
      updateProfile({
        ...(form.name ? { name: form.name.trim() } : {}),
        email,
      });
      const destination = next?.startsWith("/") ? next : "/app";
      router.push(destination);
    } catch {
      setError("No se pudo crear la cuenta. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  const loginHref = next
    ? `/login?next=${encodeURIComponent(next)}`
    : "/login";

  return (
    <AuthPageLayout
      eyebrow="Crear cuenta"
      title="Empieza a diseñar tu espacio hoy"
      subtitle="Únete a Plantik y transforma cualquier rincón con plantas que realmente funcionan."
      benefits={SIGNUP_BENEFITS}
    >
      <AuthFormCard
        icon={Sparkles}
        title="Crea tu cuenta"
        subtitle="Con Google en un clic, o con tu correo abajo. Sin verificación por email."
      >
        <GoogleAuthButton nextPath={next} label="Registrarse con Google" />
        <AuthProviderDivider label="o con correo" />

        <form onSubmit={handleSubmit} className="space-y-4">
          <AuthIconField
            label="Nombre"
            icon={User}
            value={form.name}
            onChange={(v) => setForm((f) => ({ ...f, name: v }))}
            placeholder="Tu nombre"
            autoComplete="name"
            required
          />
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
            placeholder="Mínimo 8 caracteres"
            autoComplete="new-password"
            required
          />

          <p className="text-[11px] leading-relaxed text-brand-carbon/50">
            Al registrarte aceptas nuestros{" "}
            <Link href="/terminos" className="font-medium text-brand-forest hover:opacity-70">
              términos de uso
            </Link>{" "}
            y{" "}
            <Link href="/privacidad" className="font-medium text-brand-forest hover:opacity-70">
              política de privacidad
            </Link>
            . No compartimos tu información con terceros.
          </p>

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
            {loading ? "Creando cuenta…" : "Crear cuenta gratis"}
            {!loading && <ArrowRight className="h-4 w-4" />}
          </button>

          <p className="flex items-center justify-center gap-1.5 text-xs text-brand-carbon/50">
            <ShieldCheck className="h-3.5 w-3.5 text-brand-forest" />
            Tu información está segura con nosotros.
          </p>
        </form>

        <p className="mt-6 text-center text-sm text-brand-carbon/55">
          ¿Ya tienes cuenta?{" "}
          <Link href={loginHref} className="font-semibold text-brand-forest hover:opacity-70">
            Inicia sesión
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

export default function SignupPage() {
  return (
    <Suspense fallback={null}>
      <SignupForm />
    </Suspense>
  );
}
