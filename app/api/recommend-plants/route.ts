import { NextRequest, NextResponse } from "next/server";
import { RoomAnalysis, PlacementLocation } from "@/types/space-analysis";
import { getPlantsFromDB } from "@/lib/supabase-queries";
import {
  recommendPlantsForAnalysis,
  scorePlantsForPlacement,
  getReasonsForScore,
} from "@/lib/recommendations/recommend-plants";
import { RecommendationUserPreferences } from "@/lib/recommendations/user-preferences";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { analysis, userPreferences, placementId, limit } = body;

    if (!analysis) {
      return NextResponse.json(
        { error: "Missing analysis data" },
        { status: 400 }
      );
    }

    const plants = await getPlantsFromDB();

    if (plants.length === 0) {
      return NextResponse.json(
        { error: "No plants found in catalog" },
        { status: 500 }
      );
    }

    const prefs = userPreferences as RecommendationUserPreferences | undefined;
    const roomAnalysis = analysis as RoomAnalysis;

    if (placementId) {
      const placement = roomAnalysis.placements.find(
        (p: PlacementLocation) => p.id === placementId
      );

      if (!placement) {
        return NextResponse.json(
          { error: "Placement not found" },
          { status: 404 }
        );
      }

      const scored = scorePlantsForPlacement(placement, roomAnalysis, plants, prefs);
      const capped =
        typeof limit === "number" && limit > 0 ? scored.slice(0, limit) : scored;

      const recommendations = capped.map(({ plant, score }) => {
        const { positive, warnings } = getReasonsForScore(score);
        return { plant, score, reasons: positive, warnings };
      });

      return NextResponse.json({ recommendations }, { status: 200 });
    }

    const limitPerPlacement =
      typeof limit === "number" && limit > 0 ? limit : 3;

    const recommendations = recommendPlantsForAnalysis(
      roomAnalysis,
      plants,
      prefs,
      limitPerPlacement
    ).map((rec) => ({
      ...rec,
      recommendations: rec.recommendations.map(({ plant, score }) => {
        const { positive, warnings } = getReasonsForScore(score);
        return { plant, score, reasons: positive, warnings };
      }),
    }));

    return NextResponse.json({ recommendations }, { status: 200 });
  } catch (error) {
    console.error("Error generating recommendations:", error);

    const message =
      error instanceof Error ? error.message : "Error generating recommendations";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
