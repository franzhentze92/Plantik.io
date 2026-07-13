"use client";

import { useEffect } from "react";
import { DashboardHero } from "@/components/home/DashboardHero";
import { DashboardStats } from "@/components/home/DashboardStats";
import { DashboardActivity } from "@/components/home/DashboardActivity";
import { QuickStart } from "@/components/home/QuickStart";
import { FeaturedProducts } from "@/components/home/FeaturedProducts";
import { Categories } from "@/components/home/Categories";
import { track } from "@/lib/analytics";

export default function HomePage() {
  useEffect(() => {
    track("page_view", { route: "/app" });
  }, []);

  return (
    <div className="pb-20">
      <DashboardHero />
      <DashboardStats />
      <DashboardActivity />
      <QuickStart />
      <FeaturedProducts />
      <Categories />
    </div>
  );
}
