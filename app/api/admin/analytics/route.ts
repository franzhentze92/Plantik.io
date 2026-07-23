import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import {
  getSalesAnalytics,
  type AnalyticsRange,
} from "@/lib/supabase/analytics-admin";

export const runtime = "nodejs";

const VALID_RANGES = new Set<AnalyticsRange>(["7d", "30d", "90d", "all"]);

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const rangeParam = request.nextUrl.searchParams.get("range") ?? "all";
  const range = VALID_RANGES.has(rangeParam as AnalyticsRange)
    ? (rangeParam as AnalyticsRange)
    : "all";

  try {
    const analytics = await getSalesAnalytics(range);
    return NextResponse.json(analytics);
  } catch (error) {
    console.error("Admin analytics error:", error);
    return NextResponse.json(
      { error: "No se pudieron cargar las analíticas." },
      { status: 500 }
    );
  }
}
