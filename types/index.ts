// Core domain types for the Plantik prototype.
// These are intentionally simple/flat so they can be swapped for
// generated types (e.g. from Supabase) once a real backend exists.

export type LightLevel = "baja" | "media" | "alta";
export type CareLevel = "facil" | "moderado" | "exigente";
export type Placement = "interior" | "exterior" | "ambos";

export interface PlantSize {
  id: string;
  label: string;
  priceQ: number;
  heightCm?: number;
  stock?: number;
}

export interface Plant {
  id: string;
  slug: string;
  name: string;
  scientificName: string;
  shortDescription: string;
  description: string;
  category: string[];
  sizes: PlantSize[];
  basePriceQ: number;
  light: LightLevel;
  care: CareLevel;
  wateringFrequencyDays: number;
  petFriendly: boolean;
  placement: Placement;
  currentHeightCm: number;
  matureHeightCm: number;
  potDiameterCm: number;
  smartCareCompatible: boolean;
  stock: "disponible" | "pocas_unidades" | "agotado";
  stockQuantity: number;
  tags: string[];
  images: string[];
}

export interface PlanterColorVariant {
  color: string;
  image: string;
}

export interface Planter {
  id: string;
  name: string;
  shortDescription: string;
  description: string;
  material: string;
  color: string;
  size: string;
  diameterCm: number;
  style: string;
  priceQ: number;
  drainage: boolean;
  placement: Placement;
  image: string;
  colorVariants: PlanterColorVariant[];
}

export interface Decoration {
  id: string;
  name: string;
  category: string;
  priceQ: number;
  image: string;
}

export interface SmartCareProduct {
  id: string;
  name: string;
  description: string;
  priceQ: number;
  features: string[];
  image: string;
}

export interface PackageItem {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  includes: string[];
  fromPriceQ: number;
  image: string;
  smartCare: boolean;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  quote: string;
  avatar: string;
}

export interface RoomExample {
  id: string;
  label: string;
  spaceType: string;
  image: string;
}

export interface RoomAnswers {
  spaceType: string;
  light?: string;
  pets?: string;
  maintenance?: string;
  budget?: string;
  style?: string;
  onlyNatural?: boolean;
  wantsSmartCare?: boolean;
}

export interface AiRecommendationSet {
  id: string;
  matchesSpaceType: string[];
  matchesStyle: string[];
  summaryText: string;
  style: string;
  colorPalette: string[];
  maintenanceLevel: CareLevel;
  estimatedBudgetQ: [number, number];
  plantIds: string[];
  planterIds: string[];
  markers: { x: number; y: number; label: string }[];
}

export interface ProposalItem {
  plantId: string;
  planterId?: string;
  decorationIds: string[];
  smartCareId?: string;
}

export interface Proposal {
  id: string;
  name: string;
  createdAt: string;
  photo?: string;
  items: ProposalItem[];
  estimatedPriceQ: number;
  status: "borrador" | "lista" | "en_carrito" | "compartida";
}

export type AnalyticsEventName =
  | "page_view"
  | "upload_started"
  | "upload_completed"
  | "analysis_completed"
  | "recommendation_viewed"
  | "plant_selected"
  | "planter_selected"
  | "decoration_selected"
  | "smart_care_selected"
  | "package_viewed"
  | "package_selected"
  | "proposal_saved"
  | "add_to_cart"
  | "checkout_started"
  | "checkout_completed"
  | "survey_completed"
  | "abandonment_step"
  | "space_upload_started"
  | "space_analysis_started"
  | "space_analysis_completed"
  | "space_analysis_failed"
  | "space_marker_selected"
  | "space_manual_placement_added"
  | "plant_recommendation_selected"
  | "proposal_created"
  | "proposal_save_failed"
  | "proposal_visualization_generated"
  | "proposal_visualization_failed";

export interface AnalyticsEvent {
  timestamp: string;
  sessionId: string;
  route: string;
  eventName: AnalyticsEventName;
  payload?: Record<string, unknown>;
  productId?: string;
  priceQ?: number;
  configuratorStep?: string;
}
