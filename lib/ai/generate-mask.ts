import sharp from "sharp";

interface MaskRegion {
  xPercent: number;
  yPercent: number;
  recommendedPlantSize: string;
  placementType?: string;
}

/**
 * Horizontal radius stays tight so the model cannot slide the pot away from
 * the pin. Vertical radius is taller for floor plants so foliage has room.
 */
const radiusBySize: {
  [key: string]: { rx: number; ryFloor: number; rOther: number };
} = {
  desktop: { rx: 0.06, ryFloor: 0.16, rOther: 0.07 },
  small: { rx: 0.08, ryFloor: 0.22, rOther: 0.09 },
  medium: { rx: 0.1, ryFloor: 0.32, rOther: 0.12 },
  // Tall mask so LARGE plants aren't clipped by the editable region.
  large: { rx: 0.14, ryFloor: 0.48, rOther: 0.16 },
};

/** Within this % of an image edge, treat the pin as against a frame wall. */
const EDGE_ZONE = 28;

/**
 * Shift mask center toward room interior when pin is near a frame edge, so the
 * pot base stays on the wall side of the editable region.
 */
const WALL_BIAS = 0.72;

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

function wallBiasedCenter(
  xPercent: number,
  yPercent: number,
  width: number,
  height: number,
  rx: number,
  ry: number,
  isFloor: boolean
): { cx: number; cy: number } {
  const pinX = (xPercent / 100) * width;
  const pinY = (yPercent / 100) * height;

  // Floor: grow mostly upward from the pin; keep pin near the bottom of the ellipse.
  let cx = pinX;
  let cy = isFloor ? pinY - ry * 0.62 : pinY;

  const nearLeft = xPercent <= EDGE_ZONE;
  const nearRight = xPercent >= 100 - EDGE_ZONE;
  const nearTop = yPercent <= EDGE_ZONE;

  if (nearLeft && !nearRight) {
    cx = pinX + rx * WALL_BIAS;
  } else if (nearRight && !nearLeft) {
    cx = pinX - rx * WALL_BIAS;
  }

  if (!isFloor && nearTop) {
    cy = pinY + ry * WALL_BIAS * 0.65;
  }

  cx = clamp(cx, rx * 0.4, width - rx * 0.4);
  cy = clamp(cy, ry * 0.4, height - ry * 0.4);

  return { cx, cy };
}

/**
 * Builds a PNG mask matching the OpenAI images.edit contract: fully
 * transparent (alpha = 0) regions mark the placements the model is allowed
 * to edit; everything else is fully opaque so the API guarantees pixel-for-
 * pixel preservation of the rest of the photo.
 *
 * Floor masks are tall but horizontally narrow, anchored at the pin, so the
 * plant stays grounded at the marker instead of drifting into open floor.
 */
export async function buildPlacementMask(
  imageBuffer: Buffer,
  regions: MaskRegion[]
): Promise<Buffer> {
  const metadata = await sharp(imageBuffer).metadata();
  const width = metadata.width!;
  const height = metadata.height!;
  const maxDim = Math.max(width, height);

  const shapes = regions
    .map((region) => {
      const sizes =
        radiusBySize[region.recommendedPlantSize] || radiusBySize.medium;
      const nearFrameEdge =
        region.xPercent <= EDGE_ZONE ||
        region.xPercent >= 100 - EDGE_ZONE ||
        region.yPercent <= EDGE_ZONE;

      const squeeze = nearFrameEdge ? 0.85 : 1;
      const isFloor = region.placementType === "floor";

      if (isFloor) {
        const rx = sizes.rx * maxDim * squeeze;
        const ry = sizes.ryFloor * maxDim * squeeze;
        const { cx, cy } = wallBiasedCenter(
          region.xPercent,
          region.yPercent,
          width,
          height,
          rx,
          ry,
          true
        );
        return `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="white" />`;
      }

      const r = sizes.rOther * maxDim * squeeze;
      const { cx, cy } = wallBiasedCenter(
        region.xPercent,
        region.yPercent,
        width,
        height,
        r,
        r,
        false
      );
      return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="white" />`;
    })
    .join("\n");

  const visibilitySvg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
    <rect width="100%" height="100%" fill="black" />
    ${shapes}
  </svg>`;

  const { data: visibilityData } = await sharp(Buffer.from(visibilitySvg))
    .greyscale()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const alpha = Buffer.alloc(width * height);
  for (let i = 0; i < alpha.length; i++) {
    alpha[i] = 255 - visibilityData[i];
  }

  const rgb = Buffer.alloc(width * height * 3, 0);

  return sharp(rgb, { raw: { width, height, channels: 3 } })
    .joinChannel(alpha, { raw: { width, height, channels: 1 } })
    .png()
    .toBuffer();
}
