import { Planter } from "@/types";

// A decorative planter (cachepot) should comfortably fit the plant's nursery
// pot: a little larger than the pot diameter, but not so large the plant looks
// lost. These margins are derived from the real pot/planter diameters in the
// catalog rather than any hardcoded id list.
const MIN_MARGIN_CM = 1;
const MAX_MARGIN_CM = 10;

/**
 * Returns the planters that fit a plant with the given nursery-pot diameter,
 * ordered from the snuggest fit to the roomiest. Fully data-driven: nothing is
 * hardcoded, so adding or editing planters in the DB updates recommendations.
 */
export function getCompatiblePlanters(
  potDiameterCm: number,
  planters: Planter[]
): Planter[] {
  if (!potDiameterCm || potDiameterCm <= 0) return [];

  return planters
    .filter((planter) => {
      const margin = planter.diameterCm - potDiameterCm;
      return margin >= MIN_MARGIN_CM && margin <= MAX_MARGIN_CM;
    })
    .sort((a, b) => a.diameterCm - b.diameterCm);
}
