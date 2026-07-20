"use client";

import { useState } from "react";
import { Check, MapPin, Plus, Star, Trash2 } from "lucide-react";
import {
  addAddress,
  deleteAddress,
  formatAddressLine,
  setDefaultAddress,
  type UserAddress,
} from "@/lib/supabase/account";
import { getAccountOwnerId } from "@/lib/session";
import { SettingsCard, FormField } from "./AccountSections";

const EMPTY = {
  label: "Casa",
  line1: "",
  line2: "",
  city: "",
  zone: "",
  is_default: false,
};

export function AddressSection({
  addresses,
  onChange,
}: {
  addresses: UserAddress[];
  onChange: (addresses: UserAddress[]) => void;
}) {
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(EMPTY);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!form.line1.trim() || !form.city.trim()) return;
    setSaving(true);
    try {
      const ownerId = await getAccountOwnerId();
      const created = await addAddress(ownerId, {
        label: form.label.trim() || "Casa",
        line1: form.line1.trim(),
        line2: form.line2.trim() || null,
        city: form.city.trim(),
        zone: form.zone.trim() || null,
        is_default: addresses.length === 0 || form.is_default,
      });
      onChange(
        [created, ...addresses.filter((a) => !created.is_default || !a.is_default)]
          .sort((a, b) => Number(b.is_default) - Number(a.is_default))
      );
      setForm(EMPTY);
      setShowForm(false);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    await deleteAddress(id);
    onChange(addresses.filter((a) => a.id !== id));
  }

  async function handleSetDefault(id: string) {
    const ownerId = await getAccountOwnerId();
    await setDefaultAddress(ownerId, id);
    onChange(
      addresses
        .map((a) => ({ ...a, is_default: a.id === id }))
        .sort((a, b) => Number(b.is_default) - Number(a.is_default))
    );
  }

  return (
    <SettingsCard
      title="Direcciones de envío"
      description="Guarda tus direcciones para agilizar el checkout."
    >
      {addresses.length > 0 && (
        <ul className="space-y-3">
          {addresses.map((addr) => (
            <li
              key={addr.id}
              className="flex items-start justify-between gap-3 rounded-xl border border-brand-beige/60 bg-brand-cream/30 px-4 py-3"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 shrink-0 text-brand-forest" />
                  <span className="text-sm font-semibold text-brand-carbon">
                    {addr.label}
                  </span>
                  {addr.is_default && (
                    <span className="rounded-full bg-brand-sage px-2 py-0.5 text-[10px] font-semibold text-brand-forest">
                      Principal
                    </span>
                  )}
                </div>
                <p className="mt-1 text-xs text-brand-carbon/60">
                  {formatAddressLine(addr)}
                </p>
              </div>
              <div className="flex shrink-0 gap-1">
                {!addr.is_default && (
                  <button
                    type="button"
                    onClick={() => handleSetDefault(addr.id)}
                    title="Marcar como principal"
                    className="rounded-full p-1.5 text-brand-carbon/40 hover:bg-brand-sage/50 hover:text-brand-forest"
                  >
                    <Star className="h-3.5 w-3.5" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => handleDelete(addr.id)}
                  className="rounded-full p-1.5 text-brand-carbon/40 hover:bg-red-50 hover:text-red-500"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {showForm ? (
        <form onSubmit={handleAdd} className="mt-4 space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <FormField
              label="Etiqueta"
              value={form.label}
              onChange={(label) => setForm((f) => ({ ...f, label }))}
              placeholder="Casa, Oficina..."
            />
            <FormField
              label="Ciudad"
              value={form.city}
              onChange={(city) => setForm((f) => ({ ...f, city }))}
              placeholder="Ciudad de Guatemala"
            />
            <FormField
              label="Dirección"
              value={form.line1}
              onChange={(line1) => setForm((f) => ({ ...f, line1 }))}
              placeholder="Calle, avenida, número"
            />
            <FormField
              label="Zona / Colonia"
              value={form.zone}
              onChange={(zone) => setForm((f) => ({ ...f, zone }))}
              placeholder="Zona 10, Oakland..."
            />
            <FormField
              label="Referencia (opcional)"
              value={form.line2}
              onChange={(line2) => setForm((f) => ({ ...f, line2 }))}
              placeholder="Edificio, apartamento..."
            />
          </div>
          <label className="flex items-center gap-2 text-xs text-brand-carbon/70">
            <input
              type="checkbox"
              checked={form.is_default}
              onChange={(e) =>
                setForm((f) => ({ ...f, is_default: e.target.checked }))
              }
              className="rounded border-brand-beige"
            />
            Usar como dirección principal
          </label>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-1.5 rounded-full bg-brand-forest px-4 py-2 text-xs font-semibold text-white"
            >
              {saving ? "Guardando..." : (
                <>
                  <Check className="h-3.5 w-3.5" /> Guardar dirección
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="rounded-full px-4 py-2 text-xs font-medium text-brand-carbon/60"
            >
              Cancelar
            </button>
          </div>
        </form>
      ) : (
        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="mt-3 inline-flex items-center gap-2 rounded-full border border-brand-forest/30 bg-white px-4 py-2 text-xs font-semibold text-brand-forest hover:bg-brand-sage/50"
        >
          <Plus className="h-3.5 w-3.5" />
          Agregar dirección
        </button>
      )}
    </SettingsCard>
  );
}
