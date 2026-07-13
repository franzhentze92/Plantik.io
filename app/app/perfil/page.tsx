"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Check, Settings } from "lucide-react";
import { track } from "@/lib/analytics";
import { getOrCreateSessionId } from "@/lib/session";
import {
  getAddressesBySession,
  getCardsBySession,
  upsertProfile,
  type UserAddress,
  type UserPaymentCard,
} from "@/lib/supabase/account";
import {
  AccountPageHeader,
  FormField,
  SettingsCard,
} from "@/components/account/AccountSections";
import { AvatarUpload } from "@/components/account/AvatarUpload";
import { AddressSection } from "@/components/account/AddressSection";
import { CardsSection } from "@/components/account/CardsSection";
import { useProfileStore } from "@/lib/store";

export default function ProfilePage() {
  const [mounted, setMounted] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [addresses, setAddresses] = useState<UserAddress[]>([]);
  const [cards, setCards] = useState<UserPaymentCard[]>([]);
  const profile = useProfileStore((s) => s.profile);
  const updateProfile = useProfileStore((s) => s.updateProfile);
  const [form, setForm] = useState(profile);

  useEffect(() => {
    setMounted(true);
    track("page_view", { route: "/app/perfil" });

    async function load() {
      const sessionId = getOrCreateSessionId();
      const [addrs, crds] = await Promise.all([
        getAddressesBySession(sessionId),
        getCardsBySession(sessionId),
      ]);
      setAddresses(addrs);
      setCards(crds);
    }
    load();
  }, []);

  useEffect(() => {
    setForm(profile);
  }, [profile]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const sessionId = getOrCreateSessionId();
      await upsertProfile(sessionId, {
        name: form.name,
        email: form.email,
        phone: form.phone,
        workspace: form.workspace,
        avatarUrl: form.avatarUrl,
      });
      updateProfile(form);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error("Error saving profile:", err);
    } finally {
      setSaving(false);
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
        eyebrow="Mi perfil"
        title="Tu cuenta"
        description="Administra tu información personal, foto, direcciones y tarjetas."
      />

      <div className="mt-8 grid gap-6 lg:grid-cols-[280px_1fr]">
        <aside className="card-surface flex flex-col items-center p-6 text-center">
          <AvatarUpload
            name={form.name}
            avatarUrl={form.avatarUrl}
            onChange={(avatarUrl) => setForm((f) => ({ ...f, avatarUrl }))}
          />
          <h2 className="mt-4 text-lg font-semibold text-brand-carbon">
            {form.name || "Usuario Plantik"}
          </h2>
          <p className="mt-1 text-sm text-brand-carbon/55">
            {form.email || "Sin correo"}
          </p>
          <span className="mt-3 rounded-full bg-brand-sage px-3 py-1 text-xs font-medium text-brand-forest">
            {form.workspace || "Personal"}
          </span>
          <Link
            href="/app/ajustes"
            className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-brand-forest hover:opacity-70"
          >
            <Settings className="h-4 w-4" />
            Ir a ajustes
          </Link>
        </aside>

        <div className="space-y-5">
          <form onSubmit={handleSave}>
            <SettingsCard
              title="Información personal"
              description="Estos datos se usan en pedidos y confirmaciones."
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  label="Nombre completo"
                  value={form.name}
                  onChange={(name) => setForm((f) => ({ ...f, name }))}
                  placeholder="Tu nombre"
                />
                <FormField
                  label="Correo electrónico"
                  type="email"
                  value={form.email}
                  onChange={(email) => setForm((f) => ({ ...f, email }))}
                  placeholder="correo@ejemplo.com"
                />
                <FormField
                  label="Teléfono"
                  type="tel"
                  value={form.phone}
                  onChange={(phone) => setForm((f) => ({ ...f, phone }))}
                  placeholder="+502 0000 0000"
                />
                <FormField
                  label="Espacio de trabajo"
                  value={form.workspace}
                  onChange={(workspace) => setForm((f) => ({ ...f, workspace }))}
                  placeholder="Casa, Oficina, Work..."
                />
              </div>
            </SettingsCard>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-full bg-brand-forest px-6 py-3 text-sm font-semibold text-white shadow-card transition-transform hover:-translate-y-0.5 disabled:opacity-70"
              >
                {saved ? (
                  <>
                    <Check className="h-4 w-4" />
                    Guardado
                  </>
                ) : saving ? (
                  "Guardando..."
                ) : (
                  "Guardar cambios"
                )}
              </button>
              <Link
                href="/app/pedidos"
                className="text-sm font-medium text-brand-carbon/60 hover:text-brand-forest"
              >
                Ver mis pedidos
              </Link>
            </div>
          </form>

          <AddressSection addresses={addresses} onChange={setAddresses} />
          <CardsSection cards={cards} onChange={setCards} />
        </div>
      </div>
    </div>
  );
}
