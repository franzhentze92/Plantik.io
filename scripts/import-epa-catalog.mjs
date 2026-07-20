/**
 * Scrapes an EPA (gt.epaenlinea.com) category catalog and upserts every
 * product (price, sale price, availability, images, full spec attributes)
 * into Supabase (public.epa_products + public.epa_product_images).
 *
 * Repeatable: re-running refreshes prices / availability / images.
 *
 * Usage:
 *   node scripts/import-epa-catalog.mjs
 *   CATEGORY_URL="https://gt.epaenlinea.com/exteriores/plantas-naturales.html" CATEGORY="plantas-naturales" node scripts/import-epa-catalog.mjs
 *   CATEGORY_URL="https://gt.epaenlinea.com/exteriores/sustratos.html" CATEGORY="sustratos" node scripts/import-epa-catalog.mjs
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ---- config -------------------------------------------------------------
const CATEGORY_URL =
  process.env.CATEGORY_URL || "https://gt.epaenlinea.com/exteriores/macetas.html";
const CATEGORY = process.env.CATEGORY || "macetas";
const UA = "Mozilla/5.0 (compatible; VerdeaCatalogImporter/1.0)";
const DETAIL_CONCURRENCY = 6;
const MAX_PAGES = 30;
const REQUEST_DELAY_MS = 150;

// ---- env / supabase -----------------------------------------------------
function loadEnv() {
  const envPath = path.join(__dirname, "..", ".env.local");
  const out = {};
  try {
    for (const line of readFileSync(envPath, "utf8").split(/\r?\n/)) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/i);
      if (m) out[m[1]] = m[2].replace(/^["']|["']$/g, "");
    }
  } catch {}
  return out;
}
const env = loadEnv();
const SUPABASE_URL =
  process.env.SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("Missing Supabase credentials (.env.local).");
  process.exit(1);
}
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: false },
});

// ---- helpers ------------------------------------------------------------
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function cleanCatalogName(name = "") {
  return name
    .replace(/\s*\([^)]*[Rr]etiro en [Tt]ienda\)\s*/g, " ")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function decodeEntities(str = "") {
  return str
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(parseInt(d, 10)))
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .trim();
}

function stripTags(html = "") {
  return decodeEntities(html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " "));
}

async function fetchText(url, tries = 3) {
  for (let attempt = 1; attempt <= tries; attempt++) {
    try {
      const res = await fetch(url, { headers: { "User-Agent": UA } });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.text();
    } catch (err) {
      if (attempt === tries) throw err;
      await sleep(500 * attempt);
    }
  }
}

// Extract a balanced JSON array/object starting at the '[' or '{' at `start`.
function extractBalanced(text, start) {
  const open = text[start];
  const close = open === "[" ? "]" : "}";
  let depth = 0;
  let inStr = false;
  let esc = false;
  for (let i = start; i < text.length; i++) {
    const c = text[i];
    if (inStr) {
      if (esc) esc = false;
      else if (c === "\\") esc = true;
      else if (c === '"') inStr = false;
    } else if (c === '"') inStr = true;
    else if (c === open) depth++;
    else if (c === close) {
      depth--;
      if (depth === 0) return text.slice(start, i + 1);
    }
  }
  return null;
}

// ---- listing ------------------------------------------------------------
async function collectProductUrls() {
  const urls = new Map(); // url -> listing image (fallback)
  for (let p = 1; p <= MAX_PAGES; p++) {
    const pageUrl = p === 1 ? CATEGORY_URL : `${CATEGORY_URL}?p=${p}`;
    const html = await fetchText(pageUrl);
    const before = urls.size;
    const re =
      /<a class="product-item-link"\s+href="([^"]+)"/g;
    let m;
    while ((m = re.exec(html))) {
      if (!urls.has(m[1])) urls.set(m[1], null);
    }
    const added = urls.size - before;
    console.log(`  page ${p}: +${added} products (total ${urls.size})`);
    if (added === 0) break;
    await sleep(REQUEST_DELAY_MS);
  }
  return [...urls.keys()];
}

// ---- detail parsing -----------------------------------------------------
function parseJsonLdProduct(html) {
  const re =
    /<script[^>]+type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi;
  let m;
  while ((m = re.exec(html))) {
    try {
      const json = JSON.parse(m[1].trim());
      const arr = Array.isArray(json) ? json : [json];
      for (const node of arr) {
        if (node && node["@type"] === "Product") return node;
      }
    } catch {}
  }
  return null;
}

function parseAttributes(html) {
  const attrs = {};
  const tableStart = html.indexOf('id="product-attribute-specs-table"');
  if (tableStart === -1) return attrs;
  const tableEnd = html.indexOf("</table>", tableStart);
  const table = html.slice(tableStart, tableEnd === -1 ? undefined : tableEnd);
  const rowRe =
    /<th[^>]*class="col label"[^>]*>([\s\S]*?)<\/th>\s*<td[^>]*class="col data"[^>]*>([\s\S]*?)<\/td>/gi;
  let m;
  while ((m = rowRe.exec(table))) {
    const key = stripTags(m[1]);
    const val = stripTags(m[2]);
    if (key) attrs[key] = val;
  }
  return attrs;
}

function parseSku(html) {
  const idx = html.indexOf('class="product attribute sku"');
  if (idx === -1) return null;
  const m = html
    .slice(idx, idx + 400)
    .match(/<div class="value"[^>]*>([\s\S]*?)<\/div>/i);
  return m ? stripTags(m[1]) : null;
}

function parsePrices(html, jsonLdPrice) {
  const finalMatch = html.match(
    /data-price-amount="([\d.]+)"[\s\S]{0,300}?data-price-type="finalPrice"/i
  );
  const oldMatch = html.match(
    /data-price-amount="([\d.]+)"[\s\S]{0,300}?data-price-type="oldPrice"/i
  );
  const price =
    jsonLdPrice != null
      ? Number(jsonLdPrice)
      : finalMatch
      ? Number(finalMatch[1])
      : null;
  const regular = oldMatch ? Number(oldMatch[1]) : price;
  return { price, regular, onSale: !!oldMatch };
}

function parseGallery(html) {
  const anchor = html.indexOf('"mage/gallery/gallery"');
  if (anchor === -1) return [];
  const dataKey = html.indexOf('"data"', anchor);
  if (dataKey === -1) return [];
  const bracket = html.indexOf("[", dataKey);
  if (bracket === -1) return [];
  const raw = extractBalanced(html, bracket);
  if (!raw) return [];
  try {
    const arr = JSON.parse(raw);
    return arr
      .map((g, i) => ({
        url: g.full || g.img || g.thumb,
        isMain: !!g.isMain,
        order: Number(g.position) || i + 1,
      }))
      .filter((g) => g.url);
  } catch {
    return [];
  }
}

function slugFromUrl(url) {
  try {
    const p = new URL(url).pathname;
    return p.replace(/^\//, "").replace(/\.html$/, "");
  } catch {
    return null;
  }
}

async function scrapeProduct(url) {
  const html = await fetchText(url);
  const ld = parseJsonLdProduct(html) || {};
  const offer = Array.isArray(ld.offers) ? ld.offers[0] : ld.offers || {};

  const idMatch = html.match(/data-product-id="(\d+)"/);
  const sku = parseSku(html);
  const id = idMatch ? idMatch[1] : sku || slugFromUrl(url);

  const { price, regular, onSale } = parsePrices(html, offer?.price);
  const availability = (offer?.availability || "").includes("InStock")
    ? "in_stock"
    : (offer?.availability || "").includes("OutOfStock")
    ? "out_of_stock"
    : null;
  const attributes = parseAttributes(html);
  const gallery = parseGallery(html);
  const primaryImage =
    (typeof ld.image === "string" ? ld.image : ld.image?.[0]) ||
    gallery.find((g) => g.isMain)?.url ||
    gallery[0]?.url ||
    null;

  return {
    product: {
      id: String(id),
      sku,
      name: ld.name
        ? cleanCatalogName(decodeEntities(ld.name))
        : slugFromUrl(url),
      slug: slugFromUrl(url),
      url,
      description: ld.description ? decodeEntities(ld.description) : null,
      category: CATEGORY,
      source_category_url: CATEGORY_URL,
      currency: offer?.priceCurrency || "GTQ",
      price_q: price,
      regular_price_q: regular,
      on_sale: onSale,
      availability,
      in_stock: availability ? availability === "in_stock" : null,
      condition: (offer?.itemCondition || "").includes("New") ? "new" : null,
      brand:
        (typeof ld.brand === "object" ? ld.brand?.name : ld.brand) ||
        offer?.seller?.name ||
        null,
      image_url: primaryImage,
      attributes,
      raw: ld,
      scraped_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    images: gallery,
  };
}

// ---- persistence --------------------------------------------------------
async function persist({ product, images }) {
  const { error: upErr } = await supabase
    .from("epa_products")
    .upsert(product, { onConflict: "id" });
  if (upErr) throw new Error(`upsert product ${product.id}: ${upErr.message}`);

  await supabase.from("epa_product_images").delete().eq("product_id", product.id);
  if (images.length) {
    const rows = images.map((g) => ({
      product_id: product.id,
      image_url: g.url,
      is_main: g.isMain,
      display_order: g.order,
    }));
    // de-dup by url (unique constraint)
    const seen = new Set();
    const deduped = rows.filter((r) =>
      seen.has(r.image_url) ? false : seen.add(r.image_url)
    );
    const { error: imgErr } = await supabase
      .from("epa_product_images")
      .insert(deduped);
    if (imgErr) throw new Error(`images ${product.id}: ${imgErr.message}`);
  }
}

// ---- pool ---------------------------------------------------------------
async function runPool(items, worker, concurrency) {
  const results = [];
  let idx = 0;
  async function next() {
    while (idx < items.length) {
      const i = idx++;
      try {
        results[i] = await worker(items[i], i);
      } catch (err) {
        results[i] = { error: err.message, item: items[i] };
      }
      await sleep(REQUEST_DELAY_MS);
    }
  }
  await Promise.all(
    Array.from({ length: Math.min(concurrency, items.length) }, next)
  );
  return results;
}

// ---- main ---------------------------------------------------------------
async function main() {
  console.log(`Importing EPA catalog: ${CATEGORY_URL}`);
  console.log("1) Collecting product URLs...");
  let urls = await collectProductUrls();
  console.log(`   Found ${urls.length} products.\n`);
  if (process.env.LIMIT) urls = urls.slice(0, Number(process.env.LIMIT));

  console.log("2) Scraping detail pages + upserting...");
  let ok = 0;
  const failures = [];
  const results = await runPool(
    urls,
    async (url, i) => {
      const data = await scrapeProduct(url);
      await persist(data);
      ok++;
      const p = data.product;
      console.log(
        `   [${i + 1}/${urls.length}] ${p.id} ${p.on_sale ? "(SALE) " : ""}Q${p.price_q} ${p.availability} - ${p.name.slice(0, 60)}`
      );
      return p.id;
    },
    DETAIL_CONCURRENCY
  );

  for (const r of results) if (r && r.error) failures.push(r);

  console.log(`\nDone. Imported ${ok}/${urls.length}.`);
  if (failures.length) {
    console.log(`Failures (${failures.length}):`);
    for (const f of failures) console.log(`  - ${f.item}: ${f.error}`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
