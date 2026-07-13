"use client";

import { useState } from "react";
import Link from "next/link";
import { Camera } from "lucide-react";
import { Plant } from "@/types";
import { formatQ } from "@/lib/utils";
import { ProductBuyActions } from "@/components/cart/ProductBuyActions";
import { SavePlantButton } from "@/components/plants/SavePlantButton";

export function PlantBuyPanel({ plant }: { plant: Plant }) {
  const hasSizes = plant.sizes.length > 0;
  const [selectedSizeId, setSelectedSizeId] = useState<string | null>(
    hasSizes ? plant.sizes[0].id : null
  );

  const selectedSize = hasSizes
    ? plant.sizes.find((s) => s.id === selectedSizeId) ?? plant.sizes[0]
    : null;

  const activePriceQ = selectedSize ? selectedSize.priceQ : plant.basePriceQ;
  const activeStock = selectedSize?.stock ?? plant.stockQuantity;
  const soldOut = activeStock <= 0;

  const image = plant.images[0];
  const sizeSubtitle = selectedSize
    ? `${plant.scientificName} · ${selectedSize.label}`
    : plant.scientificName;

  const cartItem = {
    id: selectedSize ? selectedSize.id : plant.id,
    kind: "plant" as const,
    name: plant.name,
    subtitle: sizeSubtitle,
    image,
    priceQ: activePriceQ,
  };

  const savedItem = {
    id: plant.id,
    kind: "plant" as const,
    name: plant.name,
    scientificName: plant.scientificName,
    subtitle: selectedSize ? selectedSize.label : undefined,
    image,
    priceQ: activePriceQ,
    light: plant.light,
    href: `/app/plantas/${plant.slug}`,
  };

  return (
    <div>
      {hasSizes && (
        <div className="mt-4">
          <span className="text-xs font-medium text-brand-carbon/60">
            Elige un tamaño
          </span>
          <div className="mt-2 flex flex-wrap gap-2">
            {plant.sizes.map((s) => {
              const active = s.id === selectedSize?.id;
              const outOfStock = (s.stock ?? 1) <= 0;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setSelectedSizeId(s.id)}
                  disabled={outOfStock}
                  aria-pressed={active}
                  className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                    active
                      ? "border-brand-forest bg-brand-forest text-white"
                      : "border-brand-beige bg-white text-brand-carbon/70 hover:border-brand-forest/40"
                  } ${outOfStock ? "cursor-not-allowed opacity-40" : ""}`}
                >
                  {s.label} · {formatQ(s.priceQ)}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <ProductBuyActions
        key={selectedSize?.id ?? plant.id}
        cartItem={cartItem}
        priceQ={activePriceQ}
        stockQuantity={activeStock}
        soldOut={soldOut}
      >
        <SavePlantButton item={savedItem} />
      </ProductBuyActions>

      <Link
        href="/app/disena-tu-espacio"
        className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-brand-forest hover:opacity-70"
      >
        <Camera className="h-4 w-4" />
        ¿Funciona en mi espacio?
      </Link>
    </div>
  );
}
