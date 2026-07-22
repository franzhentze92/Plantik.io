"use client";

import { useState } from "react";
import { Check, Sparkles } from "lucide-react";
import {
  SpaceQuestionnaire as SpaceQuestionnaireType,
  RoomType,
} from "@/types/space-analysis";

interface SpaceQuestionnaireProps {
  onSubmit: (data: SpaceQuestionnaireType) => void;
  isLoading?: boolean;
}

const roomTypes: { id: RoomType; label: string }[] = [
  { id: "bedroom", label: "Dormitorio" },
  { id: "living-room", label: "Sala" },
  { id: "office", label: "Oficina" },
  { id: "bathroom", label: "Baño" },
  { id: "balcony", label: "Balcón" },
  { id: "dining-room", label: "Comedor" },
  { id: "kitchen", label: "Cocina" },
];

function OptionButton({
  label,
  selected,
  onClick,
  className = "",
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center justify-center gap-2 rounded-full border px-4 py-2.5 text-sm font-medium transition-colors ${
        selected
          ? "border-brand-forest bg-brand-forest text-white shadow-soft"
          : "border-brand-beige bg-white text-brand-carbon hover:border-brand-forest/30"
      } ${className}`}
    >
      {selected && <Check className="h-3.5 w-3.5" />}
      {label}
    </button>
  );
}

function Step({
  number,
  title,
  children,
}: {
  number: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-start gap-3">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-sage text-xs font-bold text-brand-forest">
          {number}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-brand-forest">{title}</p>
          <div className="mt-3">{children}</div>
        </div>
      </div>
    </div>
  );
}

export function SpaceQuestionnaire({
  onSubmit,
  isLoading,
}: SpaceQuestionnaireProps) {
  const [roomType, setRoomType] = useState<RoomType>("living-room");
  const [directSun, setDirectSun] = useState<boolean>(false);
  const [hasPets, setHasPets] = useState<boolean>(false);
  const [maintenance, setMaintenance] = useState<
    "easy" | "moderate" | "demanding"
  >("moderate");

  function handleSubmit() {
    onSubmit({
      roomType,
      directSun,
      hasPets,
      desiredMaintenance: maintenance,
    });
  }

  return (
    <div className="card-surface flex h-full flex-col p-5 sm:p-6">
      <div className="space-y-6">
        <Step number={1} title="¿Qué tipo de espacio es?">
          <div className="flex flex-wrap gap-2">
            {roomTypes.map((rt) => (
              <OptionButton
                key={rt.id}
                label={rt.label}
                selected={roomType === rt.id}
                onClick={() => setRoomType(rt.id)}
              />
            ))}
          </div>
        </Step>

        <Step number={2} title="¿Entra sol directo?">
          <div className="grid grid-cols-2 gap-3">
            <OptionButton
              label="Sí"
              selected={directSun === true}
              onClick={() => setDirectSun(true)}
              className="w-full"
            />
            <OptionButton
              label="No"
              selected={directSun === false}
              onClick={() => setDirectSun(false)}
              className="w-full"
            />
          </div>
        </Step>

        <Step number={3} title="¿Hay mascotas?">
          <div className="grid grid-cols-2 gap-3">
            <OptionButton
              label="Sí"
              selected={hasPets === true}
              onClick={() => setHasPets(true)}
              className="w-full"
            />
            <OptionButton
              label="No"
              selected={hasPets === false}
              onClick={() => setHasPets(false)}
              className="w-full"
            />
          </div>
        </Step>

        <Step number={4} title="Nivel de mantenimiento deseado">
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            {[
              { label: "Fácil", value: "easy" as const },
              { label: "Moderado", value: "moderate" as const },
              { label: "Exigente", value: "demanding" as const },
            ].map((option) => (
              <OptionButton
                key={option.value}
                label={option.label}
                selected={maintenance === option.value}
                onClick={() => setMaintenance(option.value)}
                className="w-full px-3 text-xs sm:text-sm"
              />
            ))}
          </div>
        </Step>
      </div>

      <button
        type="button"
        onClick={handleSubmit}
        disabled={isLoading}
        className="mt-8 flex w-full items-center justify-center gap-2 rounded-full bg-brand-forest px-6 py-3.5 text-sm font-semibold text-white shadow-card transition-transform hover:-translate-y-0.5 disabled:opacity-50"
      >
        {isLoading ? (
          "Preparando..."
        ) : (
          <>
            <Sparkles className="h-4 w-4" />
            Continuar
          </>
        )}
      </button>
    </div>
  );
}
