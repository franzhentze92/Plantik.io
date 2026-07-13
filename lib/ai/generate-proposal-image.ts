import OpenAI, { toFile } from "openai";
import fs from "fs";
import path from "path";
import { PlacementLocation } from "@/types/space-analysis";
import { Plant } from "@/types";
import { buildPlacementMask } from "./generate-mask";

interface ReferenceImage {
  buffer: Buffer;
  type: string;
  ext: string;
}

function extFromType(type: string): string {
  if (type.includes("png")) return "png";
  if (type.includes("webp")) return "webp";
  return "jpg";
}

/**
 * Loads a product photo so it can be passed to the image model as a visual
 * reference. Catalog images are remote URLs (e.g. the EPA storefront), so we
 * must fetch those over HTTP — reading only from /public silently dropped every
 * reference, which made the model invent generic plants instead of the chosen
 * ones. Local /public paths are still supported for bundled assets.
 */
async function loadReferenceImage(
  src?: string
): Promise<ReferenceImage | null> {
  if (!src || src.endsWith(".svg") || src.includes("plant-placeholder")) {
    return null;
  }
  try {
    if (/^https?:\/\//i.test(src)) {
      const res = await fetch(src);
      if (!res.ok) return null;
      const type = res.headers.get("content-type") || "image/jpeg";
      const buffer = Buffer.from(await res.arrayBuffer());
      return { buffer, type, ext: extFromType(type) };
    }
    const filePath = path.join(process.cwd(), "public", src);
    const buffer = fs.readFileSync(filePath);
    const ext = path.extname(src).toLowerCase().replace(".", "") || "jpg";
    const type =
      ext === "png"
        ? "image/png"
        : ext === "webp"
          ? "image/webp"
          : "image/jpeg";
    return { buffer, type, ext };
  } catch {
    return null;
  }
}

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface ProposalPlantPlacement {
  plant: Plant;
  placement: PlacementLocation;
  quantity: number;
  planter?: { name: string; color: string; material: string; image?: string };
  plato?: { name: string; color?: string; material?: string; image?: string };
}

const sizeLabels: { [key: string]: string } = {
  desktop: "very small, desktop-sized",
  small: "small, tabletop-sized",
  medium: "medium-sized, roughly knee to waist height",
  large: "large, tall floor plant reaching up toward eye level",
};

const SIZE_ORDER = ["desktop", "small", "medium", "large"];

function plantSizeBucket(heightCm: number): string {
  if (heightCm >= 150) return "large";
  if (heightCm >= 60) return "medium";
  if (heightCm >= 30) return "small";
  return "desktop";
}

/**
 * The mask circle should reflect the plant the user actually chose, not only
 * the AI's suggested slot size — otherwise a large plant dropped into a "small"
 * slot renders tiny. Use the larger of the two size buckets.
 */
function effectivePlacementSize(plant: Plant, recommended: string): string {
  const plantBucket = plantSizeBucket(plant.currentHeightCm);
  const a = SIZE_ORDER.indexOf(plantBucket);
  const b = SIZE_ORDER.indexOf(recommended);
  return SIZE_ORDER[Math.max(a, b >= 0 ? b : 0)] || recommended;
}

function describePlantAppearance(
  plant: Plant,
  effectiveSize: string,
  planter?: { name: string; color: string; material: string },
  plato?: { name: string; color?: string; material?: string }
): string {
  const traits = [plant.shortDescription, ...(plant.category || [])]
    .filter(Boolean)
    .join(", ");
  const potDescription = planter
    ? `in a ${planter.color.toLowerCase()} ${planter.material.toLowerCase()} pot (${planter.name})`
    : "in a simple neutral pot";
  const platoDescription = plato
    ? ` The pot sits on a matching saucer/tray${
        plato.color ? ` in ${plato.color.toLowerCase()}` : ""
      }${plato.material ? ` ${plato.material.toLowerCase()}` : ""} (${plato.name}), visible under the pot.`
    : "";
  return `${plant.name} (${plant.scientificName}) — visual traits: ${traits}. Physical size: ${sizeLabels[effectiveSize]}, about ${plant.currentHeightCm}cm tall, ${potDescription}.${platoDescription}`;
}

function buildEditPrompt(items: ProposalPlantPlacement[], hasReferencePhotos: boolean): string {
  const placementDescriptions = items
    .map(({ plant, placement, quantity, planter, plato }, i) => {
      const qtyText = quantity > 1 ? `${quantity} of the same ` : "a ";
      const effectiveSize = effectivePlacementSize(
        plant,
        placement.recommendedPlantSize
      );
      return `${i + 1}. Add ${qtyText}${describePlantAppearance(plant, effectiveSize, planter, plato)}\n   Location: ${placement.reasoning}`;
    })
    .join("\n\n");

  const referenceNote = hasReferencePhotos
    ? `\n\nIMPORTANT — REFERENCE PHOTOS: After the main room photo you were given real product photos of the exact items to add, ordered to match the numbered list above. For each numbered plant the photos appear in this order: the plant first, then its pot (if provided), then its saucer/tray (if provided). You MUST reproduce each plant from its reference photo: same species, leaf shape, leaf color, number and arrangement of stems/fronds, and overall growth habit. Do NOT invent or substitute a different, more generic houseplant — the output must clearly be the same plant as in the reference photo. When a pot or saucer photo is given, match its shape, color and material too, and show the saucer/tray sitting under the pot.`
    : "";

  return `This photo has one or more transparent circular regions marking exactly where to add a potted plant. Everything outside those circles is locked and will not change.

For each transparent circle, add ONE of the plants below. Match each plant to its circle using the location description (e.g. a circle over a nightstand matches a "tabletop" plant; a circle over open floor matches a "floor" plant):

PLANTS TO ADD:
${placementDescriptions}${referenceNote}

PLACEMENT REALISM (critical):
- Every plant must physically rest on a real surface and look grounded, with a believable contact shadow. A floor plant stands on the floor against a wall/corner/beside furniture; a tabletop plant sits flat on the furniture surface.
- NEVER render a plant floating in mid-air, hovering over a bed/sofa/chair, or growing out of a wall.
- If a circle is on a bare wall (a "shelf" location), first add a simple, style-matching wall shelf or floating ledge inside that circle, then place the plant standing on that shelf. Do not stick a pot directly onto a flat wall.
- If a circle is a "hanging" location, render the plant in a hanging pot/macramé from the ceiling or rod, not resting on anything.
- Scale each plant to its stated physical size: a "large, tall floor plant" must read as a big floor plant (roughly filling the vertical space of its region up toward eye level), not a small tabletop plant. Keep the pot's base at the bottom of the region and let the foliage grow upward.

REQUIREMENTS:
- Each plant must visually match its described traits (leaf shape, color, growth habit) and size — draw the actual described species, not a generic houseplant.
- Render the plant realistically, correctly scaled to fill its circular region, with shadows and lighting consistent with the room.
- Do not add any plant or object not listed above (a wall shelf under a wall plant is allowed as described).`;
}

export async function generateProposalImage(
  imageBase64: string,
  imageMediaType: "image/jpeg" | "image/png" | "image/webp",
  items: ProposalPlantPlacement[]
): Promise<string> {
  const buffer = Buffer.from(imageBase64, "base64");
  const extension = imageMediaType.split("/")[1];
  const imageFile = await toFile(buffer, `room.${extension}`, {
    type: imageMediaType,
  });

  const references: ReferenceImage[] = [];
  for (const { plant, planter, plato } of items) {
    const plantRef = await loadReferenceImage(plant.images?.[0]);
    if (plantRef) references.push(plantRef);
    const planterRef = await loadReferenceImage(planter?.image);
    if (planterRef) references.push(planterRef);
    const platoRef = await loadReferenceImage(plato?.image);
    if (platoRef) references.push(platoRef);
  }
  const referenceFiles = await Promise.all(
    references.map((ref, i) =>
      toFile(ref.buffer, `reference-${i}.${ref.ext}`, { type: ref.type })
    )
  );

  const prompt = buildEditPrompt(items, referenceFiles.length > 0);

  const maskBuffer = await buildPlacementMask(
    buffer,
    items.map(({ placement, plant }) => ({
      xPercent: placement.x,
      yPercent: placement.y,
      recommendedPlantSize: effectivePlacementSize(
        plant,
        placement.recommendedPlantSize
      ),
      placementType: placement.placementType,
    }))
  );
  const maskFile = await toFile(maskBuffer, "mask.png", { type: "image/png" });

  const response = await client.images.edit({
    model: "gpt-image-1",
    image: [imageFile, ...referenceFiles],
    mask: maskFile,
    prompt,
    size: "auto",
    quality: "high",
    input_fidelity: "high",
  });

  const b64 = response.data?.[0]?.b64_json;
  if (!b64) {
    throw new Error("No image returned from generation");
  }

  return b64;
}
