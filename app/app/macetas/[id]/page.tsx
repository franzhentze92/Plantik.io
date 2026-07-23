"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useParams, useRouter, notFound } from "next/navigation";
import { ArrowLeft, Droplets, Ruler, Home, Trees } from "lucide-react";
import {
  getPlanterById,
  getPlantsCached,
  getAccessoriesCached,
} from "@/lib/supabase-queries";
import { Planter, Plant } from "@/types";
import type { Accessory } from "@/data/accessories";
import { buildRelatedProducts } from "@/lib/recommendations/related-products";
import { PlanterBuyPanel } from "@/components/plants/PlanterBuyPanel";
import { ProductRecommendations } from "@/components/plants/ProductRecommendations";

const colorSwatches: { [key: string]: string } = {
  Blanco: "#F5F1E8",
  Terracota: "#B5734A",
  Crema: "#E8DCC0",
  Gris: "#9C9C94",
  Negro: "#2A2A2A",
};

export default function PlanterDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [planter, setPlanter] = useState<Planter | null>(null);
  const [plants, setPlants] = useState<Plant[]>([]);
  const [accessories, setAccessories] = useState<Accessory[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedColor, setSelectedColor] = useState("");
  const [variantMissing, setVariantMissing] = useState(false);

  useEffect(() => {
    let active = true;
    Promise.all([
      getPlanterById(id),
      getPlantsCached(),
      getAccessoriesCached(),
    ]).then(([planterData, allPlants, allAccessories]) => {
      if (!active) return;
      setPlanter(planterData);
      setPlants(allPlants);
      setAccessories(allAccessories);
      if (planterData) setSelectedColor(planterData.color);
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [id]);

  const recommendations = useMemo(
    () =>
      planter
        ? buildRelatedProducts(
            { kind: "planter", product: planter },
            { plants, planters: [], accessories },
            "app"
          )
        : [],
    [planter, plants, accessories]
  );

  useEffect(() => {
    setVariantMissing(false);
  }, [selectedColor]);

  if (loading) {
    return (
      <div className="container-app py-16">
        <p className="text-brand-carbon/60">Cargando...</p>
      </div>
    );
  }

  if (!planter) return notFound();

  const activeVariant =
    planter.colorVariants.find((v) => v.color === selectedColor) ||
    planter.colorVariants[0];

  const isBaseColor = activeVariant.color === planter.color;
  const displayedImage =
    variantMissing && !isBaseColor ? planter.image : activeVariant.image;

  const placementLabel =
    planter.placement === "ambos"
      ? "Interior y exterior"
      : planter.placement === "interior"
        ? "Interior"
        : "Exterior";

  return (
    <div className="container-app py-10">
      <button
        onClick={() => router.push("/app/plantas?tab=macetas")}
        className="mb-6 flex items-center gap-2 text-sm font-semibold text-brand-forest hover:opacity-70"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver al catálogo
      </button>

      <div className="grid gap-10 lg:grid-cols-2">
        <div>
          <div className="overflow-hidden rounded-xl2 shadow-card bg-white">
            <Image
              key={activeVariant.image}
              src={displayedImage}
              alt={`${planter.name} — ${activeVariant.color}`}
              width={900}
              height={900}
              className="h-[420px] w-full object-contain p-6"
              onError={() => setVariantMissing(true)}
            />
          </div>
          {variantMissing && !isBaseColor && (
            <p className="mt-2 text-xs text-brand-carbon/50">
              Vista previa de {activeVariant.color} aún no disponible — mostrando
              el color base.
            </p>
          )}
        </div>

        <div>
          <span className="eyebrow">
            {planter.style === "Estándar" || /^epa$/i.test(planter.style)
              ? planter.material
              : planter.style}
          </span>
          <h1 className="mt-2 font-serif text-3xl text-brand-forest">
            {planter.name}
          </h1>
          <p className="text-sm text-brand-carbon/50">
            {planter.material} · {selectedColor}
          </p>

          {planter.description && (
            <p className="mt-4 text-sm leading-relaxed text-brand-carbon/75">
              {planter.description}
            </p>
          )}

          <div className="mt-6">
            <p className="text-xs font-semibold uppercase text-brand-carbon/60">
              Color · <span className="normal-case text-brand-carbon/50">{selectedColor}</span>
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {planter.colorVariants.map((variant) => {
                const isActive = variant.color === selectedColor;
                return (
                  <button
                    key={variant.color}
                    onClick={() => setSelectedColor(variant.color)}
                    title={variant.color}
                    className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                      isActive
                        ? "border-brand-forest bg-brand-forest/10 text-brand-forest"
                        : "border-brand-beige bg-white text-brand-carbon/70 hover:border-brand-forest/40"
                    }`}
                  >
                    <span
                      className="h-4 w-4 rounded-full border border-black/10"
                      style={{
                        backgroundColor: colorSwatches[variant.color] || "#ccc",
                      }}
                    />
                    {variant.color}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <InfoTile icon={Ruler} label="Diámetro" value={`${planter.diameterCm}cm`} />
            <InfoTile icon={Ruler} label="Talla" value={planter.size} />
            <InfoTile
              icon={Droplets}
              label="Drenaje"
              value={planter.drainage ? "Sí" : "No"}
            />
            <InfoTile
              icon={planter.placement === "exterior" ? Trees : Home}
              label="Uso"
              value={placementLabel}
            />
          </div>

          <PlanterBuyPanel
            planter={planter}
            selectedColor={selectedColor}
            displayedImage={displayedImage}
          />
        </div>
      </div>

      <ProductRecommendations groups={recommendations} />
    </div>
  );
}

function InfoTile({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Ruler;
  label: string;
  value: string;
}) {
  return (
    <div className="card-surface flex flex-col items-center gap-1.5 p-3 text-center">
      <Icon className="h-4 w-4 text-brand-forest" />
      <span className="text-[11px] text-brand-carbon/50">{label}</span>
      <span className="text-xs font-semibold text-brand-carbon">{value}</span>
    </div>
  );
}
