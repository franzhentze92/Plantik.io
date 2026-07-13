import { NextRequest, NextResponse } from "next/server";
import { analyzeSpaceImage } from "@/lib/ai/analyze-space";
import { SpaceQuestionnaire } from "@/types/space-analysis";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { imageBase64, imageMediaType, questionnaire } = body;

    if (!imageBase64 || !imageMediaType || !questionnaire) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate image media type
    const validMimeTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!validMimeTypes.includes(imageMediaType)) {
      return NextResponse.json(
        { error: "Invalid image format" },
        { status: 400 }
      );
    }

    // Call Claude API to analyze space
    const analysis = await analyzeSpaceImage(
      imageBase64,
      imageMediaType as "image/jpeg" | "image/png" | "image/webp",
      questionnaire as SpaceQuestionnaire
    );

    return NextResponse.json({ analysis }, { status: 200 });
  } catch (error) {
    console.error("Error analyzing space:", error);

    const message =
      error instanceof Error ? error.message : "Análisis fallido";

    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
