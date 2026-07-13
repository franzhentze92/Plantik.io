"use client";

import { useState } from "react";
import { RoomAnswers } from "@/types";

const spaceTypes = [
  { id: "dormitorio", label: "Dormitorio" },
  { id: "sala", label: "Sala" },
  { id: "oficina", label: "Oficina" },
  { id: "balcon", label: "Balcón" },
  { id: "comedor", label: "Comedor" },
  { id: "bano", label: "Baño" },
  { id: "otro", label: "Otro" },
];

function ChipGroup({
  options,
  value,
  onChange,
}: {
  options: { id: string; label: string }[];
  value?: string;
  onChange: (id: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => (
        <button
          key={opt.id}
          type="button"
          onClick={() => onChange(opt.id)}
          className={`rounded-full border px-4 py-2 text-xs font-medium transition-colors ${
            value === opt.id
              ? "border-brand-forest bg-brand-forest text-white"
              : "border-brand-beige bg-white text-brand-carbon/75 hover:border-brand-moss"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

export function RoomQuestions({
  onSubmit,
}: {
  onSubmit: (answers: RoomAnswers) => void;
}) {
  const [spaceType, setSpaceType] = useState<string>("sala");
  const [light, setLight] = useState<string>();
  const [pets, setPets] = useState<string>();
  const [maintenance, setMaintenance] = useState<string>();
  const [budget, setBudget] = useState<string>();
  const [style, setStyle] = useState<string>();

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({ spaceType, light, pets, maintenance, budget, style });
      }}
      className="space-y-8"
    >
      <div>
        <p className="text-sm font-semibold text-brand-carbon">
          ¿Qué tipo de espacio es?
        </p>
        <div className="mt-3">
          <ChipGroup options={spaceTypes} value={spaceType} onChange={setSpaceType} />
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <p className="text-sm font-semibold text-brand-carbon">
            ¿Cuánta luz recibe?
          </p>
          <div className="mt-3">
            <ChipGroup
              options={[
                { id: "baja", label: "Poca luz" },
                { id: "media", label: "Luz media" },
                { id: "alta", label: "Mucha luz" },
              ]}
              value={light}
              onChange={setLight}
            />
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold text-brand-carbon">
            ¿Hay mascotas?
          </p>
          <div className="mt-3">
            <ChipGroup
              options={[
                { id: "si", label: "Sí" },
                { id: "no", label: "No" },
              ]}
              value={pets}
              onChange={setPets}
            />
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold text-brand-carbon">
            ¿Cuánto mantenimiento deseas?
          </p>
          <div className="mt-3">
            <ChipGroup
              options={[
                { id: "facil", label: "Fácil" },
                { id: "moderado", label: "Moderado" },
                { id: "exigente", label: "Me gusta dedicarle tiempo" },
              ]}
              value={maintenance}
              onChange={setMaintenance}
            />
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold text-brand-carbon">
            ¿Cuál es tu presupuesto?
          </p>
          <div className="mt-3">
            <ChipGroup
              options={[
                { id: "bajo", label: "Hasta Q200" },
                { id: "medio", label: "Q200–Q500" },
                { id: "alto", label: "Más de Q500" },
              ]}
              value={budget}
              onChange={setBudget}
            />
          </div>
        </div>
      </div>

      <div>
        <p className="text-sm font-semibold text-brand-carbon">
          ¿Qué estilo prefieres?
        </p>
        <div className="mt-3">
          <ChipGroup
            options={[
              { id: "minimalista", label: "Minimalista" },
              { id: "natural", label: "Natural" },
              { id: "bohemio", label: "Bohemio" },
              { id: "moderno", label: "Moderno" },
            ]}
            value={style}
            onChange={setStyle}
          />
        </div>
      </div>

      <button
        type="submit"
        className="w-full rounded-full bg-brand-forest px-6 py-3 text-sm font-semibold text-white shadow-card sm:w-auto"
      >
        Analizar mi espacio
      </button>
    </form>
  );
}
