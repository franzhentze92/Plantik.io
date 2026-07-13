"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { PlantCard } from "@/components/plants/PlantCard";
import { PlanterCard } from "@/components/plants/PlanterCard";
import { getPlantsCached, getPlantersCached } from "@/lib/supabase-queries";
import { Plant, Planter } from "@/types";

export function FeaturedProducts() {
  const [plants, setPlants] = useState<Plant[]>([]);
  const [planters, setPlanters] = useState<Planter[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    Promise.all([getPlantsCached(), getPlantersCached()]).then(
      ([plantsData, plantersData]) => {
        if (!active) return;
        setPlants(plantsData);
        setPlanters(plantersData);
        setLoading(false);
      }
    );
    return () => {
      active = false;
    };
  }, []);

  const featuredPlants = plants.slice(0, 4);
  const featuredPlanters = planters.slice(0, 3);

  return (
    <>
      <section className="container-app pt-12 sm:pt-16">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <span className="eyebrow">Del catálogo</span>
            <h2 className="mt-3 font-serif text-2xl text-brand-forest sm:text-3xl">
              Plantas para llevar hoy.
            </h2>
          </div>
          <Link
            href="/app/plantas"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-forest"
          >
            Ver todas
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {loading ? (
          <ProductSkeleton count={4} />
        ) : (
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {featuredPlants.map((plant) => (
              <PlantCard key={plant.id} plant={plant} />
            ))}
          </div>
        )}
      </section>

      <section className="container-app pt-12 sm:pt-16">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <span className="eyebrow">Macetas</span>
            <h2 className="mt-3 font-serif text-2xl text-brand-forest sm:text-3xl">
              Encuentra la maceta perfecta.
            </h2>
          </div>
          <Link
            href="/app/plantas?tab=macetas"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-forest"
          >
            Ver todas
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {loading ? (
          <ProductSkeleton count={3} />
        ) : (
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {featuredPlanters.map((planter) => (
              <PlanterCard key={planter.id} planter={planter} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}

function ProductSkeleton({ count }: { count: number }) {
  return (
    <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="h-72 animate-pulse rounded-xl2 border border-brand-beige/60 bg-brand-cream/60"
        />
      ))}
    </div>
  );
}
