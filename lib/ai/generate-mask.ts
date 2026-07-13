import sharp from "sharp";

interface MaskRegion {
  xPercent: number;
  yPercent: number;
  recommendedPlantSize: string;
  placementType?: string;
}

const radiusPercentBySize: { [key: string]: number } = {
  desktop: 0.07,
  small: 0.09,
  medium: 0.13,
  large: 0.19,
};

/**
 * Builds a PNG mask matching the OpenAI images.edit contract: fully
 * transparent (alpha = 0) regions mark the placements the model is allowed
 * to edit; everything else is fully opaque so the API guarantees pixel-for-
 * pixel preservation of the rest of the photo.
 *
 * Floor placements use a tall ellipse that extends upward from the pot's base
 * point so tall floor plants have vertical room to render at proper scale and
 * stay grounded, instead of being squeezed into a small symmetric circle.
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
      const cx = (region.xPercent / 100) * width;
      const baseY = (region.yPercent / 100) * height;
      const radiusPercent =
        radiusPercentBySize[region.recommendedPlantSize] || 0.1;
      const radius = radiusPercent * maxDim;

      const isFloor = region.placementType === "floor";
      if (isFloor) {
        // Grow upward from the base: taller than wide, centered above baseY.
        const rx = radius;
        const ry = radius * 1.8;
        const cy = baseY - ry * 0.6;
        return `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="white" />`;
      }
      return `<circle cx="${cx}" cy="${baseY}" r="${radius}" fill="white" />`;
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
