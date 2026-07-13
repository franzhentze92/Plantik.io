"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Clock, Leaf, Mail, Phone } from "lucide-react";
import { SITE_CONTACT } from "@/data/site";
import { cn } from "@/lib/utils";

const columns = [
  {
    title: "Producto",
    links: [
      { href: "/productos", label: "Productos" },
      { href: "/como-funciona", label: "Cómo funciona" },
    ],
  },
  {
    title: "Compañía",
    links: [
      { href: "/sobre-nosotros", label: "Sobre nosotros" },
      { href: "/contacto", label: "Contacto" },
    ],
  },
  {
    title: "Cuenta",
    links: [
      { href: "/login", label: "Iniciar sesión" },
      { href: "/registro", label: "Registrarse" },
      { href: "/app", label: "Ir a la plataforma" },
    ],
  },
];

const LIGHT_ROUTES = [
  "/",
  "/contacto",
  "/como-funciona",
  "/productos",
  "/sobre-nosotros",
  "/login",
  "/registro",
  "/terminos",
  "/privacidad",
];

export function MarketingFooter() {
  const pathname = usePathname();
  const light =
    LIGHT_ROUTES.includes(pathname) || pathname.startsWith("/productos/");

  return (
    <footer
      className={cn(
        "border-t px-4 py-14 sm:px-6 lg:px-10 xl:px-12",
        light
          ? "border-brand-beige bg-brand-cream"
          : "border-white/5 bg-tech-canopy"
      )}
    >
      <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-2.5">
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
          </div>
          <p
            className={cn(
              "mt-4 max-w-xs text-sm",
              light ? "text-brand-carbon/60" : "text-white/50"
            )}
          >
            Plantas y todo lo que necesitan para transformar cada espacio.
          </p>

          <ul className="mt-6 space-y-3">
            <li>
              <a
                href={SITE_CONTACT.emailHref}
                className={cn(
                  "inline-flex items-center gap-2 text-sm transition-colors",
                  light
                    ? "text-brand-carbon/65 hover:text-brand-forest"
                    : "text-white/60 hover:text-white"
                )}
              >
                <Mail className="h-4 w-4 shrink-0" />
                {SITE_CONTACT.email}
              </a>
            </li>
            <li>
              <a
                href={SITE_CONTACT.phoneHref}
                className={cn(
                  "inline-flex items-center gap-2 text-sm transition-colors",
                  light
                    ? "text-brand-carbon/65 hover:text-brand-forest"
                    : "text-white/60 hover:text-white"
                )}
              >
                <Phone className="h-4 w-4 shrink-0" />
                {SITE_CONTACT.phone}
              </a>
            </li>
            <li
              className={cn(
                "flex items-start gap-2 text-sm",
                light ? "text-brand-carbon/55" : "text-white/50"
              )}
            >
              <Clock className="mt-0.5 h-4 w-4 shrink-0" />
              {SITE_CONTACT.hours}
            </li>
          </ul>
        </div>

        {columns.map((col) => (
          <div key={col.title}>
            <p className={light ? "eyebrow" : "mkt-eyebrow"}>{col.title}</p>
            <ul className="mt-4 space-y-2.5">
              {col.links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={cn(
                      "text-sm",
                      light
                        ? "text-brand-carbon/65 hover:text-brand-forest"
                        : "text-white/60 hover:text-white"
                    )}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div
        className={cn(
          "mt-12 flex flex-col items-center justify-between gap-4 border-t pt-6 text-xs sm:flex-row",
          light
            ? "border-brand-beige/70 text-brand-carbon/45"
            : "border-white/5 text-white/40"
        )}
      >
        <p>© {new Date().getFullYear()} Plantik. Plantas. Diseño. Bienestar.</p>
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
          <Link
            href="/terminos"
            className={cn(
              "transition-colors",
              light ? "hover:text-brand-forest" : "hover:text-white"
            )}
          >
            Términos de uso
          </Link>
          <span aria-hidden="true">·</span>
          <Link
            href="/privacidad"
            className={cn(
              "transition-colors",
              light ? "hover:text-brand-forest" : "hover:text-white"
            )}
          >
            Política de privacidad
          </Link>
        </div>
      </div>
    </footer>
  );
}
