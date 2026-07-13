"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/lib/store";
import { mobileNavTabs, type MobileNavTab } from "./nav-items";

export function MobileNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const logout = useAuthStore((s) => s.logout);

  const isLinkActive = (href: string) =>
    href === "/app" ? pathname === "/app" : pathname.startsWith(href);

  const isMenuActive = (tab: Extract<MobileNavTab, { kind: "menu" }>) =>
    tab.options.some((o) => pathname.startsWith(o.href));

  function handleLogout() {
    setOpenMenu(null);
    logout();
    router.push("/");
  }

  return (
    <>
      {openMenu && (
        <div
          className="fixed inset-0 z-40 bg-brand-carbon/20 backdrop-blur-[1px] lg:hidden"
          onClick={() => setOpenMenu(null)}
        />
      )}
      <nav
        className="fixed inset-x-0 bottom-0 z-50 flex items-stretch justify-between border-t border-brand-beige/70 bg-white/95 backdrop-blur lg:hidden"
        aria-label="Navegación principal"
      >
        {mobileNavTabs.map((tab) => {
          const Icon = tab.icon;

          if (tab.kind === "link") {
            const active = isLinkActive(tab.href);
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={cn(
                  "flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] font-medium",
                  active ? "text-brand-forest" : "text-brand-carbon/50"
                )}
              >
                <Icon className="h-5 w-5" />
                {tab.shortLabel}
              </Link>
            );
          }

          const open = openMenu === tab.id;
          const active = open || isMenuActive(tab);

          return (
            <div key={tab.id} className="relative flex flex-1">
              {open && (
                <div className="absolute bottom-full right-2 mb-2 w-56 overflow-hidden rounded-xl2 border border-brand-beige bg-white py-1 shadow-card">
                  {tab.options.map((option) => {
                    const OptionIcon = option.icon;
                    const optActive = pathname.startsWith(option.href);
                    return (
                      <Link
                        key={option.href}
                        href={option.href}
                        onClick={() => setOpenMenu(null)}
                        className={cn(
                          "flex items-center gap-3 px-4 py-2.5 text-sm",
                          optActive
                            ? "bg-brand-sage/60 text-brand-forest"
                            : "text-brand-carbon/80 hover:bg-brand-sage/60"
                        )}
                      >
                        <OptionIcon className="h-4 w-4 shrink-0" />
                        {option.label}
                      </Link>
                    );
                  })}
                  {tab.showLogout && (
                    <>
                      <div className="my-1 border-t border-brand-beige/60" />
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-brand-carbon/80 hover:bg-brand-sage/60"
                      >
                        <LogOut className="h-4 w-4 shrink-0" />
                        Cerrar sesión
                      </button>
                    </>
                  )}
                </div>
              )}
              <button
                type="button"
                onClick={() =>
                  setOpenMenu((current) => (current === tab.id ? null : tab.id))
                }
                aria-label={tab.shortLabel}
                aria-expanded={open}
                className={cn(
                  "flex w-full flex-col items-center gap-1 py-2.5 text-[11px] font-medium",
                  active ? "text-brand-forest" : "text-brand-carbon/50"
                )}
              >
                <Icon className="h-5 w-5" />
                {tab.shortLabel}
              </button>
            </div>
          );
        })}
      </nav>
    </>
  );
}
