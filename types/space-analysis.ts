export type RoomType =
  | "bedroom"
  | "living-room"
  | "office"
  | "bathroom"
  | "balcony"
  | "dining-room"
  | "kitchen"
  | "other";

export type LightLevelAnalysis =
  | "very-low"
  | "low"
  | "medium"
  | "bright";

export type EstimatedSize = "small" | "medium" | "large";

export type DecorativeStyle =
  | "minimalist"
  | "modern"
  | "boho"
  | "tropical"
  | "rustic"
  | "industrial"
  | "classic"
  | "japandi";

export type PlacementType = "floor" | "table" | "shelf" | "hanging";

export type PlantSizeRecommendation = "desktop" | "small" | "medium" | "large";

export type AvailableWidth = "narrow" | "medium" | "wide";

export interface PlacementLocation {
  id: string;
  x: number;
  y: number;
  placementType: PlacementType;
  recommendedPlantSize: PlantSizeRecommendation;
  availableWidth: AvailableWidth;
  reasoning: string;
  /** Where the placement came from. Defaults to AI-detected. */
  source?: "ai" | "manual";
}

export interface RoomAnalysis {
  roomType: RoomType;
  lightLevel: LightLevelAnalysis;
  directSun: boolean;
  estimatedSpaceSize: EstimatedSize;
  styles: DecorativeStyle[];
  dominantColors: string[];
  placements: PlacementLocation[];
  warnings: string[];
  confidence: number;
}

export interface Space {
  id: string;
  session_id: string;
  name?: string;
  room_type?: RoomType;
  created_at: string;
  updated_at: string;
}

export interface SpaceImage {
  id: string;
  space_id: string;
  storage_path: string;
  public_url?: string;
  width?: number;
  height?: number;
  created_at: string;
}

export interface SpaceAnalysisRecord {
  id: string;
  space_id: string;
  image_id?: string;
  status: "pending" | "analyzing" | "completed" | "failed";
  room_type?: RoomType;
  light_level?: LightLevelAnalysis;
  direct_sun?: boolean;
  estimated_space_size?: EstimatedSize;
  styles: DecorativeStyle[];
  dominant_colors: string[];
  placements: PlacementLocation[];
  warnings: string[];
  confidence?: number;
  raw_response?: RoomAnalysis;
  error_message?: string;
  created_at: string;
  completed_at?: string;
}

export interface PlantRecommendation {
  id: string;
  analysis_id: string;
  plant_id: string;
  placement_id?: string;
  score: number;
  reasons: string[];
  warnings: string[];
  rank?: number;
  created_at: string;
}

export interface SpaceQuestionnaire {
  roomType?: RoomType;
  directSun?: boolean;
  hasPets?: boolean;
  desiredMaintenance?: "easy" | "moderate" | "demanding";
  budget?: number;
  preferredSizes?: PlantSizeRecommendation[];
  desiredPurchase?: "plant" | "with-planter" | "full-setup";
}
