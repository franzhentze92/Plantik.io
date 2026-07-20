/** Public catalog id/slug prefix (neutral — not the source vendor). */
export const CATALOG_ID_PREFIX = "pk-";

/** Older prefix kept only so existing links/carts keep resolving. */
export const LEGACY_CATALOG_ID_PREFIX = "epa-";

export function isCatalogProductId(id: string): boolean {
  return (
    id.startsWith(CATALOG_ID_PREFIX) || id.startsWith(LEGACY_CATALOG_ID_PREFIX)
  );
}

export function stripCatalogIdPrefix(id: string): string {
  if (id.startsWith(CATALOG_ID_PREFIX)) {
    return id.slice(CATALOG_ID_PREFIX.length);
  }
  if (id.startsWith(LEGACY_CATALOG_ID_PREFIX)) {
    return id.slice(LEGACY_CATALOG_ID_PREFIX.length);
  }
  return id;
}

export function toCatalogProductId(rawId: string): string {
  return `${CATALOG_ID_PREFIX}${stripCatalogIdPrefix(rawId)}`;
}

/** Neutral style label when the source catalog left none. */
export function catalogStyleLabel(
  collection?: string | null,
  design?: string | null
): string {
  const value = (collection || design || "").trim();
  if (!value || /^epa$/i.test(value)) return "Estándar";
  return value;
}
