"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bell, Leaf, Shield, SlidersHorizontal, User } from "lucide-react";
import { track } from "@/lib/analytics";
import { getOrCreateSessionId } from "@/lib/session";
import { upsertProfile } from "@/lib/supabase/account";
import {
  AccountPageHeader,
  QuickLinkRow,
  SettingsCard,
  SettingsToggle,
} from "@/components/account/AccountSections";
import { useSettingsStore } from "@/lib/store";

export default function SettingsPage() {
  const [mounted, setMounted] = useState(false);
  const settings = useSettingsStore((s) => s.settings);
  const updateSettings = useSettingsStore((s) => s.updateSettings);

  useEffect(() => {
    setMounted(true);
    track("page_view", { route: "/app/ajustes" });
  }, []);

  async function persistSettings(patch: Partial<typeof settings>) {
    const next = { ...settings, ...patch };
    updateSettings(patch);
    try {
      const sessionId = getOrCreateSessionId();
      await upsertProfile(sessionId, { settings: next });
    } catch (err) {
      console.error("Error saving settings:", err);
    }
  }

  if (!mounted) {
    return (
      <div className="container-app py-16">
        <p className="text-brand-carbon/60">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="container-app py-10">
      <AccountPageHeader
        eyebrow="Ajustes"
        title="Preferencias"
        description="Personaliza notificaciones, recomendaciones y cómo exploras el catálogo."
      />

      <div className="mt-8 grid gap-5 lg:grid-cols-2">
        <SettingsCard
          title="Notificaciones"
          description="Elige qué actualizaciones quieres recibir por correo."
        >
          <div className="space-y-3">
            <SettingsToggle
              label="Notificaciones por correo"
              description="Avisos generales de tu cuenta Plantik."
              checked={settings.emailNotifications}
              onChange={(emailNotifications) =>
                persistSettings({ emailNotifications })
              }
            />
            <SettingsToggle
              label="Actualizaciones de pedidos"
              description="Confirmaciones y estado de envío."
              checked={settings.orderUpdates}
              onChange={(orderUpdates) => persistSettings({ orderUpdates })}
            />
            <SettingsToggle
              label="Consejos de diseño"
              description="Ideas para mejorar tus espacios con plantas."
              checked={settings.designTips}
              onChange={(designTips) => persistSettings({ designTips })}
            />
            <SettingsToggle
              label="Novedades y promociones"
              description="Ofertas especiales y lanzamientos."
              checked={settings.marketingEmails}
              onChange={(marketingEmails) => persistSettings({ marketingEmails })}
            />
          </div>
        </SettingsCard>

        <SettingsCard
          title="Preferencias del catálogo"
          description="Ajusta filtros sugeridos al explorar plantas."
        >
          <div className="space-y-3">
            <SettingsToggle
              label="Priorizar pet friendly"
              description="Destaca plantas seguras para mascotas."
              checked={settings.petFriendlyDefault}
              onChange={(petFriendlyDefault) =>
                persistSettings({ petFriendlyDefault })
              }
            />
            <SettingsToggle
              label="Priorizar bajo mantenimiento"
              description="Muestra primero opciones fáciles de cuidar."
              checked={settings.lowMaintenanceDefault}
              onChange={(lowMaintenanceDefault) =>
                persistSettings({ lowMaintenanceDefault })
              }
            />
          </div>
        </SettingsCard>

        <SettingsCard
          title="Cuenta"
          description="Accesos rápidos relacionados con tu perfil."
        >
          <div className="space-y-3">
            <QuickLinkRow
              icon={User}
              label="Mi perfil"
              href="/app/perfil"
              description="Editar nombre, correo y espacio de trabajo."
            />
            <QuickLinkRow
              icon={Bell}
              label="Mis pedidos"
              href="/app/pedidos"
              description="Historial de compras y confirmaciones."
            />
            <QuickLinkRow
              icon={Leaf}
              label="Mis propuestas"
              href="/app/propuestas"
              description="Plantas guardadas y diseños de espacio."
            />
          </div>
        </SettingsCard>

        <SettingsCard
          title="Privacidad y soporte"
          description="Información sobre tus datos en Plantik."
        >
          <div className="space-y-3">
            <div className="flex items-start gap-3 rounded-xl border border-brand-beige/60 bg-brand-cream/30 px-4 py-3">
              <Shield className="mt-0.5 h-4 w-4 shrink-0 text-brand-forest" />
              <p className="text-xs leading-relaxed text-brand-carbon/65">
                Tu perfil, direcciones y preferencias se sincronizan con tu
                sesión en Plantik. Los pedidos se guardan en este dispositivo
                hasta que conectemos el pago real.
              </p>
            </div>
            <Link
              href="/app/ayuda"
              className="inline-flex items-center gap-2 text-sm font-semibold text-brand-forest hover:opacity-70"
            >
              <SlidersHorizontal className="h-4 w-4" />
              Centro de ayuda
            </Link>
          </div>
        </SettingsCard>
      </div>
    </div>
  );
}
