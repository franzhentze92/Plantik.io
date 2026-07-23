"use client";

import Image from "next/image";
import Link from "next/link";
import { Bookmark } from "lucide-react";
import { formatQ } from "@/lib/utils";
import { ACCESSORY_ICONS } from "@/lib/accessory-icons";
import { useSavedStore } from "@/lib/store";
import { AddToCartButton } from "@/components/cart/AddToCartButton";
import type { Accessory } from "@/data/accessories";

const CATEGORY_LABEL: Record<Accessory["category"], string> = {
  plato: "Plato macetero",
  sustrato: "Sustrato",
  mulch: "Cubierta",
};

const PLACEMENT_LABEL: Record<Accessory["placement"], string> = {
  interior: "Interior",
  exterior: "Exterior",
  ambos: "Interior y exterior",
};

export function AccessoryCard({ accessory }: { accessory: Accessory }) {
  const Icon = ACCESSORY_ICONS[accessory.iconKey];
  const saved = useSavedStore((s) =>
    s.saved.some((p) => p.id === accessory.id)
  );
  const toggleSaved = useSavedStore((s) => s.toggle);

  return (
    <Link
      href={`/app/accesorios/${accessory.id}`}
      className="card-surface group block overflow-hidden"
    >
      <div
        className={`relative flex h-40 w-full items-center justify-center overflow-hidden ${accessory.image ? "bg-white" : ""}`}
        style={accessory.image ? undefined : { backgroundColor: accessory.swatch }}
      >
        {accessory.image ? (
          <Image
            src={accessory.image}
            alt={accessory.name}
            fill
            className="object-contain p-3"
          />
        ) : (
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white/70 shadow-soft ring-1 ring-black/5 backdrop-blur transition-transform duration-300 group-hover:scale-110">
            <Icon className="h-7 w-7 text-brand-carbon/70" />
          </span>
        )}
        <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-semibold text-brand-forest">
          {CATEGORY_LABEL[accessory.category]}
        </span>

        <button
          type="button"
          aria-label={saved ? "Quitar de mis propuestas" : "Agregar a mis propuestas"}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleSaved({
              id: accessory.id,
              kind: "accesorio",
              accessoryCategory: accessory.category,
              name: accessory.name,
              subtitle: CATEGORY_LABEL[accessory.category],
              image: accessory.image ?? "",
              priceQ: accessory.priceQ,
              swatch: accessory.swatch,
              iconKey: accessory.iconKey,
            });
          }}
          className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-brand-forest shadow-soft backdrop-blur transition-colors hover:bg-white"
        >
          <Bookmark className={`h-4 w-4 ${saved ? "fill-brand-forest" : ""}`} />
        </button>
      </div>

      <div className="p-4">
        <h3 className="text-sm font-semibold text-brand-carbon">
          {accessory.name}
        </h3>
        {accessory.category === "plato" &&
          (accessory.attrs.displayColor || accessory.attrs.diameterCm) && (
            <p className="text-xs text-brand-carbon/50">
              {[
                accessory.attrs.displayColor,
                accessory.attrs.diameterCm
                  ? `${accessory.attrs.diameterCm} cm`
                  : null,
                accessory.attrs.talla ? `Talla ${accessory.attrs.talla}` : null,
              ]
                .filter(Boolean)
                .join(" · ")}
            </p>
          )}
        <p className="mt-0.5 line-clamp-2 text-[11px] text-brand-carbon/55">
          {accessory.description}
        </p>
        <div className="mt-3 flex items-center justify-between">
          <span className="text-sm font-semibold text-brand-forest">
            {formatQ(accessory.priceQ)}
          </span>
          <span className="text-[11px] text-brand-carbon/50">
            {PLACEMENT_LABEL[accessory.placement]}
          </span>
        </div>

        <AddToCartButton
          item={{
            id: accessory.id,
            kind: "accesorio",
            name: accessory.name,
            subtitle: CATEGORY_LABEL[accessory.category],
            image: accessory.image || "/images/plant-placeholder.svg",
            priceQ: accessory.priceQ,
          }}
        />
      </div>
    </Link>
  );
}
