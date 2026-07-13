"use client";

import Image from "next/image";
import { Check, Plus } from "lucide-react";
import { Plant } from "@/types";
import { formatQ } from "@/lib/utils";

export function RecommendationCard({
  plant,
  selected,
  onToggle,
}: {
  plant: Plant;
  selected: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="card-surface flex items-center gap-4 p-4">
      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg">
        <Image src={plant.images[0]} alt={plant.name} fill className="object-cover" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-brand-carbon">
          {plant.name}
        </p>
        <p className="truncate text-xs italic text-brand-carbon/50">
          {plant.scientificName}
        </p>
        <p className="mt-1 text-xs font-medium text-brand-forest">
          {formatQ(plant.basePriceQ)}
        </p>
      </div>
      <button
        onClick={onToggle}
        aria-pressed={selected}
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-colors ${
          selected
            ? "bg-brand-forest text-white"
            : "bg-brand-sage text-brand-forest hover:bg-brand-moss hover:text-white"
        }`}
      >
        {selected ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
      </button>
    </div>
  );
}
