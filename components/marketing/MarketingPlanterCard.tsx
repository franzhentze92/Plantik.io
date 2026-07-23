import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Lock } from "lucide-react";
import { Planter } from "@/types";
import { formatQ } from "@/lib/utils";

export function MarketingPlanterCard({ planter }: { planter: Planter }) {
  const detailHref = `/productos/macetas/${planter.id}`;
  const loginHref = `/login?next=${encodeURIComponent(`/app/macetas/${planter.id}`)}`;

  return (
    <article className="card-surface group flex flex-col overflow-hidden">
      <Link href={detailHref} className="relative block h-44 w-full overflow-hidden bg-white">
        <Image
          src={planter.image}
          alt={planter.name}
          fill
          className="object-contain p-3 transition-transform duration-300 group-hover:scale-105"
        />
        <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-semibold text-brand-forest">
          Talla {planter.size}
        </span>
      </Link>

      <div className="flex flex-1 flex-col p-4">
        <Link href={detailHref}>
          <h3 className="text-sm font-semibold text-brand-carbon transition-colors group-hover:text-brand-forest">
            {planter.name}
          </h3>
          <p className="text-xs text-brand-carbon/50">
            {planter.material} · {planter.color}
          </p>
        </Link>

        {planter.shortDescription && (
          <p className="mt-2 line-clamp-2 text-[11px] leading-relaxed text-brand-carbon/55">
            {planter.shortDescription}
          </p>
        )}

        <p className="mt-2 text-[11px] text-brand-carbon/45">
          {planter.diameterCm} cm ·{" "}
          {planter.placement === "ambos"
            ? "Interior y exterior"
            : planter.placement === "interior"
              ? "Interior"
              : "Exterior"}
          {planter.drainage ? " · Con drenaje" : ""}
        </p>

        <div className="mt-auto pt-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-brand-forest">
              {formatQ(planter.priceQ)}
            </span>
            <span className="text-[11px] text-brand-carbon/50">
              {planter.style === "Estándar" || /^epa$/i.test(planter.style)
                ? planter.material
                : planter.style}
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
