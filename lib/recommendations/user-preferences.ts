export interface RecommendationUserPreferences {
  roomType?: string;
  hasPets?: boolean;
  directSun?: boolean;
  maxBudget?: number;
  preferredSizes?: string[];
  desiredMaintenance?: "easy" | "moderate" | "demanding";
}
