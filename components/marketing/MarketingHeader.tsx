"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Leaf,
  LogOut,
  Menu,
  Send,
  User,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/lib/store";

const links = [
  { href: "/", label: "Inicio" },
  { href: "/sobre-nosotros", label: "Sobre nosotros" },
  { href: "/productos", label: "Productos" },
  { href: "/como-funciona", label: "Cómo funciona" },
  { href: "/contacto", label: "Contacto" },
];

// Routes that use the light (dashboard-aligned) theme for the marketing chrome.
const LIGHT_ROUTES = ["/", "/contacto", "/como-funciona", "/productos", "/sobre-nosotros", "/login", "/registro", "/terminos", "/privacidad"];

export function MarketingHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const logout = useAuthStore((s) => s.logout);
  const light =
    LIGHT_ROUTES.includes(pathname) || pathname.startsWith("/productos/");

  useEffect(() => setMounted(true), []);

  const authed = mounted && isAuthenticated;

  function handleLogout() {
    logout();
    setOpen(false);
  }

  return (
    <header className="sticky top-0 z-50">
      <div
        className={cn(
          "border-b",
          light
            ? "border-brand-beige/60 bg-white"
            : "mkt-glass border-white/5 backdrop-blur"
        )}
      >
        <div className="flex items-center justify-between px-4 py-3.5 sm:px-6 lg:px-10 xl:px-12">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-forest">
              <Leaf className="h-5 w-5 text-white" />
            </span>
            <span
              className={cn(
                "text-xl font-bold tracking-tight",
                light ? "text-brand-forest" : "text-white"
              )}
            >
              PLANTIK
            </span>
          </Link>

          <nav className="hidden items-center gap-8 lg:flex">
            {links.map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "border-b-2 pb-0.5 text-sm font-medium transition-colors",
                    light
                      ? active
                        ? "border-brand-forest text-brand-forest"
                        : "border-transparent text-brand-carbon/70 hover:text-brand-forest"
                      : active
                        ? "border-tech-lime text-tech-lime"
                        : "border-transparent text-white/70 hover:text-white"
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="hidden items-center gap-3 lg:flex">
            {authed ? (
              <>
                <Link
                  href="/app"
                  className={cn(
                    "inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-transform hover:-translate-y-0.5",
                    light
                      ? "bg-brand-forest text-white shadow-card"
                      : "bg-tech-lime text-tech-ink shadow-[0_0_24px_rgba(166,255,60,0.35)]"
                  )}
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Ir al dashboard
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className={cn(
                    "inline-flex items-center gap-2 text-sm font-medium",
                    light
                      ? "text-brand-carbon/80 hover:text-brand-forest"
                      : "text-white/80 hover:text-white"
                  )}
                >
                  Cerrar sesión
                  <span
                    className={cn(
                      "flex h-7 w-7 items-center justify-center rounded-full border",
                      light
                        ? "border-brand-beige text-brand-forest"
                        : "border-white/20 text-white"
                    )}
                  >
                    <LogOut className="h-3.5 w-3.5" />
                  </span>
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className={cn(
                    "inline-flex items-center gap-2 text-sm font-medium",
                    light
                      ? "text-brand-carbon/80 hover:text-brand-forest"
                      : "text-white/80 hover:text-white"
                  )}
                >
                  Iniciar sesión
                  <span
                    className={cn(
                      "flex h-7 w-7 items-center justify-center rounded-full border",
                      light
                        ? "border-brand-beige text-brand-forest"
                        : "border-white/20 text-white"
                    )}
                  >
                    <User className="h-3.5 w-3.5" />
                  </span>
                </Link>
                <Link
                  href="/registro"
                  className={cn(
                    "inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-transform hover:-translate-y-0.5",
                    light
                      ? "bg-brand-forest text-white shadow-card"
                      : "bg-tech-lime text-tech-ink shadow-[0_0_24px_rgba(166,255,60,0.35)]"
                  )}
                >
                  <Send className="h-4 w-4" />
                  Registrarse
                </Link>
              </>
            )}
          </div>

          <button
            onClick={() => setOpen((v) => !v)}
            aria-label="Abrir menú"
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-full lg:hidden",
              light ? "text-brand-forest" : "text-white"
            )}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div
          className={cn(
            "border-b px-4 py-4 lg:hidden",
            light
              ? "border-brand-beige/60 bg-white"
              : "mkt-glass border-white/5 backdrop-blur"
          )}
        >
          <nav className="flex flex-col gap-1">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "rounded-lg px-3 py-2.5 text-sm font-medium",
                  light
                    ? "text-brand-carbon/80 hover:bg-brand-sage/60 hover:text-brand-forest"
                    : "text-white/80 hover:bg-white/5 hover:text-white"
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div
            className={cn(
              "mt-3 flex items-center gap-3 border-t pt-3",
              light ? "border-brand-beige/60" : "border-white/10"
            )}
          >
            {authed ? (
              <>
                <Link
                  href="/app"
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex flex-1 items-center justify-center gap-2 rounded-full px-4 py-2.5 text-center text-sm font-semibold",
                    light
                      ? "bg-brand-forest text-white"
                      : "bg-tech-lime text-tech-ink"
                  )}
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className={cn(
                    "flex flex-1 items-center justify-center gap-2 rounded-full border px-4 py-2.5 text-center text-sm font-medium",
                    light
                      ? "border-brand-beige text-brand-forest"
                      : "border-white/15 text-white"
                  )}
                >
                  <LogOut className="h-4 w-4" />
                  Cerrar sesión
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex-1 rounded-full border px-4 py-2.5 text-center text-sm font-medium",
                    light
                      ? "border-brand-beige text-brand-forest"
                      : "border-white/15 text-white"
                  )}
                >
                  Iniciar sesión
                </Link>
                <Link
                  href="/registro"
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex-1 rounded-full px-4 py-2.5 text-center text-sm font-semibold",
                    light
                      ? "bg-brand-forest text-white"
                      : "bg-tech-lime text-tech-ink"
                  )}
                >
                  Registrarse
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
