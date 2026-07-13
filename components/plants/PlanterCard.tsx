"use client";

import Image from "next/image";
import Link from "next/link";
import { Bookmark } from "lucide-react";
import { Planter } from "@/types";
import { formatQ } from "@/lib/utils";
import { useSavedStore } from "@/lib/store";
import { AddToCartButton } from "@/components/cart/AddToCartButton";

export function PlanterCard({ planter }: { planter: Planter }) {
  const saved = useSavedStore((s) => s.saved.some((p) => p.id === planter.id));
  const toggleSaved = useSavedStore((s) => s.toggle);

  return (
    <Link
      href={`/app/macetas/${planter.id}`}
      className="card-surface group overflow-hidden block"
    >
      <div className="relative h-44 w-full overflow-hidden bg-white">
        <Image
          src={planter.image}
          alt={planter.name}
          fill
          className="object-contain p-3 transition-transform duration-300 group-hover:scale-105"
        />
        <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-semibold text-brand-forest">
          Talla {planter.size}
        </span>

        <button
          type="button"
          aria-label={saved ? "Quitar de mis propuestas" : "Agregar a mis propuestas"}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleSaved({
              id: planter.id,
              kind: "planter",
              name: planter.name,
              subtitle: `${planter.material} · ${planter.color}`,
              image: planter.image,
              priceQ: planter.priceQ,
            });
          }}
          className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-brand-forest shadow-soft backdrop-blur transition-colors hover:bg-white"
        >
          <Bookmark className={`h-4 w-4 ${saved ? "fill-brand-forest" : ""}`} />
        </button>
      </div>
      <div className="p-4">
        <h3 className="text-sm font-semibold text-brand-carbon">{planter.name}</h3>
        <p className="text-xs text-brand-carbon/50">
          {planter.material} · {planter.color}
        </p>
        <div className="mt-3 flex items-center justify-between">
          <span className="text-sm font-semibold text-brand-forest">
            {formatQ(planter.priceQ)}
          </span>
          <span className="text-[11px] text-brand-carbon/50">{planter.style}</span>
        </div>
        <p className="mt-2 text-[11px] text-brand-carbon/45">
          {planter.diameterCm} cm ·{" "}
          {planter.placement === "ambos"
            ? "Interior y exterior"
            : planter.placement === "interior"
              ? "Interior"
              : "Exterior"}
          {planter.drainage ? " · Con drenaje" : ""}
        </p>

        <AddToCartButton
          item={{
            id: planter.id,
            kind: "planter",
            name: planter.name,
            subtitle: `${planter.material} · ${planter.color}`,
            image: planter.image,
            priceQ: planter.priceQ,
          }}
        />
      </div>
    </Link>
  );
}
