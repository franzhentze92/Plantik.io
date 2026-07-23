/**
 * Retail markup applied to EPA wholesale prices at catalog mapping time.
 * Keeps source DB unchanged so EPA re-imports do not overwrite retail pricing.
 */

export type EpaRetailCategory =
  | "plant"
  | "planter"
  | "plato"
  | "sustrato"
  | "mulch";

/** Recargo sobre precio EPA (multiplicador = 1 + rate). */
export const EPA_MARKUP_RATE: Record<EpaRetailCategory, number> = {
  plant: 0.35,
  planter: 0.2,
  plato: 0.5,
  sustrato: 0.3,
  mulch: 0.4,
};

function roundPriceQ(amount: number): number {
  return Math.round(amount * 100) / 100;
}

/** Apply category markup to an EPA price in quetzales. */
export function applyEpaRetailMarkup(
  epaPriceQ: number,
  category: EpaRetailCategory
): number {
  const wholesale = Number(epaPriceQ);
  if (!Number.isFinite(wholesale) || wholesale <= 0) return 0;

  const rate = EPA_MARKUP_RATE[category] ?? 0;
  return roundPriceQ(wholesale * (1 + rate));
}

/** Approximate gross margin from a markup rate: rate / (1 + rate). */
export function grossMarginFromMarkupRate(rate: number): number {
  return rate / (1 + rate);
}
