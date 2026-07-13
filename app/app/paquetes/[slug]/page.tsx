"use client";

import { useEffect } from "react";
import Image from "next/image";
import { notFound, useParams } from "next/navigation";
import { getPackageBySlug } from "@/data/packages";
import { formatQ } from "@/lib/utils";
import { track } from "@/lib/analytics";
import { Check } from "lucide-react";

export default function PackageDetailPage() {
  const params = useParams<{ slug: string }>();
  const pkg = getPackageBySlug(params.slug);

  useEffect(() => {
    if (pkg) track("page_view", { route: `/app/paquetes/${pkg.slug}` });
  }, [pkg]);

  if (!pkg) return notFound();

  return (
    <div className="container-app py-10">
      <div className="grid gap-10 lg:grid-cols-2">
        <div className="overflow-hidden rounded-xl2 shadow-card">
          <Image
            src={pkg.image}
            alt={pkg.name}
            width={900}
            height={700}
            className="h-[380px] w-full object-cover"
          />
        </div>
        <div>
          <span className="eyebrow">Paquete</span>
          <h1 className="mt-2 font-serif text-3xl text-brand-forest">
            {pkg.name}
          </h1>
          <p className="mt-2 text-sm text-brand-carbon/70">{pkg.tagline}</p>

          <p className="mt-5 font-serif text-3xl text-brand-forest">
            Desde {formatQ(pkg.fromPriceQ)}
          </p>

          <ul className="mt-6 space-y-2">
            {pkg.includes.map((item) => (
              <li key={item} className="flex items-center gap-2 text-sm text-brand-carbon/80">
                <Check className="h-4 w-4 text-brand-moss" />
                {item}
              </li>
            ))}
          </ul>

          <button
            onClick={() =>
              track("package_selected", { productId: pkg.id, priceQ: pkg.fromPriceQ })
            }
            className="mt-8 rounded-full bg-brand-forest px-6 py-3 text-sm font-semibold text-white shadow-card"
          >
            Elegir este paquete
          </button>
        </div>
      </div>
    </div>
  );
}
