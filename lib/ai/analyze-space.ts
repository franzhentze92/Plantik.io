import OpenAI from "openai";
import { roomAnalysisSchema, RoomAnalysisInput } from "./room-analysis-schema";
import { generateRoomAnalysisPrompt } from "./room-analysis-prompt";
import { SpaceQuestionnaire, RoomAnalysis } from "@/types/space-analysis";
import { annotateImageWithGrid } from "./annotate-image";

console.log("🔍 OPENAI_API_KEY exists:", !!process.env.OPENAI_API_KEY);
console.log("🔍 API Key preview:", process.env.OPENAI_API_KEY?.substring(0, 10));

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function analyzeSpaceImage(
  imageBase64: string,
  imageMediaType: "image/jpeg" | "image/png" | "image/webp",
  questionnaire: SpaceQuestionnaire
): Promise<RoomAnalysis> {
  const prompt = generateRoomAnalysisPrompt(questionnaire);
  const originalBuffer = Buffer.from(imageBase64, "base64");
  const gridBuffer = await annotateImageWithGrid(originalBuffer);
  const gridBase64 = gridBuffer.toString("base64");

  try {
    const response = await client.chat.completions.create({
      model: "gpt-4o",
      max_tokens: 1500,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image_url",
              image_url: {
                url: `data:${imageMediaType};base64,${imageBase64}`,
                detail: "high",
              },
            },
            {
              type: "text",
              text: "The image above is the room, unmarked, for judging light/style/colors. The image below is the EXACT SAME photo with a red reference grid overlaid: vertical/horizontal lines every 10%, labeled 0-100 along the top and left edges. Use ONLY this second image to read off x,y percentage coordinates for placements, by finding the nearest grid lines to the empty surface you're pointing at.",
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/png;base64,${gridBase64}`,
                detail: "high",
              },
            },
            {
              type: "text",
              text: prompt,
            },
          ],
        },
      ],
    });

    // Extract text response
    const textContent = response.choices[0]?.message?.content;
    if (!textContent) {
      throw new Error("No text response from OpenAI");
    }

    // Parse JSON response (strip markdown code fences if present)
    let analysisData: RoomAnalysisInput;
    try {
      const cleaned = textContent
        .trim()
        .replace(/^```(?:json)?\s*/i, "")
        .replace(/\s*```$/i, "");
      analysisData = JSON.parse(cleaned);
    } catch (e) {
      console.error("Failed to parse OpenAI response:", textContent);
      throw new Error("Invalid JSON response from analysis");
    }

    // Validate with Zod
    const validatedAnalysis = roomAnalysisSchema.parse(analysisData);

    return validatedAnalysis as RoomAnalysis;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Space analysis failed: ${error.message}`);
    }
    throw error;
  }
}

export async function analyzeSpaceImageFromUrl(
  imageUrl: string,
  questionnaire: SpaceQuestionnaire
): Promise<RoomAnalysis> {
  const prompt = generateRoomAnalysisPrompt(questionnaire);

  try {
    const response = await client.chat.completions.create({
      model: "gpt-4o",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image_url",
              image_url: {
                url: imageUrl,
              },
            },
            {
              type: "text",
              text: prompt,
            },
          ],
        },
      ],
    });

    const textContent = response.choices[0]?.message?.content;
    if (!textContent) {
      throw new Error("No text response from OpenAI");
    }

    let analysisData: RoomAnalysisInput;
    try {
      analysisData = JSON.parse(textContent);
    } catch (e) {
      console.error("Failed to parse OpenAI response:", textContent);
      throw new Error("Invalid JSON response from analysis");
    }

    const validatedAnalysis = roomAnalysisSchema.parse(analysisData);
    return validatedAnalysis as RoomAnalysis;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Space analysis failed: ${error.message}`);
    }
    throw error;
  }
}
