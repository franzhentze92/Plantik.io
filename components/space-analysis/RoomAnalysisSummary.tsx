"use client";

import { RoomAnalysis } from "@/types/space-analysis";
import { AlertCircle } from "lucide-react";

interface RoomAnalysisSummaryProps {
  analysis: RoomAnalysis;
}

const roomTypeLabels: { [key: string]: string } = {
  bedroom: "Dormitorio",
  "living-room": "Sala",
  office: "Oficina",
  bathroom: "Baño",
  balcony: "Balcón",
  "dining-room": "Comedor",
  kitchen: "Cocina",
  other: "Otro",
};

const lightLevelLabels: { [key: string]: string } = {
  "very-low": "Muy baja",
  low: "Baja",
  medium: "Media",
  bright: "Brillante",
};

const sizeLabels: { [key: string]: string } = {
  small: "Pequeño",
  medium: "Mediano",
  large: "Grande",
};

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline gap-1.5">
      <span className="text-[11px] uppercase tracking-wide text-brand-carbon/50">
        {label}
      </span>
      <span className="text-xs font-semibold text-brand-forest">{value}</span>
    </div>
  );
}

export function RoomAnalysisSummary({ analysis }: RoomAnalysisSummaryProps) {
  return (
    <div className="rounded-xl border border-brand-beige bg-white/70 px-4 py-3">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <Fact
          label="Espacio"
          value={roomTypeLabels[analysis.roomType] || analysis.roomType}
        />
        <span className="h-3.5 w-px bg-brand-beige" />
        <Fact
          label="Luz"
          value={lightLevelLabels[analysis.lightLevel] || analysis.lightLevel}
        />
        <span className="h-3.5 w-px bg-brand-beige" />
        <Fact label="Sol directo" value={analysis.directSun ? "Sí" : "No"} />
        <span className="h-3.5 w-px bg-brand-beige" />
        <Fact
          label="Tamaño"
          value={sizeLabels[analysis.estimatedSpaceSize] || analysis.estimatedSpaceSize}
        />

        {analysis.styles.length > 0 && (
          <>
            <span className="h-3.5 w-px bg-brand-beige" />
            <div className="flex flex-wrap items-center gap-1.5">
              {analysis.styles.slice(0, 3).map((style) => (
                <span
                  key={style}
                  className="inline-flex rounded-full border border-brand-beige bg-white px-2 py-0.5 text-[11px] font-medium capitalize text-brand-carbon"
                >
                  {style}
                </span>
              ))}
            </div>
          </>
        )}

        {analysis.dominantColors.length > 0 && (
          <>
            <span className="h-3.5 w-px bg-brand-beige" />
            <div className="flex items-center gap-1">
              {analysis.dominantColors.slice(0, 5).map((color) => (
                <span
                  key={color}
                  title={color}
                  className="h-4 w-4 rounded-full border border-brand-beige"
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </>
        )}

        <span className="ml-auto text-[11px] text-brand-carbon/45">
          Confianza {Math.round(analysis.confidence * 100)}%
        </span>
      </div>

      {analysis.warnings.length > 0 && (
        <div className="mt-2 flex items-start gap-2 border-t border-brand-beige/60 pt-2">
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-amber-600" />
          <p className="text-[11px] leading-snug text-amber-700">
            {analysis.warnings.join(" · ")}
          </p>
        </div>
      )}
    </div>
  );
}
