import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Blend, Home, Trees } from "lucide-react";
import { ACCESSORY_ICONS } from "@/lib/accessory-icons";
import { getAccessoryFilterLabel } from "@/lib/catalog-filters";
import { LoginToBuyPanel } from "@/components/marketing/LoginToBuyPanel";
import {
  getAccessoryById,
  getAccessoriesFromDB,
  getPlantsFromDB,
  getPlantersFromDB,
} from "@/lib/supabase-queries";
import { buildRelatedProducts } from "@/lib/recommendations/related-products";
import { ProductRecommendations } from "@/components/plants/ProductRecommendations";
import type { Accessory, AccessoryCategory } from "@/data/accessories";

const CATEGORY_LABEL: Record<AccessoryCategory, string> = {
  plato: "Plato macetero",
  sustrato: "Sustrato",
  mulch: "Cubierta para maceta",
};

const PLACEMENT_META: Record<
  Accessory["placement"],
  { label: string; icon: typeof Home }
> = {
  interior: { label: "Interior", icon: Home },
  exterior: { label: "Exterior", icon: Trees },
  ambos: { label: "Interior y exterior", icon: Blend },
};

export const revalidate = 3600;

export default async function MarketingAccessoryDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const accessory = await getAccessoryById(params.id);
  if (!accessory) return notFound();

  const [allAccessories, allPlants, allPlanters] = await Promise.all([
    getAccessoriesFromDB(),
    getPlantsFromDB(),
    getPlantersFromDB(),
  ]);
  const recommendations = buildRelatedProducts(
    { kind: "accessory", product: accessory },
    { plants: allPlants, planters: allPlanters, accessories: allAccessories },
    "marketing"
  );

  const Icon = ACCESSORY_ICONS[accessory.iconKey];
  const categoryLabel = CATEGORY_LABEL[accessory.category];
  const placement = PLACEMENT_META[accessory.placement];
  const PlacementIcon = placement.icon;

  const attrEntries = Object.entries(accessory.attrs)
    .map(([key, value]) => ({
      key,
      label: getAccessoryFilterLabel(accessory.category, key, value) ?? value,
    }))
    .filter((a) => a.label && a.label !== "ninguno");

  return (
    <div className="min-h-screen bg-brand-cream text-brand-carbon">
      <div className="w-full px-4 py-8 sm:px-6 lg:px-10 xl:px-12">
        <Link
          href="/productos"
          className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-brand-forest hover:opacity-70"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver al catálogo
        </Link>

        <div className="grid gap-10 lg:grid-cols-2">
          <div
            className={`flex h-[420px] items-center justify-center overflow-hidden rounded-xl2 shadow-card ${accessory.image ? "bg-white" : ""}`}
            style={accessory.image ? undefined : { backgroundColor: accessory.swatch }}
          >
            {accessory.image ? (
              <Image
                src={accessory.image}
                alt={accessory.name}
                width={900}
                height={900}
                className="h-full w-full object-contain p-6"
              />
            ) : (
              <span className="flex h-32 w-32 items-center justify-center rounded-full bg-white/70 shadow-soft ring-1 ring-black/5 backdrop-blur">
                <Icon className="h-14 w-14 text-brand-carbon/70" />
              </span>
            )}
          </div>

          <div>
            <span className="eyebrow">{categoryLabel}</span>
            <h1 className="mt-2 font-serif text-3xl text-brand-forest">
              {accessory.name}
            </h1>
            <p className="mt-4 text-sm text-brand-carbon/75">
              {accessory.description}
            </p>

            <div className="mt-6 flex flex-wrap gap-2">
              {attrEntries.map((attr) => (
                <span
                  key={attr.key}
                  className="rounded-full border border-brand-beige bg-white px-3 py-1.5 text-xs font-medium text-brand-carbon/70"
                >
                  {attr.label}
                </span>
              ))}
              <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-beige bg-white px-3 py-1.5 text-xs font-medium text-brand-carbon/70">
                <PlacementIcon className="h-3.5 w-3.5 text-brand-forest" />
                {placement.label}
              </span>
            </div>

            <LoginToBuyPanel
              priceQ={accessory.priceQ}
              loginNext={`/app/accesorios/${accessory.id}`}
            />
          </div>
        </div>

        <ProductRecommendations groups={recommendations} />
      </div>
    </div>
  );
}
