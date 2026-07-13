import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import {
  getPlanterById,
  getPlantsFromDB,
  getAccessoriesFromDB,
} from "@/lib/supabase-queries";
import { buildRelatedProducts } from "@/lib/recommendations/related-products";
import { MarketingPlanterPreview } from "@/components/marketing/MarketingPlanterPreview";
import { ProductRecommendations } from "@/components/plants/ProductRecommendations";

export const revalidate = 3600;

export default async function MarketingPlanterDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const planter = await getPlanterById(params.id);
  if (!planter) return notFound();

  const [allPlants, allAccessories] = await Promise.all([
    getPlantsFromDB(),
    getAccessoriesFromDB(),
  ]);
  const recommendations = buildRelatedProducts(
    { kind: "planter", product: planter },
    { plants: allPlants, planters: [], accessories: allAccessories },
    "marketing"
  );

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

        <MarketingPlanterPreview planter={planter} />

        <ProductRecommendations groups={recommendations} />
      </div>
    </div>
  );
}
