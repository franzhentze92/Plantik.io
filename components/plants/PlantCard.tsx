"use client";

import Link from "next/link";
import Image from "next/image";
import { Bookmark, Leaf, Moon, Sun, SunMedium } from "lucide-react";
import { Plant } from "@/types";
import { formatQ } from "@/lib/utils";
import { useSavedStore } from "@/lib/store";
import { AddToCartButton } from "@/components/cart/AddToCartButton";

const LIGHT_META: Record<Plant["light"], { icon: typeof Sun; label: string }> = {
  baja: { icon: Moon, label: "Luz baja" },
  media: { icon: SunMedium, label: "Luz media" },
  alta: { icon: Sun, label: "Luz alta" },
};

export function PlantCard({ plant }: { plant: Plant }) {
  const saved = useSavedStore((s) => s.saved.some((p) => p.id === plant.id));
  const toggleSaved = useSavedStore((s) => s.toggle);
  const light = LIGHT_META[plant.light] ?? LIGHT_META.media;
  const LightIcon = light.icon;
  const isEpa = plant.id.startsWith("epa-");

  return (
    <Link href={`/app/plantas/${plant.slug}`} className="card-surface group overflow-hidden">
      <div
        className={`relative h-44 w-full overflow-hidden ${isEpa ? "bg-white" : ""}`}
      >
        <Image
          src={plant.images[0]}
          alt={plant.name}
          fill
          className={`${isEpa ? "object-contain p-3" : "object-cover"} transition-transform duration-300 group-hover:scale-105`}
        />

        {plant.stock === "pocas_unidades" && (
          <span className="absolute left-3 top-3 rounded-full bg-brand-terracotta px-2.5 py-1 text-[10px] font-semibold text-white">
            Pocas unidades
          </span>
        )}

        <button
          type="button"
          aria-label={saved ? "Quitar de guardados" : "Guardar planta"}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleSaved({
              id: plant.id,
              kind: "plant",
              name: plant.name,
              scientificName: plant.scientificName,
              image: plant.images[0],
              priceQ: plant.basePriceQ,
              light: plant.light,
            });
          }}
          className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-brand-forest shadow-soft backdrop-blur transition-colors hover:bg-white"
        >
          <Bookmark
            className={`h-4 w-4 ${saved ? "fill-brand-forest" : ""}`}
          />
        </button>

        <span className="absolute bottom-3 left-3 flex h-7 w-7 items-center justify-center rounded-full bg-white/85 text-brand-moss shadow-soft backdrop-blur">
          <Leaf className="h-3.5 w-3.5" />
        </span>
      </div>

      <div className="p-4">
        <h3 className="text-sm font-semibold text-brand-carbon">{plant.name}</h3>
        <p className="text-xs italic text-brand-carbon/50">{plant.scientificName}</p>
        <div className="mt-3 flex items-center justify-between">
          <span className="text-sm font-semibold text-brand-forest">
            {formatQ(plant.basePriceQ)}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-brand-sage px-2.5 py-1 text-[11px] font-medium text-brand-forest">
            <LightIcon className="h-3 w-3" />
            {light.label}
          </span>
        </div>

        <AddToCartButton
          item={{
            id: plant.id,
            kind: "plant",
            name: plant.name,
            subtitle: plant.scientificName,
            image: plant.images[0],
            priceQ: plant.basePriceQ,
          }}
        />
      </div>
    </Link>
  );
}
