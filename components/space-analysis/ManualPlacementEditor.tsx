"use client";

import { Trash2 } from "lucide-react";
import {
  PlacementLocation,
  PlacementType,
  PlantSizeRecommendation,
} from "@/types/space-analysis";

interface ManualPlacementEditorProps {
  placement: PlacementLocation;
  onUpdate: (patch: Partial<PlacementLocation>) => void;
  onRemove: () => void;
}

const typeOptions: { value: PlacementType; label: string }[] = [
  { value: "floor", label: "Piso" },
  { value: "table", label: "Mesa" },
  { value: "shelf", label: "Repisa" },
  { value: "hanging", label: "Colgante" },
];

const sizeOptions: { value: PlantSizeRecommendation; label: string }[] = [
  { value: "desktop", label: "Escritorio" },
  { value: "small", label: "Pequeña" },
  { value: "medium", label: "Mediana" },
  { value: "large", label: "Grande" },
];

function Pill({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
        active
          ? "border-brand-forest bg-brand-forest text-white"
          : "border-brand-beige bg-white text-brand-carbon hover:border-brand-forest/30"
      }`}
    >
      {label}
    </button>
  );
}

export function ManualPlacementEditor({
  placement,
  onUpdate,
  onRemove,
}: ManualPlacementEditorProps) {
  return (
    <div className="mb-4 rounded-xl border border-brand-terracotta/30 bg-brand-terracotta/5 p-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-brand-forest">Tu punto</p>
        <button
          type="button"
          onClick={onRemove}
          className="inline-flex items-center gap-1 text-xs font-semibold text-red-600 hover:text-red-700"
        >
          <Trash2 className="h-3.5 w-3.5" />
          Eliminar
        </button>
      </div>
      <p className="mt-1 text-xs text-brand-carbon/60">
        Ajusta el tipo y el tamaño de la visualización. Arrastra el marcador
        en la foto para moverlo.
      </p>

      <div className="mt-3">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-brand-carbon/50">
          Tipo de ubicación
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          {typeOptions.map((opt) => (
            <Pill
              key={opt.value}
              label={opt.label}
              active={placement.placementType === opt.value}
              onClick={() => onUpdate({ placementType: opt.value })}
            />
          ))}
        </div>
      </div>

      <div className="mt-3">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-brand-carbon/50">
          Tamaño de planta
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          {sizeOptions.map((opt) => (
            <Pill
              key={opt.value}
              label={opt.label}
              active={placement.recommendedPlantSize === opt.value}
              onClick={() => onUpdate({ recommendedPlantSize: opt.value })}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
