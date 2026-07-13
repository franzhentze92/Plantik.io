"use client";

import { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { packages } from "@/data/packages";
import { formatQ } from "@/lib/utils";
import { track } from "@/lib/analytics";

export default function PackagesPage() {
  useEffect(() => {
    track("page_view", { route: "/app/paquetes" });
  }, []);

  return (
    <div className="container-app py-10">
      <span className="eyebrow">Paquetes</span>
      <h1 className="mt-3 font-serif text-3xl text-brand-forest sm:text-4xl">
        Combinaciones listas para empezar
      </h1>
      <p className="mt-2 max-w-xl text-sm text-brand-carbon/65">
        Si prefieres no armar cada componente por separado, elige un paquete
        pensado para distintos niveles de involucramiento.
      </p>

      <div className="mt-8 grid gap-6 sm:grid-cols-2">
        {packages.map((pkg) => (
          <Link
            key={pkg.id}
            href={`/app/paquetes/${pkg.slug}`}
            onClick={() =>
              track("package_viewed", { productId: pkg.id, priceQ: pkg.fromPriceQ })
            }
            className="card-surface group flex overflow-hidden"
          >
            <div className="relative h-auto w-40 shrink-0 overflow-hidden">
              <Image
                src={pkg.image}
                alt={pkg.name}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
            </div>
            <div className="flex flex-1 flex-col justify-between p-5">
              <div>
                <h3 className="font-serif text-xl text-brand-forest">
                  {pkg.name}
                </h3>
                <p className="mt-1 text-xs text-brand-carbon/60">{pkg.tagline}</p>
                <ul className="mt-3 flex flex-wrap gap-1.5">
                  {pkg.includes.map((i) => (
                    <li
                      key={i}
                      className="rounded-full bg-brand-sage px-2.5 py-1 text-[10px] font-medium text-brand-forest"
                    >
                      {i}
                    </li>
                  ))}
                </ul>
              </div>
              <p className="mt-4 text-sm font-semibold text-brand-forest">
                Desde {formatQ(pkg.fromPriceQ)}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
