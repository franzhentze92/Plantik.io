"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Shield } from "lucide-react";
import { isAdminEmail } from "@/lib/admin";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/lib/store";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const email = useAuthStore((s) => s.email);
  const [checked, setChecked] = useState(false);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    let active = true;

    supabase.auth.getUser().then(({ data }) => {
      if (!active) return;

      if (!data.user) {
        const next = pathname.startsWith("/app/admin")
          ? pathname
          : "/app/admin/pedidos";
        router.replace(`/login?next=${encodeURIComponent(next)}`);
        return;
      }

      const userEmail = data.user.email ?? email;
      const isAdmin = isAdminEmail(userEmail);
      setAllowed(isAdmin);
      setChecked(true);
      if (!isAdmin) router.replace("/app");
    });

    return () => {
      active = false;
    };
  }, [email, pathname, router]);

  if (!checked) {
    return (
      <div className="container-app py-16">
        <p className="text-brand-carbon/60">Verificando acceso...</p>
      </div>
    );
  }

  if (!allowed) return null;

  return (
    <div>
      <div className="border-b border-brand-beige/70 bg-brand-forest/5">
        <div className="container-app flex items-center gap-2 py-2 text-xs font-semibold text-brand-forest">
          <Shield className="h-3.5 w-3.5" />
          Panel de administración
        </div>
      </div>
      {children}
    </div>
  );
}
