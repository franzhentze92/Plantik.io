import sharp from "sharp";

/**
 * Removes typical studio / catalog backgrounds by flooding from the image
 * borders toward colors similar to the corner samples, then feathering edges.
 * Works well for product photos on white/light/seamless backdrops.
 */
export async function removeStudioBackground(
  input: Buffer
): Promise<Buffer> {
  const { data, info } = await sharp(input)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height, channels } = info;
  if (channels < 4) {
    throw new Error("Expected RGBA image for background removal");
  }

  const bg = sampleCornerAverage(data, width, height, channels);
  const colorTol = 42;
  const visited = new Uint8Array(width * height);
  const queue = new Int32Array(width * height);
  let qh = 0;
  let qt = 0;

  const enqueue = (x: number, y: number) => {
    const i = y * width + x;
    if (visited[i]) return;
    visited[i] = 1;
    queue[qt++] = i;
  };

  for (let x = 0; x < width; x++) {
    enqueue(x, 0);
    enqueue(x, height - 1);
  }
  for (let y = 0; y < height; y++) {
    enqueue(0, y);
    enqueue(width - 1, y);
  }

  while (qh < qt) {
    const i = queue[qh++];
    const o = i * channels;
    if (!nearColor(data[o], data[o + 1], data[o + 2], bg, colorTol)) {
      continue;
    }
    data[o + 3] = 0;

    const x = i % width;
    const y = (i / width) | 0;
    if (x > 0) enqueue(x - 1, y);
    if (x + 1 < width) enqueue(x + 1, y);
    if (y > 0) enqueue(x, y - 1);
    if (y + 1 < height) enqueue(x, y + 1);
  }

  featherAlpha(data, width, height, channels, 2);

  return sharp(data, { raw: { width, height, channels: 4 } })
    .png()
    .toBuffer();
}

/**
 * Last-resort / cleanup pass: knock out bright low-saturation pixels typical of
 * studio backdrops that flood-fill or ONNX left behind (the white square bug).
 */
export async function knockoutLightBackground(
  input: Buffer
): Promise<Buffer> {
  const { data, info } = await sharp(input)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height, channels } = info;
  const bg = sampleCornerAverage(data, width, height, channels);

  for (let i = 0; i < width * height; i++) {
    const o = i * channels;
    const r = data[o];
    const g = data[o + 1];
    const b = data[o + 2];
    const a = data[o + 3];
    if (a === 0) continue;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const lum = (r + g + b) / 3;
    const sat = max === 0 ? 0 : (max - min) / max;

    const nearWhite = r > 235 && g > 235 && b > 235;
    // Only knock out low-saturation backgrounds — never green foliage.
    const brightGray = lum > 210 && sat < 0.08;
    const softStudio = lum > 225 && sat < 0.12;
    const nearCorner =
      Math.abs(r - bg.r) < 22 &&
      Math.abs(g - bg.g) < 22 &&
      Math.abs(b - bg.b) < 22 &&
      lum > 190 &&
      sat < 0.14;

    // Protect leafy greens / browns (pots, trunks).
    const looksLikeFoliageOrPot =
      (g > r + 15 && g > b + 10) || (r > 80 && r > g + 20 && sat > 0.2);

    if (
      !looksLikeFoliageOrPot &&
      (nearWhite || brightGray || softStudio || nearCorner)
    ) {
      data[o + 3] = 0;
    }
  }

  // Second pass: flood from edges anything still close to corner color.
  const visited = new Uint8Array(width * height);
  const queue = new Int32Array(width * height);
  let qh = 0;
  let qt = 0;
  const enqueue = (x: number, y: number) => {
    const i = y * width + x;
    if (visited[i]) return;
    visited[i] = 1;
    queue[qt++] = i;
  };
  for (let x = 0; x < width; x++) {
    enqueue(x, 0);
    enqueue(x, height - 1);
  }
  for (let y = 0; y < height; y++) {
    enqueue(0, y);
    enqueue(width - 1, y);
  }
  while (qh < qt) {
    const i = queue[qh++];
    const o = i * channels;
    if (data[o + 3] === 0) {
      // already clear — still expand through transparent to reach leftover fringes
    } else if (
      !nearColor(data[o], data[o + 1], data[o + 2], bg, 55) &&
      !((data[o] + data[o + 1] + data[o + 2]) / 3 > 200 &&
        (Math.max(data[o], data[o + 1], data[o + 2]) -
          Math.min(data[o], data[o + 1], data[o + 2])) /
          Math.max(1, Math.max(data[o], data[o + 1], data[o + 2])) <
          0.18)
    ) {
      continue;
    } else {
      data[o + 3] = 0;
    }
    const x = i % width;
    const y = (i / width) | 0;
    if (x > 0) enqueue(x - 1, y);
    if (x + 1 < width) enqueue(x + 1, y);
    if (y > 0) enqueue(x, y - 1);
    if (y + 1 < height) enqueue(x, y + 1);
  }

  return sharp(data, { raw: { width, height, channels: 4 } })
    .png()
    .toBuffer();
}

function sampleCornerAverage(
  data: Buffer,
  width: number,
  height: number,
  channels: number
) {
  const pts = [
    [2, 2],
    [width - 3, 2],
    [2, height - 3],
    [width - 3, height - 3],
  ];
  let r = 0;
  let g = 0;
  let b = 0;
  for (const [x, y] of pts) {
    const o = (y * width + x) * channels;
    r += data[o];
    g += data[o + 1];
    b += data[o + 2];
  }
  return { r: r / 4, g: g / 4, b: b / 4 };
}

function nearColor(
  r: number,
  g: number,
  b: number,
  bg: { r: number; g: number; b: number },
  tol: number
) {
  return (
    Math.abs(r - bg.r) <= tol &&
    Math.abs(g - bg.g) <= tol &&
    Math.abs(b - bg.b) <= tol
  );
}

function featherAlpha(
  data: Buffer,
  width: number,
  height: number,
  channels: number,
  radius: number
) {
  const copy = Buffer.from(data);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = y * width + x;
      const a = copy[i * channels + 3];
      if (a === 0) continue;

      let minDist = radius + 1;
      outer: for (let dy = -radius; dy <= radius; dy++) {
        for (let dx = -radius; dx <= radius; dx++) {
          const nx = x + dx;
          const ny = y + dy;
          if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
          if (copy[(ny * width + nx) * channels + 3] === 0) {
            const d = Math.hypot(dx, dy);
            if (d < minDist) minDist = d;
            if (minDist <= 1) break outer;
          }
        }
      }

      if (minDist <= radius) {
        const factor = Math.max(0.25, minDist / (radius + 0.01));
        data[i * channels + 3] = Math.round(a * factor);
      }
    }
  }
}

export async function trimTransparent(input: Buffer): Promise<Buffer> {
  return sharp(input).trim({ threshold: 16 }).png().toBuffer();
}

/**
 * Crops to solid product pixels and strips soft studio drop-shadows under the
 * pot. Those shadows otherwise become empty height so the pot floats above
 * the pin when we anchor on the PNG bottom.
 */
export async function cropToSolidContent(
  input: Buffer,
  minAlpha = 140
): Promise<Buffer> {
  const { data, info } = await sharp(input)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height, channels } = info;
  let minX = width;
  let minY = height;
  let maxX = -1;
  let maxY = -1;
  const rowSolid = new Uint32Array(height);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const a = data[(y * width + x) * channels + 3];
      if (a >= minAlpha) {
        rowSolid[y]++;
        if (x < minX) minX = x;
        if (y < minY) minY = y;
        if (x > maxX) maxX = x;
        if (y > maxY) maxY = y;
      }
    }
  }

  if (maxX < 0 || maxY < 0) {
    return sharp(input).png().toBuffer();
  }

  const minSolidPerRow = Math.max(3, Math.floor(width * 0.02));
  let solidBottom = maxY;
  for (let y = maxY; y >= minY; y--) {
    if (rowSolid[y] >= minSolidPerRow) {
      solidBottom = y;
      break;
    }
  }

  const baseBandTop = Math.max(
    minY,
    solidBottom - Math.floor((solidBottom - minY) * 0.15)
  );
  let baseMinX = width;
  let baseMaxX = -1;
  for (let y = baseBandTop; y <= solidBottom; y++) {
    for (let x = 0; x < width; x++) {
      if (data[(y * width + x) * channels + 3] >= minAlpha) {
        if (x < baseMinX) baseMinX = x;
        if (x > baseMaxX) baseMaxX = x;
      }
    }
  }
  if (baseMaxX >= 0) {
    minX = Math.max(minX, baseMinX - 2);
    maxX = Math.min(maxX, baseMaxX + 2);
  }

  const left = Math.max(0, minX);
  const top = Math.max(0, minY);
  const cropW = Math.min(width - left, maxX - minX + 1);
  const cropH = Math.min(height - top, solidBottom - minY + 1);

  if (cropW <= 1 || cropH <= 1) {
    return sharp(input).png().toBuffer();
  }

  return sharp(input)
    .extract({ left, top, width: cropW, height: cropH })
    .png()
    .toBuffer();
}
