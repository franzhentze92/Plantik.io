import Image from "next/image";
import { notFound } from "next/navigation";
import {
  getAllPlantSlugs,
  getPlantBySlug,
  getPlantersFromDB,
  getAccessoriesFromDB,
} from "@/lib/supabase-queries";
import { buildRelatedProducts } from "@/lib/recommendations/related-products";
import { Droplets, Sun, PawPrint, Ruler } from "lucide-react";
import { PlantBuyPanel } from "@/components/plants/PlantBuyPanel";
import { ProductRecommendations } from "@/components/plants/ProductRecommendations";

const LIGHT_LABEL: Record<string, string> = {
  baja: "Baja",
  media: "Media",
  alta: "Alta",
};

// Revalidate the cached page hourly so catalog edits still propagate.
export const revalidate = 3600;

export async function generateStaticParams() {
  const slugs = await getAllPlantSlugs();
  return slugs.map((slug) => ({ slug }));
}

export default async function PlantDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const plant = await getPlantBySlug(params.slug);

  if (!plant) return notFound();

  const isEpa = plant.id.startsWith("epa-");
  const [allPlanters, allAccessories] = await Promise.all([
    getPlantersFromDB(),
    getAccessoriesFromDB(),
  ]);
  const recommendations = buildRelatedProducts(
    { kind: "plant", product: plant },
    { plants: [], planters: allPlanters, accessories: allAccessories },
    "app"
  );

  return (
    <div className="container-app py-10">
      <div className="grid gap-10 lg:grid-cols-2">
        <div className={`overflow-hidden rounded-xl2 shadow-card ${isEpa ? "bg-white" : ""}`}>
          <Image
            src={plant.images[0]}
            alt={plant.name}
            width={900}
            height={900}
            className={`h-[420px] w-full ${isEpa ? "object-contain p-6" : "object-cover"}`}
          />
        </div>

        <div>
          {plant.category[0] && (
            <span className="eyebrow">{plant.category[0]}</span>
          )}
          <h1 className="mt-2 font-serif text-3xl text-brand-forest">
            {plant.name}
          </h1>
          <p className="text-sm italic text-brand-carbon/50">
            {plant.scientificName}
          </p>
          {plant.shortDescription && (
            <p className="mt-4 text-sm text-brand-carbon/75">
              {plant.shortDescription}
            </p>
          )}
          {plant.description && plant.description !== plant.shortDescription && (
            <p className="mt-2 text-sm text-brand-carbon/60">
              {plant.description}
            </p>
          )}

          <PlantBuyPanel plant={plant} />

          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <InfoTile
              icon={Sun}
              label="Luz"
              value={LIGHT_LABEL[plant.light] ?? plant.light}
            />
            <InfoTile
              icon={Droplets}
              label="Riego"
              value={`c/${plant.wateringFrequencyDays}d`}
            />
            <InfoTile
              icon={PawPrint}
              label="Mascotas"
              value={plant.petFriendly ? "Apta" : "No apta"}
            />
            <InfoTile
              icon={Ruler}
              label="Altura adulta"
              value={`${plant.matureHeightCm}cm`}
            />
          </div>
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
  icon: typeof Sun;
  label: string;
  value: string;
}) {
  return (
    <div className="card-surface flex flex-col items-center gap-1.5 p-3 text-center">
      <Icon className="h-4 w-4 text-brand-forest" />
      <span className="text-[11px] text-brand-carbon/50">{label}</span>
      <span className="text-xs font-semibold capitalize text-brand-carbon">
        {value}
      </span>
    </div>
  );
}
