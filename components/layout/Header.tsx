"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShoppingCart, Leaf, Bell, Search, ChevronDown, Home } from "lucide-react";
import {
  useCartStore,
  getProfileInitials,
  useProfileStore,
  useAuthStore,
} from "@/lib/store";

export function Header() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [bump, setBump] = useState(false);
  const cartCount = useCartStore((s) =>
    s.items.reduce((sum, i) => sum + i.qty, 0)
  );
  const prevCount = useRef(cartCount);
  const profile = useProfileStore((s) => s.profile);
  const logout = useAuthStore((s) => s.logout);

  useEffect(() => setMounted(true), []);

  function handleLogout() {
    setMenuOpen(false);
    logout();
    router.push("/");
  }

  useEffect(() => {
    if (cartCount > prevCount.current) {
      setBump(true);
      const timeout = setTimeout(() => setBump(false), 400);
      prevCount.current = cartCount;
      return () => clearTimeout(timeout);
    }
    prevCount.current = cartCount;
  }, [cartCount]);

  const initials = mounted ? getProfileInitials(profile.name) : "V";
  const workspaceLabel = mounted ? profile.workspace || "Work" : "Work";

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    router.push(q ? `/app/plantas?q=${encodeURIComponent(q)}` : "/app/plantas");
  }

  return (
    <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-brand-beige/60 bg-brand-cream/90 px-4 py-3 backdrop-blur lg:px-8">
      <Link href="/app" className="flex items-center gap-2 lg:hidden">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-forest text-white">
          <Leaf className="h-4 w-4" />
        </span>
      </Link>

      <form onSubmit={handleSearch} className="relative flex-1 lg:max-w-md">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-carbon/40" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          type="search"
          placeholder="Buscar plantas, características o espacios..."
          className="w-full rounded-full border border-brand-beige bg-white py-2.5 pl-11 pr-4 text-sm text-brand-carbon placeholder:text-brand-carbon/40 shadow-soft focus:border-brand-forest/40 focus:outline-none"
        />
      </form>

      <div className="ml-auto flex items-center gap-2 sm:gap-3">
        <Link
          href="/"
          className="flex items-center gap-2 rounded-full border border-brand-beige bg-white px-3 py-2 text-sm font-medium text-brand-carbon/80 shadow-soft transition-colors hover:border-brand-forest/40 hover:text-brand-forest sm:px-4 sm:py-2.5"
        >
          <Home className="h-4 w-4" />
          <span className="hidden sm:inline">Inicio</span>
        </Link>

        <button
          type="button"
          aria-label="Notificaciones"
          className="relative flex h-10 w-10 items-center justify-center rounded-full border border-brand-beige bg-white text-brand-carbon/70 shadow-soft transition-colors hover:text-brand-forest"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute right-2.5 top-2.5 h-1.5 w-1.5 rounded-full bg-brand-terracotta" />
        </button>

        <div className="relative hidden lg:block">
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            className="flex items-center gap-2 rounded-full border border-brand-beige bg-white py-1.5 pl-1.5 pr-2.5 text-sm font-medium text-brand-carbon shadow-soft transition-colors hover:border-brand-forest/40 sm:pr-3"
          >
            <span className="flex h-7 w-7 items-center justify-center overflow-hidden rounded-full bg-brand-forest text-xs font-semibold text-white">
              {profile.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={profile.avatarUrl}
                  alt={profile.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                initials
              )}
            </span>
            <span className="hidden max-w-[5rem] truncate sm:inline">
              {workspaceLabel}
            </span>
            <ChevronDown
              className={`h-4 w-4 text-brand-carbon/50 transition-transform ${
                menuOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {menuOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setMenuOpen(false)}
              />
              <div className="absolute right-0 z-20 mt-2 w-48 overflow-hidden rounded-xl2 border border-brand-beige bg-white py-1 shadow-card">
                <Link
                  href="/app/perfil"
                  className="block px-4 py-2 text-sm text-brand-carbon/80 hover:bg-brand-sage/60"
                  onClick={() => setMenuOpen(false)}
                >
                  Mi perfil
                </Link>
                <Link
                  href="/app/ajustes"
                  className="block px-4 py-2 text-sm text-brand-carbon/80 hover:bg-brand-sage/60"
                  onClick={() => setMenuOpen(false)}
                >
                  Ajustes
                </Link>
                <div className="my-1 border-t border-brand-beige/60" />
                <Link
                  href="/app/propuestas"
                  className="block px-4 py-2 text-sm text-brand-carbon/80 hover:bg-brand-sage/60"
                  onClick={() => setMenuOpen(false)}
                >
                  Mis propuestas
                </Link>
                <Link
                  href="/app/pedidos"
                  className="block px-4 py-2 text-sm text-brand-carbon/80 hover:bg-brand-sage/60"
                  onClick={() => setMenuOpen(false)}
                >
                  Mis pedidos
                </Link>
                <Link
                  href="/app/ayuda"
                  className="block px-4 py-2 text-sm text-brand-carbon/80 hover:bg-brand-sage/60"
                  onClick={() => setMenuOpen(false)}
                >
                  Ayuda
                </Link>
                <div className="my-1 border-t border-brand-beige/60" />
                <button
                  type="button"
                  onClick={handleLogout}
                  className="block w-full px-4 py-2 text-left text-sm text-brand-carbon/80 hover:bg-brand-sage/60"
                >
                  Cerrar sesión
                </button>
              </div>
            </>
          )}
        </div>

        <Link
          href="/app/carrito"
          className={`flex items-center gap-2 rounded-full bg-brand-forest px-4 py-2.5 text-sm font-semibold text-white shadow-card transition-transform hover:-translate-y-0.5 ${
            bump ? "-translate-y-0.5" : ""
          }`}
        >
          <ShoppingCart className="h-4 w-4" />
          <span className="hidden sm:inline">Carrito</span>
          <span
            className={`flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-xs font-bold transition-all duration-300 ${
              bump
                ? "scale-125 bg-white text-brand-forest"
                : "scale-100 bg-white/20 text-white"
            }`}
          >
            {mounted ? cartCount : 0}
          </span>
        </Link>
      </div>
    </header>
  );
}
