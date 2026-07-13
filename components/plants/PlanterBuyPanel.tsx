"use client";

import Link from "next/link";
import { Camera } from "lucide-react";
import { Planter } from "@/types";
import { ProductBuyActions } from "@/components/cart/ProductBuyActions";
import { SavePlantButton } from "@/components/plants/SavePlantButton";

export function PlanterBuyPanel({
  planter,
  selectedColor,
  displayedImage,
}: {
  planter: Planter;
  selectedColor: string;
  displayedImage: string;
}) {
  const cartItem = {
    id: planter.id,
    kind: "planter" as const,
    name: planter.name,
    subtitle: `${planter.material} · ${selectedColor}`,
    image: displayedImage,
    priceQ: planter.priceQ,
  };

  const savedItem = {
    id: planter.id,
    kind: "planter" as const,
    name: planter.name,
    subtitle: `${planter.material} · ${selectedColor}`,
    image: displayedImage,
    priceQ: planter.priceQ,
    href: `/app/macetas/${planter.id}`,
  };

  return (
    <>
      <ProductBuyActions
        key={`${planter.id}-${selectedColor}`}
        cartItem={cartItem}
        priceQ={planter.priceQ}
      >
        <SavePlantButton item={savedItem} />
        <Link
          href="/app/disena-tu-espacio"
          className="inline-flex items-center justify-center gap-2 rounded-full border border-brand-forest/30 bg-white px-6 py-3 text-sm font-semibold text-brand-forest"
        >
          <Camera className="h-4 w-4" />
          ¿Cómo se ve en mi espacio?
        </Link>
      </ProductBuyActions>
    </>
  );
}
