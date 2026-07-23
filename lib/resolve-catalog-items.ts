import type { CartItem, OrderItem } from "@/lib/store";
import {
  isCatalogProductId,
  toCatalogProductId,
} from "@/lib/catalog-ids";
import { stripPlantPackagingNoise } from "@/lib/plant-catalog-names";
import {
  getAccessoryById,
  getPlantById,
  getPlanterById,
} from "@/lib/supabase-queries";

function normalizeCatalogId(id: string): string {
  return isCatalogProductId(id) ? toCatalogProductId(id) : id;
}

function cleanStoredName(name: string): string {
  return stripPlantPackagingNoise(name);
}

async function resolveCatalogItemFields(
  item: Pick<CartItem, "id" | "kind" | "name" | "subtitle" | "image" | "priceQ">
): Promise<Pick<CartItem, "id" | "name" | "subtitle" | "image" | "priceQ">> {
  const id = normalizeCatalogId(item.id);

  if (isCatalogProductId(item.id)) {
    if (item.kind === "plant") {
      const plant = await getPlantById(id);
      if (plant) {
        return {
          id,
          name: plant.name,
          subtitle: plant.scientificName,
          image: plant.images[0] ?? item.image,
          priceQ: plant.basePriceQ,
        };
      }
    }

    if (item.kind === "planter") {
      const planter = await getPlanterById(id);
      if (planter) {
        return {
          id,
          name: planter.name,
          subtitle: planter.material,
          image: planter.image ?? item.image,
          priceQ: planter.priceQ,
        };
      }
    }

    if (item.kind === "accesorio") {
      const accessory = await getAccessoryById(id);
      if (accessory) {
        return {
          id,
          name: accessory.name,
          subtitle: accessory.description,
          image: item.image,
          priceQ: accessory.priceQ,
        };
      }
    }
  }

  return {
    id,
    name: cleanStoredName(item.name),
    subtitle: item.subtitle,
    image: item.image,
    priceQ: item.priceQ,
  };
}

/** Refresh cart line items from the live catalog before checkout. */
export async function resolveCartItemsForCheckout(
  items: CartItem[]
): Promise<CartItem[]> {
  return Promise.all(
    items.map(async (item) => ({
      ...item,
      ...(await resolveCatalogItemFields(item)),
    }))
  );
}

/** Fix legacy vendor titles on saved order lines when displaying history. */
export async function resolveOrderItemsForDisplay(
  items: OrderItem[]
): Promise<OrderItem[]> {
  return Promise.all(
    items.map(async (item) => ({
      ...item,
      ...(await resolveCatalogItemFields({
        id: item.id,
        kind: item.kind ?? "plant",
        name: item.name,
        subtitle: item.subtitle,
        image: item.image ?? "",
        priceQ: item.priceQ,
      })),
    }))
  );
}

/** Synchronous cleanup for persisted cart rehydration (no network). */
export function sanitizePersistedCartItem(item: CartItem): CartItem {
  return {
    ...item,
    id: normalizeCatalogId(item.id),
    name: cleanStoredName(item.name),
  };
}
