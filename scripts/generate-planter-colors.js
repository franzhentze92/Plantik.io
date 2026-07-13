// One-off script: generates real color variants for each planter by
// recoloring the existing base product photo (keeps the same shape,
// material texture, angle and lighting — only the color changes).
// Saves them under public/images/planters/{id}-{colorSlug}.png.
// Run with: node scripts/generate-planter-colors.js
const fs = require("fs");
const path = require("path");
const OpenAI = require("openai");
const { toFile } = require("openai");

const envPath = path.join(__dirname, "..", ".env.local");
const envContent = fs.readFileSync(envPath, "utf-8");
function getEnv(name) {
  const match = envContent.match(new RegExp(`${name}=(.*)`));
  return match ? match[1].trim() : undefined;
}

const openai = new OpenAI({ apiKey: getEnv("OPENAI_API_KEY") });
const plantersDir = path.join(__dirname, "..", "public", "images", "planters");

const colorEnglish = {
  Blanco: "clean white",
  Negro: "matte black",
  Terracota: "warm terracotta reddish-brown clay",
  Gris: "neutral grey",
  Crema: "cream off-white",
};

const colorSlug = {
  Blanco: "blanco",
  Negro: "negro",
  Terracota: "terracota",
  Gris: "gris",
  Crema: "crema",
};

// planterId -> { baseColor, baseFile, material, targets: [colors to generate] }
const jobs = [
  {
    id: "ceramica-blanca-s",
    baseFile: "ceramica-blanca-s.png",
    material: "glazed ceramic",
    targets: ["Negro", "Terracota", "Gris"],
  },
  {
    id: "barro-natural-s",
    baseFile: "barro-natural-s.png",
    material: "terracotta clay",
    targets: ["Blanco", "Negro"],
  },
  {
    id: "barro-natural-m",
    baseFile: "barro-natural-m.png",
    material: "terracotta clay",
    targets: ["Blanco", "Negro"],
  },
  {
    id: "tejida-crema-s",
    baseFile: "tejida-crema-s.png",
    material: "woven natural fiber basket",
    targets: ["Gris", "Negro"],
  },
  {
    id: "cemento-gris-m",
    baseFile: "cemento-gris-m.png",
    material: "polished concrete",
    targets: ["Blanco", "Negro"],
  },
  {
    id: "fibra-negra-m",
    baseFile: "fibra-negra-m.png",
    material: "fiberglass",
    targets: ["Blanco", "Gris", "Terracota"],
  },
];

async function recolor(baseFilePath, material, color) {
  const buffer = fs.readFileSync(baseFilePath);
  const imageFile = await toFile(buffer, "planter.png", { type: "image/png" });
  const prompt = `Recolor this exact ${material} plant pot to a ${colorEnglish[color]} finish. Keep the SAME shape, size, proportions, material texture, camera angle, soft studio lighting and plain white studio background. It is an empty pot with no plant inside. Photorealistic product photography, no text, no watermark.`;

  const response = await openai.images.edit({
    model: "gpt-image-1",
    image: imageFile,
    prompt,
    size: "1024x1024",
    quality: "medium",
    input_fidelity: "high",
  });

  return Buffer.from(response.data[0].b64_json, "base64");
}

(async () => {
  let generated = 0;
  for (const job of jobs) {
    const baseFilePath = path.join(plantersDir, job.baseFile);
    if (!fs.existsSync(baseFilePath)) {
      console.error(`Base file missing for ${job.id}: ${job.baseFile}`);
      continue;
    }

    for (const color of job.targets) {
      const outPath = path.join(
        plantersDir,
        `${job.id}-${colorSlug[color]}.png`
      );
      if (fs.existsSync(outPath)) {
        console.log(`Skip ${job.id} ${color} (already exists)`);
        continue;
      }
      try {
        console.log(`Generating ${job.id} -> ${color}...`);
        const buffer = await recolor(baseFilePath, job.material, color);
        fs.writeFileSync(outPath, buffer);
        generated++;
        console.log(`Saved ${outPath}`);
      } catch (e) {
        console.error(`Failed ${job.id} ${color}:`, e.message);
      }
    }
  }
  console.log(`Done. Generated ${generated} new color variants.`);
})();
