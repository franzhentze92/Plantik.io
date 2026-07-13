"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

export function PlacementMarker({
  x,
  y,
  label,
}: {
  x: number;
  y: number;
  label: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className="absolute -translate-x-1/2 -translate-y-1/2"
      style={{ left: `${x}%`, top: `${y}%` }}
    >
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label={label}
        className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-forest text-white shadow-card ring-4 ring-white/70"
      >
        <Plus className="h-4 w-4" />
      </button>
      {open && (
        <div className="absolute left-1/2 top-10 w-40 -translate-x-1/2 rounded-lg bg-white px-3 py-2 text-center text-[11px] font-medium text-brand-carbon shadow-card">
          {label}
        </div>
      )}
    </div>
  );
}
