"use client";

import { Ruler } from "lucide-react";
import {
  PlacementLocation,
  PlantSizeRecommendation,
} from "@/types/space-analysis";

interface PlacementSizeSelectorProps {
  placement: PlacementLocation;
  onUpdate: (patch: Partial<PlacementLocation>) => void;
}

const sizeOptions: {
  value: PlantSizeRecommendation;
  label: string;
  hint: string;
}[] = [
  { value: "desktop", label: "Escritorio", hint: "hasta 30 cm" },
  { value: "small", label: "Pequeña", hint: "30–60 cm" },
  { value: "medium", label: "Mediana", hint: "60–150 cm" },
  { value: "large", label: "Grande", hint: "más de 150 cm" },
];

function Pill({
  label,
  hint,
  active,
  onClick,
}: {
  label: string;
  hint: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-col items-start rounded-xl border px-3 py-2 text-left transition-colors ${
        active
          ? "border-brand-forest bg-brand-forest text-white"
          : "border-brand-beige bg-white text-brand-carbon hover:border-brand-forest/40"
      }`}
    >
      <span className="text-xs font-semibold">{label}</span>
      <span
        className={`text-[10px] ${
          active ? "text-white/80" : "text-brand-carbon/50"
        }`}
      >
        {hint}
      </span>
    </button>
  );
}

export function PlacementSizeSelector({
  placement,
  onUpdate,
}: PlacementSizeSelectorProps) {
  return (
    <div className="mb-4 rounded-xl border border-brand-beige bg-brand-cream/40 p-4">
      <div className="flex items-center gap-2">
        <Ruler className="h-4 w-4 text-brand-forest" />
        <p className="text-[11px] font-semibold uppercase tracking-wide text-brand-carbon/60">
          Tamaño de planta
        </p>
      </div>
      <p className="mt-1 text-xs text-brand-carbon/60">
        Elige qué tan grande quieres la planta para esta ubicación. Ajustamos las
        recomendaciones al instante.
      </p>
      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {sizeOptions.map((opt) => (
          <Pill
            key={opt.value}
            label={opt.label}
            hint={opt.hint}
            active={placement.recommendedPlantSize === opt.value}
            onClick={() => onUpdate({ recommendedPlantSize: opt.value })}
          />
        ))}
      </div>
    </div>
  );
}
