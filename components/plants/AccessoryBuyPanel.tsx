"use client";

import Link from "next/link";
import { Camera } from "lucide-react";
import type { Accessory, AccessoryCategory } from "@/data/accessories";
import { ProductBuyActions } from "@/components/cart/ProductBuyActions";
import { SavePlantButton } from "@/components/plants/SavePlantButton";

const CATEGORY_LABEL: Record<AccessoryCategory, string> = {
  plato: "Plato macetero",
  sustrato: "Sustrato",
  mulch: "Cubierta para maceta",
};

export function AccessoryBuyPanel({ accessory }: { accessory: Accessory }) {
  const categoryLabel = CATEGORY_LABEL[accessory.category];

  const cartItem = {
    id: accessory.id,
    kind: "accesorio" as const,
    name: accessory.name,
    subtitle: categoryLabel,
    image: accessory.image || "/images/plant-placeholder.svg",
    priceQ: accessory.priceQ,
  };

  const savedItem = {
    id: accessory.id,
    kind: "accesorio" as const,
    accessoryCategory: accessory.category,
    name: accessory.name,
    subtitle: categoryLabel,
    image: accessory.image || "/images/plant-placeholder.svg",
    priceQ: accessory.priceQ,
    href: `/app/accesorios/${accessory.id}`,
    swatch: accessory.swatch,
    iconKey: accessory.iconKey,
  };

  return (
    <>
      <ProductBuyActions cartItem={cartItem} priceQ={accessory.priceQ}>
        <SavePlantButton item={savedItem} />
      </ProductBuyActions>

      <Link
        href="/app/disena-tu-espacio"
        className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-brand-forest hover:opacity-70"
      >
        <Camera className="h-4 w-4" />
        ¿Cómo se ve en mi espacio?
      </Link>
    </>
  );
}
