"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter, notFound } from "next/navigation";
import { ArrowLeft, Home, Trees, Blend } from "lucide-react";
import { ACCESSORY_ICONS } from "@/lib/accessory-icons";
import { getAccessoryFilterLabel } from "@/lib/catalog-filters";
import { AccessoryBuyPanel } from "@/components/plants/AccessoryBuyPanel";
import {
  getAccessoryById,
  getAccessoriesCached,
  getPlantsCached,
  getPlantersCached,
} from "@/lib/supabase-queries";
import { buildRelatedProducts } from "@/lib/recommendations/related-products";
import { ProductRecommendations } from "@/components/plants/ProductRecommendations";
import type { Accessory, AccessoryCategory } from "@/data/accessories";
import type { Plant, Planter } from "@/types";

const CATEGORY_LABEL: Record<AccessoryCategory, string> = {
  plato: "Plato macetero",
  sustrato: "Sustrato",
  mulch: "Cubierta para maceta",
};

const CATEGORY_TAB: Record<AccessoryCategory, string> = {
  plato: "platos",
  sustrato: "sustratos",
  mulch: "mulch",
};

const PLACEMENT_META: Record<
  Accessory["placement"],
  { label: string; icon: typeof Home }
> = {
  interior: { label: "Interior", icon: Home },
  exterior: { label: "Exterior", icon: Trees },
  ambos: { label: "Interior y exterior", icon: Blend },
};

export default function AccessoryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [accessory, setAccessory] = useState<Accessory | null>(null);
  const [accessories, setAccessories] = useState<Accessory[]>([]);
  const [plants, setPlants] = useState<Plant[]>([]);
  const [planters, setPlanters] = useState<Planter[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    Promise.all([
      getAccessoryById(id),
      getAccessoriesCached(),
      getPlantsCached(),
      getPlantersCached(),
    ]).then(([item, allAccessories, allPlants, allPlanters]) => {
      if (!active) return;
      setAccessory(item);
      setAccessories(allAccessories);
      setPlants(allPlants);
      setPlanters(allPlanters);
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [id]);

  const recommendations = useMemo(
    () =>
      accessory
        ? buildRelatedProducts(
            { kind: "accessory", product: accessory },
            { plants, planters, accessories },
            "app"
          )
        : [],
    [accessory, plants, planters, accessories]
  );

  if (loading) {
    return (
      <div className="container-app py-16">
        <p className="text-brand-carbon/60">Cargando...</p>
      </div>
    );
  }

  if (!accessory) return notFound();

  const Icon = ACCESSORY_ICONS[accessory.iconKey];
  const categoryLabel = CATEGORY_LABEL[accessory.category];
  const tab = CATEGORY_TAB[accessory.category];
  const placement = PLACEMENT_META[accessory.placement];
  const PlacementIcon = placement.icon;

  const attrEntries = Object.entries(accessory.attrs)
    .map(([key, value]) => ({
      key,
      label: getAccessoryFilterLabel(accessory.category, key, value) ?? value,
    }))
    .filter((a) => a.label && a.label !== "ninguno");

  return (
    <div className="container-app py-10">
      <button
        onClick={() => router.push(`/app/plantas?tab=${tab}`)}
        className="mb-6 flex items-center gap-2 text-sm font-semibold text-brand-forest hover:opacity-70"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver al catálogo
      </button>

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

          <AccessoryBuyPanel accessory={accessory} />
        </div>
      </div>

      <ProductRecommendations groups={recommendations} />
    </div>
  );
}
