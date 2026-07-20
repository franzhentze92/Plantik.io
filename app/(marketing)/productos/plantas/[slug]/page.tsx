import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Droplets, PawPrint, Ruler, Sun } from "lucide-react";
import {
  getAllPlantSlugs,
  getPlantBySlug,
  getPlantersFromDB,
  getAccessoriesFromDB,
} from "@/lib/supabase-queries";
import { isCatalogProductId } from "@/lib/catalog-ids";
import { buildRelatedProducts } from "@/lib/recommendations/related-products";
import { LoginToBuyPanel } from "@/components/marketing/LoginToBuyPanel";
import { ProductRecommendations } from "@/components/plants/ProductRecommendations";

const LIGHT_LABEL: Record<string, string> = {
  baja: "Baja",
  media: "Media",
  alta: "Alta",
};

export const revalidate = 60;

export async function generateStaticParams() {
  const slugs = await getAllPlantSlugs();
  return slugs.map((slug) => ({ slug }));
}

export default async function MarketingPlantDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const plant = await getPlantBySlug(params.slug);
  if (!plant) return notFound();

  const useContain = isCatalogProductId(plant.id);
  const [allPlanters, allAccessories] = await Promise.all([
    getPlantersFromDB(),
    getAccessoriesFromDB(),
  ]);
  const recommendations = buildRelatedProducts(
    { kind: "plant", product: plant },
    { plants: [], planters: allPlanters, accessories: allAccessories },
    "marketing"
  );

  const loginNext = `/app/plantas/${plant.slug}`;

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
          <div className={`overflow-hidden rounded-xl2 shadow-card ${useContain ? "bg-white" : ""}`}>
            <Image
              src={plant.images[0]}
              alt={plant.name}
              width={900}
              height={900}
              className={`h-[420px] w-full ${useContain ? "object-contain p-6" : "object-cover"}`}
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
            {plant.description &&
              plant.description !== plant.shortDescription && (
                <p className="mt-2 text-sm text-brand-carbon/60">
                  {plant.description}
                </p>
              )}

            <LoginToBuyPanel
              priceQ={plant.basePriceQ}
              stockQuantity={plant.stockQuantity}
              soldOut={plant.stock === "agotado"}
              loginNext={loginNext}
            />

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
