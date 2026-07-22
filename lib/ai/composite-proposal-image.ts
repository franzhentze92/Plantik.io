import fs from "fs";
import path from "path";
import sharp from "sharp";
import { PlacementLocation } from "@/types/space-analysis";
import { Plant } from "@/types";
import {
  removeStudioBackground,
  trimTransparent,
  knockoutLightBackground,
} from "./remove-studio-background";

interface ProposalPlantPlacement {
  plant: Plant;
  placement: PlacementLocation;
  quantity: number;
  planter?: { name: string; color: string; material: string; image?: string };
  plato?: { name: string; color?: string; material?: string; image?: string };
}

export interface CompositedProposalImage {
  imageBase64: string;
  mediaType: "image/jpeg";
}

const HEIGHT_FRACTION: Record<string, number> = {
  desktop: 0.16,
  small: 0.24,
  medium: 0.34,
  large: 0.48,
};

const SIZE_ORDER = ["desktop", "small", "medium", "large"];

/** Keep semi-transparent leaf tips (anti-alias). */
const TIP_ALPHA = 10;
/** Floor / pot base only — ignore soft fringe below. */
const BASE_ALPHA = 170;

function plantSizeBucket(heightCm: number): string {
  if (heightCm >= 150) return "large";
  if (heightCm >= 60) return "medium";
  if (heightCm >= 30) return "small";
  return "desktop";
}

function effectivePlacementSize(plant: Plant, recommended: string): string {
  if (SIZE_ORDER.includes(recommended)) return recommended;
  return plantSizeBucket(plant.currentHeightCm || 40);
}

async function loadImageBuffer(src?: string): Promise<Buffer | null> {
  if (!src || src.endsWith(".svg") || src.includes("plant-placeholder")) {
    return null;
  }
  try {
    if (/^https?:\/\//i.test(src)) {
      const res = await fetch(src, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (compatible; PlantikComposite/1.0; +https://plantik.local)",
          Accept: "image/avif,image/webp,image/apng,image/*,*/*;q=0.8",
        },
      });
      if (!res.ok) return null;
      return Buffer.from(await res.arrayBuffer());
    }
    return fs.readFileSync(path.join(process.cwd(), "public", src));
  } catch {
    return null;
  }
}

async function alphaBounds(
  input: Buffer,
  minAlpha: number
): Promise<{ left: number; top: number; width: number; height: number } | null> {
  const { data, info } = await sharp(input)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;
  let minX = width;
  let minY = height;
  let maxX = -1;
  let maxY = -1;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (data[(y * width + x) * channels + 3] >= minAlpha) {
        if (x < minX) minX = x;
        if (y < minY) minY = y;
        if (x > maxX) maxX = x;
        if (y > maxY) maxY = y;
      }
    }
  }
  if (maxX < 0) return null;
  return {
    left: minX,
    top: minY,
    width: maxX - minX + 1,
    height: maxY - minY + 1,
  };
}

/** Last row that looks like a real product base (not a thin drop-shadow tip). */
async function solidBottomY(input: Buffer, minAlpha: number): Promise<number> {
  const { data, info } = await sharp(input)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;
  // Shadows under catalog pots are sparse; the real base spans a wide band.
  const minSolid = Math.max(8, Math.floor(width * 0.1));
  for (let y = height - 1; y >= 0; y--) {
    let count = 0;
    for (let x = 0; x < width; x++) {
      if (data[(y * width + x) * channels + 3] >= minAlpha) {
        count++;
        if (count >= minSolid) return y;
      }
    }
  }
  return height - 1;
}

/**
 * Remove only sparse fringe under a single product cutout (studio shadow tips).
 * Never use "dark = shadow" — that destroys black/anthracite pots.
 */
async function stripBakedShadow(input: Buffer): Promise<Buffer> {
  const { data, info } = await sharp(input)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;
  // Only wipe very sparse rows (true shadow tips), not the product body.
  const minProduct = Math.max(6, Math.floor(width * 0.08));

  for (let y = height - 1; y >= Math.floor(height * 0.7); y--) {
    let solid = 0;
    for (let x = 0; x < width; x++) {
      if (data[(y * width + x) * channels + 3] >= 40) solid++;
    }
    if (solid < minProduct) {
      for (let x = 0; x < width; x++) {
        data[(y * width + x) * channels + 3] = 0;
      }
      continue;
    }
    break;
  }

  return sharp(data, { raw: { width, height, channels: 4 } })
    .png()
    .toBuffer();
}

/**
 * Keep leaf tips (low alpha) on top/sides; crop only empty padding and
 * soft fringe BELOW the solid base so the pin anchor stays correct.
 */
async function trimKeepTips(input: Buffer): Promise<Buffer> {
  const soft = await alphaBounds(input, TIP_ALPHA);
  if (!soft) return sharp(input).png().toBuffer();

  const bottom = await solidBottomY(input, BASE_ALPHA);
  const left = Math.max(0, soft.left);
  const top = Math.max(0, soft.top);
  const right = Math.min(
    (await sharp(input).metadata()).width! - 1,
    soft.left + soft.width - 1
  );
  const cropBottom = Math.max(top + 1, Math.min(bottom, soft.top + soft.height - 1));
  const width = Math.max(2, right - left + 1);
  const height = Math.max(2, cropBottom - top + 1);

  return sharp(input)
    .extract({ left, top, width, height })
    .png()
    .toBuffer();
}

async function prepareCutout(
  src?: string,
  opts?: { stripShadow?: boolean; isAccessory?: boolean }
): Promise<Buffer | null> {
  const raw = await loadImageBuffer(src);
  if (!raw) return null;

  const sized = await sharp(raw)
    .rotate()
    .resize(1200, 1200, { fit: "inside", withoutEnlargement: true })
    .png()
    .toBuffer();

  let cut: Buffer | null = null;
  try {
    const { removeBackground } = await import(
      "@imgly/background-removal-node"
    );
    const blob = await removeBackground(sized, {
      model: "medium",
      output: { format: "image/png", quality: 0.95 },
    });
    cut = Buffer.from(await blob.arrayBuffer());
  } catch (err) {
    console.warn("IMG.LY cutout unavailable, using studio flood-fill:", err);
  }

  if (!cut) {
    try {
      cut = await removeStudioBackground(sized);
    } catch {
      cut = sized;
    }
  }

  const base = cut ?? sized;
  // Never run knockoutLightBackground on macetas/platos: ivory/beige/white
  // pots get erased as "studio white" and only dark shreds remain.
  let out: Buffer;
  if (opts?.isAccessory) {
    out = await trimKeepTips(await trimTransparent(base));
  } else {
    const cleaned = await knockoutLightBackground(base);
    out = await trimKeepTips(await trimTransparent(cleaned));
  }
  if (opts?.stripShadow) {
    out = await trimKeepTips(await stripBakedShadow(out));
  }
  return out;
}

function isGreenFoliage(r: number, g: number, b: number): boolean {
  // Broad green detection (olive / lime / dark leaf).
  return g > 40 && g >= r - 12 && g > b + 3;
}

/**
 * Cut away the catalog nursery pot (terracotta, black plastic, beige…)
 * so only crown + a thin stem remain for the selected maceta.
 */
async function stripNurseryPot(plantCutout: Buffer): Promise<Buffer> {
  const { data, info } = await sharp(plantCutout)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;
  const cx = width / 2;

  // Detect pot top: first lower row where non-green mass is wide (pot body/rim).
  let potTop = Math.floor(height * 0.72);
  const scanFrom = Math.floor(height * 0.28);
  for (let y = scanFrom; y < height; y++) {
    let nonGreen = 0;
    let green = 0;
    for (let x = 0; x < width; x++) {
      const o = (y * width + x) * channels;
      if (data[o + 3] < 40) continue;
      if (isGreenFoliage(data[o], data[o + 1], data[o + 2])) green++;
      else nonGreen++;
    }
    if (nonGreen > width * 0.22 && nonGreen > green * 0.85) {
      potTop = y;
      break;
    }
  }
  // Include the rim a bit above the detected line.
  potTop = Math.max(Math.floor(height * 0.35), potTop - Math.floor(height * 0.03));

  // Wipe everything from pot top down.
  for (let y = potTop; y < height; y++) {
    for (let x = 0; x < width; x++) {
      data[(y * width + x) * channels + 3] = 0;
    }
  }

  // In the band just above the pot, keep greens + a narrow central stem only.
  const stemBand = Math.floor(height * 0.18);
  const stemFrom = Math.max(0, potTop - stemBand);
  const stemHalf = Math.max(4, Math.floor(width * 0.07));
  for (let y = stemFrom; y < potTop; y++) {
    for (let x = 0; x < width; x++) {
      const o = (y * width + x) * channels;
      if (data[o + 3] === 0) continue;
      const r = data[o];
      const g = data[o + 1];
      const b = data[o + 2];
      if (isGreenFoliage(r, g, b)) continue;
      if (Math.abs(x - cx) <= stemHalf) continue;
      data[o + 3] = 0;
    }
  }

  // Soft fade only the stem (not green fronds) into the decorative pot.
  for (let y = stemFrom; y < potTop; y++) {
    const t = (y - stemFrom) / Math.max(1, potTop - stemFrom);
    const fade = t < 0.65 ? 1 : Math.max(0, 1 - (t - 0.65) / 0.35);
    if (fade >= 0.99) continue;
    for (let x = 0; x < width; x++) {
      const o = (y * width + x) * channels;
      if (data[o + 3] === 0) continue;
      if (isGreenFoliage(data[o], data[o + 1], data[o + 2])) continue;
      data[o + 3] = Math.round(data[o + 3] * fade);
    }
  }

  return trimKeepTips(
    await sharp(data, { raw: { width, height, channels: 4 } })
      .png()
      .toBuffer()
  );
}

async function extractFoliage(plantCutout: Buffer): Promise<Buffer> {
  return stripNurseryPot(plantCutout);
}

async function resizeToWidth(buf: Buffer, width: number): Promise<Buffer> {
  return trimKeepTips(
    await sharp(buf)
      .resize({
        width: Math.max(8, Math.round(width)),
        fit: "inside",
        // Avoid sharpening that hardens tip edges into a box.
        kernel: sharp.kernel.lanczos3,
      })
      .png()
      .toBuffer()
  );
}

async function resizeToHeight(buf: Buffer, height: number): Promise<Buffer> {
  return trimKeepTips(
    await sharp(buf)
      .resize({
        height: Math.max(8, Math.round(height)),
        fit: "inside",
        kernel: sharp.kernel.lanczos3,
      })
      .png()
      .toBuffer()
  );
}

/** Pack plato → maceta → follaje (sin agujeros en la maceta). */
async function buildPlantStack(item: ProposalPlantPlacement): Promise<Buffer> {
  const plantCut = await prepareCutout(item.plant.images?.[0]);
  if (!plantCut) {
    throw new Error(
      `No se pudo cargar la foto de "${item.plant.name}" del catálogo.`
    );
  }

  const potCut = item.planter?.image
    ? await prepareCutout(item.planter.image, {
        stripShadow: true,
        isAccessory: true,
      })
    : null;
  const platoCut = item.plato?.image
    ? await prepareCutout(item.plato.image, {
        stripShadow: true,
        isAccessory: true,
      })
    : null;

  if (!potCut && !platoCut) {
    return plantCut;
  }

  const potTargetH = 320;
  const pot = potCut ? await resizeToHeight(potCut, potTargetH) : null;
  const potMeta = pot ? await sharp(pot).metadata() : null;
  const potW = potMeta?.width ?? 280;
  const potH = potMeta?.height ?? potTargetH;

  const plato = platoCut
    ? await resizeToWidth(platoCut, Math.round(potW * 1.15))
    : null;
  const platoMeta = plato ? await sharp(plato).metadata() : null;
  const platoW = platoMeta?.width ?? 0;
  const platoH = platoMeta?.height ?? 0;

  // Only crown + thin stem — nursery pot fully removed.
  const foliageSrc = pot ? await extractFoliage(plantCut) : plantCut;
  const foliage = await resizeToHeight(
    foliageSrc,
    pot ? Math.round(potH * 2.2) : 560
  );
  const fMeta = await sharp(foliage).metadata();
  const fW = fMeta.width!;
  const fH = fMeta.height!;

  const platoOverlap = plato ? Math.round(platoH * 0.48) : 0;
  // Shallow tuck into the rim so fronds start near the top of the pot.
  const potOverlap = pot ? Math.round(potH * 0.05) : 0;

  const pad = 28;
  const contentW = Math.max(platoW, potW, fW) + pad * 2;
  const tipPad = 20;
  const contentH =
    tipPad +
    fH +
    (pot ? potH - potOverlap : 0) +
    (plato ? platoH - platoOverlap : 0) +
    2;

  let floorY = contentH;
  let platoTop = 0;
  let potTop = 0;

  if (plato) {
    platoTop = floorY - platoH;
    floorY = platoTop + platoOverlap;
  }
  if (pot) {
    potTop = floorY - potH;
    floorY = potTop + potOverlap;
  }
  const foliageTop = Math.max(tipPad, floorY - fH);

  // Opaque pot under foliage — never punch holes in the maceta.
  const layers: Array<{ input: Buffer; left: number; top: number }> = [];
  if (plato) {
    layers.push({
      input: plato,
      left: Math.round((contentW - platoW) / 2),
      top: platoTop,
    });
  }
  if (pot) {
    layers.push({
      input: pot,
      left: Math.round((contentW - potW) / 2),
      top: potTop,
    });
  }
  layers.push({
    input: foliage,
    left: Math.round((contentW - fW) / 2),
    top: foliageTop,
  });

  const stacked = await sharp({
    create: {
      width: contentW,
      height: contentH,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite(layers)
    .png()
    .toBuffer();

  return trimKeepTips(stacked);
}

function buildContactShadow(width: number, height: number): Promise<Buffer> {
  const svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="g" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="black" stop-opacity="0.28"/>
        <stop offset="70%" stop-color="black" stop-opacity="0.08"/>
        <stop offset="100%" stop-color="black" stop-opacity="0"/>
      </radialGradient>
    </defs>
    <ellipse cx="${width / 2}" cy="${height / 2}" rx="${width * 0.48}" ry="${height * 0.38}" fill="url(#g)" />
  </svg>`;
  return sharp(Buffer.from(svg)).png().toBuffer();
}

/**
 * Scale to fit above the pin WITHOUT shearing tips. Base (solid bottom) on pin.
 */
async function placeStackAtPin(
  stack: Buffer,
  pinX: number,
  pinY: number,
  roomW: number,
  roomH: number,
  targetH: number
): Promise<{
  plant: { input: Buffer; left: number; top: number };
  shadow: { input: Buffer; left: number; top: number } | null;
}> {
  const topMargin = Math.round(roomH * 0.01);
  const sideMargin = Math.round(roomW * 0.01);
  const groundY = Math.round(pinY);

  const maxH = Math.max(40, groundY - topMargin);
  // Allow wider sprites so lateral leaf tips aren't force-squeezed.
  const maxHalfW = Math.max(
    24,
    Math.floor(Math.min(pinX - sideMargin, roomW - sideMargin - pinX) * 1.05)
  );
  const maxW = Math.max(48, Math.min(roomW - sideMargin * 2, maxHalfW * 2));
  const height = Math.min(targetH, maxH);

  let plantBuf = await trimKeepTips(
    await sharp(stack)
      .resize({
        width: maxW,
        height,
        fit: "inside",
        kernel: sharp.kernel.lanczos3,
      })
      .png()
      .toBuffer()
  );

  let meta = await sharp(plantBuf).metadata();
  let pW = meta.width!;
  let pH = meta.height!;
  let left = Math.round(pinX - pW / 2);
  let top = Math.round(groundY - pH);

  if (left < 0 || top < 0 || left + pW > roomW || top + pH > roomH) {
    const scale = Math.min(
      left < 0 || left + pW > roomW ? (roomW - sideMargin * 2) / pW : 1,
      top < 0 ? maxH / pH : 1,
      top + pH > roomH ? maxH / pH : 1,
      1
    );
    plantBuf = await trimKeepTips(
      await sharp(plantBuf)
        .resize({
          width: Math.max(16, Math.floor(pW * scale)),
          height: Math.max(16, Math.floor(pH * scale)),
          fit: "inside",
          kernel: sharp.kernel.lanczos3,
        })
        .png()
        .toBuffer()
    );
    meta = await sharp(plantBuf).metadata();
    pW = meta.width!;
    pH = meta.height!;
    left = Math.round(pinX - pW / 2);
    top = Math.round(groundY - pH);
    // Clamp horizontally only — never lift the base off the pin to "fit" tips
    // by chopping them; scaling above already preserves the full sprite.
    if (left < 0) left = 0;
    if (left + pW > roomW) left = Math.max(0, roomW - pW);
    if (top < 0) {
      const fit = maxH / pH;
      plantBuf = await trimKeepTips(
        await sharp(plantBuf)
          .resize({
            width: Math.max(16, Math.floor(pW * fit)),
            height: Math.max(16, Math.floor(pH * fit)),
            fit: "inside",
            kernel: sharp.kernel.lanczos3,
          })
          .png()
          .toBuffer()
      );
      meta = await sharp(plantBuf).metadata();
      pW = meta.width!;
      pH = meta.height!;
      left = Math.max(0, Math.min(Math.round(pinX - pW / 2), roomW - pW));
      top = Math.max(0, groundY - pH);
    }
  }

  const shadowW = Math.max(16, Math.round(pW * 0.5));
  const shadowH = Math.max(6, Math.round(pW * 0.07));
  const shadow = await buildContactShadow(shadowW, shadowH);

  return {
    plant: { input: plantBuf, left, top },
    shadow: {
      input: shadow,
      left: Math.max(0, Math.round(pinX - shadowW / 2)),
      top: Math.max(
        0,
        Math.min(Math.round(groundY - shadowH * 0.45), roomH - shadowH)
      ),
    },
  };
}

export async function compositeProposalImage(
  imageBase64: string,
  items: ProposalPlantPlacement[]
): Promise<CompositedProposalImage> {
  if (items.length === 0) {
    throw new Error("No plants to composite");
  }

  const roomBuffer = await sharp(Buffer.from(imageBase64, "base64"))
    .rotate()
    .resize(1600, 1600, { fit: "inside", withoutEnlargement: true })
    .jpeg({ quality: 92, mozjpeg: true })
    .toBuffer();

  const meta = await sharp(roomBuffer).metadata();
  const roomW = meta.width!;
  const roomH = meta.height!;

  const overlays: Array<{ input: Buffer; left: number; top: number }> = [];

  for (const item of items) {
    const y = Number(item.placement.y);
    const x = Number(item.placement.x);
    if (!Number.isFinite(x) || !Number.isFinite(y)) {
      throw new Error("Coordenadas de punto inválidas");
    }

    const stack = await buildPlantStack(item);
    const sizeKey = effectivePlacementSize(
      item.plant,
      item.placement.recommendedPlantSize
    );
    const depth = 0.9 + 0.2 * (y / 100);
    const targetH = Math.round(
      roomH * (HEIGHT_FRACTION[sizeKey] || 0.34) * depth
    );

    const placed = await placeStackAtPin(
      stack,
      (x / 100) * roomW,
      (y / 100) * roomH,
      roomW,
      roomH,
      targetH
    );

    if (placed.shadow) overlays.push(placed.shadow);
    overlays.push(placed.plant);
  }

  const composed = await sharp(roomBuffer)
    .composite(overlays)
    .jpeg({ quality: 92, mozjpeg: true })
    .toBuffer();

  return {
    imageBase64: composed.toString("base64"),
    mediaType: "image/jpeg",
  };
}
