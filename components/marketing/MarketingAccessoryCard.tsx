import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Lock } from "lucide-react";
import { ACCESSORY_ICONS } from "@/lib/accessory-icons";
import { formatQ } from "@/lib/utils";
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

export function MarketingAccessoryCard({ accessory }: { accessory: Accessory }) {
  const Icon = ACCESSORY_ICONS[accessory.iconKey];
  const detailHref = `/productos/accesorios/${accessory.id}`;
  const loginHref = `/login?next=${encodeURIComponent(`/app/accesorios/${accessory.id}`)}`;

  return (
    <article className="card-surface group flex flex-col overflow-hidden">
      <Link
        href={detailHref}
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
      </Link>

      <div className="flex flex-1 flex-col p-4">
        <Link href={detailHref}>
          <h3 className="text-sm font-semibold text-brand-carbon transition-colors group-hover:text-brand-forest">
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
                  accessory.attrs.talla
                    ? `Talla ${accessory.attrs.talla}`
                    : null,
                ]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
            )}
        </Link>
        <p className="mt-1 line-clamp-2 text-[11px] text-brand-carbon/55">
          {accessory.description}
        </p>

        <div className="mt-auto pt-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-brand-forest">
              {formatQ(accessory.priceQ)}
            </span>
            <span className="text-[11px] text-brand-carbon/50">
              {PLACEMENT_LABEL[accessory.placement]}
            </span>
          </div>

          <div className="mt-3 flex gap-2">
            <Link
              href={detailHref}
              className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full border border-brand-forest/20 bg-white py-2 text-xs font-semibold text-brand-forest transition-colors hover:bg-brand-sage/50"
            >
              Ver detalle
              <ArrowRight className="h-3 w-3" />
            </Link>
            <Link
              href={loginHref}
              className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full bg-brand-forest py-2 text-xs font-semibold text-white transition-colors hover:bg-brand-forest/90"
            >
              <Lock className="h-3 w-3" />
              Comprar
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
