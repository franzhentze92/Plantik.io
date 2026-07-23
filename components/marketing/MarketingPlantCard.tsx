import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Leaf, Lock, Moon, Sun, SunMedium } from "lucide-react";
import { isCatalogProductId } from "@/lib/catalog-ids";
import { Plant } from "@/types";
import { formatQ } from "@/lib/utils";

const LIGHT_META: Record<Plant["light"], { icon: typeof Sun; label: string }> = {
  baja: { icon: Moon, label: "Luz baja" },
  media: { icon: SunMedium, label: "Luz media" },
  alta: { icon: Sun, label: "Luz alta" },
};

export function MarketingPlantCard({ plant }: { plant: Plant }) {
  const light = LIGHT_META[plant.light] ?? LIGHT_META.media;
  const LightIcon = light.icon;
  const detailHref = `/productos/plantas/${plant.slug}`;
  const loginHref = `/login?next=${encodeURIComponent(`/app/plantas/${plant.slug}`)}`;
  const useContain = isCatalogProductId(plant.id);

  return (
    <article className="card-surface group flex flex-col overflow-hidden">
      <Link
        href={detailHref}
        className={`relative block h-44 w-full overflow-hidden ${useContain ? "bg-white" : ""}`}
      >
        <Image
          src={plant.images[0]}
          alt={plant.name}
          fill
          className={`${useContain ? "object-contain p-3" : "object-cover"} transition-transform duration-300 group-hover:scale-105`}
        />

        {plant.stock === "agotado" && (
          <span className="absolute left-3 top-3 rounded-full bg-brand-carbon/80 px-2.5 py-1 text-[10px] font-semibold text-white">
            Agotado
          </span>
        )}
        {plant.stock === "pocas_unidades" && (
          <span className="absolute left-3 top-3 rounded-full bg-brand-terracotta px-2.5 py-1 text-[10px] font-semibold text-white">
            Pocas unidades
          </span>
        )}

        <span className="absolute bottom-3 left-3 flex h-7 w-7 items-center justify-center rounded-full bg-white/85 text-brand-moss shadow-soft backdrop-blur">
          <Leaf className="h-3.5 w-3.5" />
        </span>
      </Link>

      <div className="flex flex-1 flex-col p-4">
        <Link href={detailHref}>
          <h3 className="text-sm font-semibold text-brand-carbon transition-colors group-hover:text-brand-forest">
            {plant.name}
          </h3>
        </Link>

        {plant.shortDescription && (
          <p className="mt-2 line-clamp-2 text-[11px] leading-relaxed text-brand-carbon/55">
            {plant.shortDescription}
          </p>
        )}

        <div className="mt-auto pt-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-brand-forest">
              {formatQ(plant.basePriceQ)}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-brand-sage px-2.5 py-1 text-[11px] font-medium text-brand-forest">
              <LightIcon className="h-3 w-3" />
              {light.label}
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
