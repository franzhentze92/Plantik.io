"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Leaf } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { authErrorMessage } from "@/lib/auth-errors";

function AuthCallbackHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function finish() {
      const oauthError = searchParams.get("error_description") || searchParams.get("error");
      if (oauthError) {
        if (active) setError(authErrorMessage(decodeURIComponent(oauthError)));
        return;
      }

      const next = searchParams.get("next");
      const destination = next?.startsWith("/") ? next : "/app";
      const code = searchParams.get("code");

      if (code) {
        const { error: exchangeError } =
          await supabase.auth.exchangeCodeForSession(code);
        if (exchangeError) {
          if (active) setError(authErrorMessage(exchangeError.message));
          return;
        }
        router.replace(destination);
        return;
      }

      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) {
        router.replace(destination);
        return;
      }

      if (active) {
        setError("No se pudo completar el inicio de sesión. Inténtalo de nuevo.");
      }
    }

    void finish();
    return () => {
      active = false;
    };
  }, [router, searchParams]);

  if (error) {
    return (
      <div className="mx-auto max-w-md text-center">
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
          {error}
        </p>
        <Link
          href="/login"
          className="mt-6 inline-flex rounded-full bg-brand-forest px-5 py-2.5 text-sm font-semibold text-white"
        >
          Volver a iniciar sesión
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4 text-center">
      <span className="flex h-14 w-14 animate-pulse items-center justify-center rounded-full bg-brand-sage text-brand-forest">
        <Leaf className="h-7 w-7" />
      </span>
      <p className="text-sm text-brand-carbon/65">Conectando tu cuenta…</p>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-cream px-4">
      <Suspense
        fallback={
          <p className="text-sm text-brand-carbon/65">Conectando tu cuenta…</p>
        }
      >
        <AuthCallbackHandler />
      </Suspense>
    </div>
  );
}
