import { z } from "zod";

export const placementSchema = z.object({
  id: z.string(),
  x: z.number().min(0).max(100),
  y: z.number().min(0).max(100),
  placementType: z.enum(["floor", "table", "shelf", "hanging"]),
  recommendedPlantSize: z.enum(["desktop", "small", "medium", "large"]),
  availableWidth: z.enum(["narrow", "medium", "wide"]),
  reasoning: z.string(),
});

export const roomAnalysisSchema = z.object({
  roomType: z.enum([
    "bedroom",
    "living-room",
    "office",
    "bathroom",
    "balcony",
    "dining-room",
    "kitchen",
    "other",
  ]),
  lightLevel: z.enum(["very-low", "low", "medium", "bright"]),
  directSun: z.boolean(),
  estimatedSpaceSize: z.enum(["small", "medium", "large"]),
  styles: z.array(
    z.enum([
      "minimalist",
      "modern",
      "boho",
      "tropical",
      "rustic",
      "industrial",
      "classic",
      "japandi",
    ])
  ),
  dominantColors: z.array(z.string()).max(8),
  placements: z.array(placementSchema).max(6),
  warnings: z.array(z.string()).default([]),
  confidence: z.number().min(0).max(1),
});

export type RoomAnalysisInput = z.infer<typeof roomAnalysisSchema>;
