import { PlacementLocation } from "@/types/space-analysis";
import { Plant } from "@/types";
import { compositeProposalImage } from "./composite-proposal-image";

interface ProposalPlantPlacement {
  plant: Plant;
  placement: PlacementLocation;
  quantity: number;
  planter?: { name: string; color: string; material: string; image?: string };
  plato?: { name: string; color?: string; material?: string; image?: string };
}

export interface GeneratedProposalImage {
  imageBase64: string;
  mediaType: "image/jpeg";
}

/**
 * Place catalog cutouts (plato → maceta → planta) on the pin.
 * Deterministic: correct position, size, and selected accessories.
 */
export async function generateProposalImage(
  imageBase64: string,
  imageMediaType: "image/jpeg" | "image/png" | "image/webp",
  items: ProposalPlantPlacement[]
): Promise<GeneratedProposalImage> {
  void imageMediaType;
  return compositeProposalImage(imageBase64, items);
}
