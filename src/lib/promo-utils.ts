import { Promo } from "./firestore";

/**
 * Compute the best promo price for a given product from a list of active promos.
 * Returns null if no promo applies.
 */
export function getPromoPrice(productId: string, basePrice: number, promos: Promo[]): number | null {
  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

  let bestPrice: number | null = null;

  for (const promo of promos) {
    if (!promo.active) continue;
    // Check date range
    if (promo.startDate && todayStr < promo.startDate) continue;
    if (promo.endDate && todayStr > promo.endDate) continue;
    // Check product scope
    if (promo.productIds.length > 0 && !promo.productIds.includes(productId)) continue;

    let discounted: number;
    if (promo.type === 'percent') {
      discounted = basePrice * (1 - promo.value / 100);
    } else {
      discounted = basePrice - promo.value;
    }
    discounted = Math.max(0, Number(discounted.toFixed(2)));

    if (bestPrice === null || discounted < bestPrice) {
      bestPrice = discounted;
    }
  }

  return bestPrice !== null && bestPrice < basePrice ? bestPrice : null;
}
