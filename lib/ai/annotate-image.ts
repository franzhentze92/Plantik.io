import sharp from "sharp";

/**
 * Overlays a 10x10 percentage grid with axis labels onto the image before
 * sending it to the vision model. Vision-language models are unreliable at
 * estimating raw pixel/percentage coordinates from an unmarked photo; giving
 * them visible tick marks to read off dramatically improves how well
 * placement coordinates line up with real empty surfaces in the room.
 */
export async function annotateImageWithGrid(imageBuffer: Buffer): Promise<Buffer> {
  const metadata = await sharp(imageBuffer).metadata();
  const width = metadata.width!;
  const height = metadata.height!;

  const step = 10; // draw a line every 10%
  let lines = "";
  let labels = "";

  for (let pct = 0; pct <= 100; pct += step) {
    const x = (pct / 100) * width;
    const y = (pct / 100) * height;

    lines += `<line x1="${x}" y1="0" x2="${x}" y2="${height}" stroke="rgba(255,0,0,0.35)" stroke-width="1.5" />`;
    lines += `<line x1="0" y1="${y}" x2="${width}" y2="${y}" stroke="rgba(255,0,0,0.35)" stroke-width="1.5" />`;

    if (pct > 0) {
      labels += `<text x="${x + 4}" y="16" font-size="16" fill="red" font-family="Arial" font-weight="bold">${pct}</text>`;
      labels += `<text x="4" y="${y + 16}" font-size="16" fill="red" font-family="Arial" font-weight="bold">${pct}</text>`;
    }
  }

  const overlaySvg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
    ${lines}
    ${labels}
    <text x="4" y="16" font-size="16" fill="red" font-family="Arial" font-weight="bold">0</text>
  </svg>`;

  return sharp(imageBuffer)
    .composite([{ input: Buffer.from(overlaySvg), top: 0, left: 0 }])
    .toBuffer();
}
