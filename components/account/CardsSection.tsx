"use client";

import { useState } from "react";
import { Check, CreditCard, Plus, Star, Trash2 } from "lucide-react";
import {
  addPaymentCard,
  deletePaymentCard,
  setDefaultCard,
  type UserPaymentCard,
} from "@/lib/supabase/account";
import { getOrCreateSessionId } from "@/lib/session";
import { SettingsCard, FormField } from "./AccountSections";

const BRAND_LABEL: Record<string, string> = {
  visa: "Visa",
  mastercard: "Mastercard",
  amex: "Amex",
};

const EMPTY = {
  label: "Personal",
  brand: "visa",
  cardNumber: "",
  expMonth: "",
  expYear: "",
  cardholder: "",
  is_default: false,
};

function detectBrand(num: string): string {
  const d = num.replace(/\D/g, "");
  if (d.startsWith("4")) return "visa";
  if (d.startsWith("5")) return "mastercard";
  if (d.startsWith("3")) return "amex";
  return "visa";
}

export function CardsSection({
  cards,
  onChange,
}: {
  cards: UserPaymentCard[];
  onChange: (cards: UserPaymentCard[]) => void;
}) {
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(EMPTY);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    const digits = form.cardNumber.replace(/\D/g, "");
    if (digits.length < 4 || !form.cardholder.trim()) return;
    setSaving(true);
    try {
      const sessionId = getOrCreateSessionId();
      const created = await addPaymentCard(sessionId, {
        label: form.label.trim() || "Personal",
        brand: detectBrand(digits),
        last4: digits.slice(-4),
        exp_month: form.expMonth.padStart(2, "0"),
        exp_year: form.expYear.length === 2 ? `20${form.expYear}` : form.expYear,
        cardholder: form.cardholder.trim(),
        is_default: cards.length === 0 || form.is_default,
      });
      onChange(
        [created, ...cards.filter((c) => !created.is_default || !c.is_default)].sort(
          (a, b) => Number(b.is_default) - Number(a.is_default)
        )
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
    await deletePaymentCard(id);
    onChange(cards.filter((c) => c.id !== id));
  }

  async function handleSetDefault(id: string) {
    const sessionId = getOrCreateSessionId();
    await setDefaultCard(sessionId, id);
    onChange(
      cards
        .map((c) => ({ ...c, is_default: c.id === id }))
        .sort((a, b) => Number(b.is_default) - Number(a.is_default))
    );
  }

  return (
    <SettingsCard
      title="Tarjetas guardadas"
      description="Solo guardamos los últimos 4 dígitos. El cobro real se habilitará pronto."
    >
      {cards.length > 0 && (
        <ul className="space-y-3">
          {cards.map((card) => (
            <li
              key={card.id}
              className="flex items-center justify-between gap-3 rounded-xl border border-brand-beige/60 bg-brand-cream/30 px-4 py-3"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-brand-forest shadow-soft">
                  <CreditCard className="h-4 w-4" />
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-brand-carbon">
                      {BRAND_LABEL[card.brand] ?? card.brand} ···· {card.last4}
                    </span>
                    {card.is_default && (
                      <span className="rounded-full bg-brand-sage px-2 py-0.5 text-[10px] font-semibold text-brand-forest">
                        Principal
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-brand-carbon/55">
                    {card.cardholder} · Exp. {card.exp_month}/{card.exp_year.slice(-2)}
                  </p>
                </div>
              </div>
              <div className="flex shrink-0 gap-1">
                {!card.is_default && (
                  <button
                    type="button"
                    onClick={() => handleSetDefault(card.id)}
                    title="Marcar como principal"
                    className="rounded-full p-1.5 text-brand-carbon/40 hover:bg-brand-sage/50 hover:text-brand-forest"
                  >
                    <Star className="h-3.5 w-3.5" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => handleDelete(card.id)}
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
          <div className="rounded-xl border border-dashed border-brand-beige bg-brand-cream/40 px-3 py-2 text-[11px] text-brand-carbon/55">
            Simulación: no se almacenan datos reales de tarjeta completos.
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <FormField
              label="Etiqueta"
              value={form.label}
              onChange={(label) => setForm((f) => ({ ...f, label }))}
              placeholder="Personal, Trabajo..."
            />
            <FormField
              label="Titular"
              value={form.cardholder}
              onChange={(cardholder) => setForm((f) => ({ ...f, cardholder }))}
              placeholder="Como aparece en la tarjeta"
            />
            <FormField
              label="Número de tarjeta"
              value={form.cardNumber}
              onChange={(cardNumber) => setForm((f) => ({ ...f, cardNumber }))}
              placeholder="4242 4242 4242 4242"
            />
            <div className="grid grid-cols-2 gap-3">
              <FormField
                label="Mes"
                value={form.expMonth}
                onChange={(expMonth) => setForm((f) => ({ ...f, expMonth }))}
                placeholder="MM"
              />
              <FormField
                label="Año"
                value={form.expYear}
                onChange={(expYear) => setForm((f) => ({ ...f, expYear }))}
                placeholder="AA"
              />
            </div>
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
            Usar como tarjeta principal
          </label>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-1.5 rounded-full bg-brand-forest px-4 py-2 text-xs font-semibold text-white"
            >
              {saving ? "Guardando..." : (
                <>
                  <Check className="h-3.5 w-3.5" /> Guardar tarjeta
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
          Agregar tarjeta
        </button>
      )}
    </SettingsCard>
  );
}
