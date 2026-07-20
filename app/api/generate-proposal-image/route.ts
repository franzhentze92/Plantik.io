import { NextRequest, NextResponse } from "next/server";
import { generateProposalImage } from "@/lib/ai/generate-proposal-image";

// Hint for platforms that honor it (Amplify Hosting still caps ~30s).
export const maxDuration = 60;
export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { imageBase64, imageMediaType, items } = body;

    if (!imageBase64 || !imageMediaType || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Missing imageBase64, imageMediaType, or items" },
        { status: 400 }
      );
    }

    const { imageBase64: generatedImageBase64, mediaType } =
      await generateProposalImage(
        imageBase64,
        imageMediaType as "image/jpeg" | "image/png" | "image/webp",
        items
      );

    return NextResponse.json(
      { imageBase64: generatedImageBase64, mediaType },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error generating proposal image:", error);
    const message =
      error instanceof Error ? error.message : "Error generating proposal image";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
