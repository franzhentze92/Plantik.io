import { NextRequest, NextResponse } from "next/server";
import { generateProposalImage } from "@/lib/ai/generate-proposal-image";

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

    const generatedImageBase64 = await generateProposalImage(
      imageBase64,
      imageMediaType,
      items
    );

    return NextResponse.json(
      { imageBase64: generatedImageBase64 },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error generating proposal image:", error);
    const message =
      error instanceof Error ? error.message : "Error generating proposal image";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
