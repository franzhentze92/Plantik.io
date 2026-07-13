"use client";

import { Check, Plus } from "lucide-react";
import { SavedPlant, useSavedStore } from "@/lib/store";

export function SavePlantButton({
  item,
}: {
  item: Omit<SavedPlant, "savedAt">;
}) {
  const saved = useSavedStore((s) => s.saved.some((p) => p.id === item.id));
  const toggle = useSavedStore((s) => s.toggle);

  return (
    <button
      type="button"
      onClick={() => toggle(item)}
      className={`inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold shadow-card transition-colors ${
        saved
          ? "border border-brand-forest/30 bg-white text-brand-forest"
          : "bg-brand-forest text-white hover:bg-brand-forest/90"
      }`}
    >
      {saved ? (
        <>
          <Check className="h-4 w-4" />
          Guardada en mis propuestas
        </>
      ) : (
        <>
          <Plus className="h-4 w-4" />
          Agregar a propuesta
        </>
      )}
    </button>
  );
}
