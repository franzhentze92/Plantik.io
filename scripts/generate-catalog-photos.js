// One-off script: generates real product photos for every plant and planter
// using OpenAI image generation, saves them under public/images/, and links
// them into the DB (plants) / data file (planters). Run with:
//   node scripts/generate-catalog-photos.js
const fs = require("fs");
const path = require("path");
const OpenAI = require("openai");
const { createClient } = require("@supabase/supabase-js");

const envPath = path.join(__dirname, "..", ".env.local");
const envContent = fs.readFileSync(envPath, "utf-8");
function getEnv(name) {
  const match = envContent.match(new RegExp(`${name}=(.*)`));
  return match ? match[1].trim() : undefined;
}

const supabaseUrl = getEnv("NEXT_PUBLIC_SUPABASE_URL");
const supabaseKey = getEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY");
const openaiKey = getEnv("OPENAI_API_KEY");

const supabase = createClient(supabaseUrl, supabaseKey);
const openai = new OpenAI({ apiKey: openaiKey });

const plantsDir = path.join(__dirname, "..", "public", "images", "plants");
const plantersDir = path.join(__dirname, "..", "public", "images", "planters");

async function generatePhoto(prompt) {
  const response = await openai.images.generate({
    model: "gpt-image-1",
    prompt,
    size: "1024x1024",
    quality: "medium",
  });
  const b64 = response.data[0].b64_json;
  return Buffer.from(b64, "base64");
}

async function generatePlantPhotos() {
  console.log("Fetching plants from Supabase...");
  const { data: plants, error } = await supabase
    .from("plants")
    .select("id, commercial_name, scientific_name, short_description, categories");

  if (error) {
    console.error("Failed to fetch plants:", error);
    return;
  }

  console.log(`Generating photos for ${plants.length} plants...`);

  for (const plant of plants) {
    const outPath = path.join(plantsDir, `${plant.id}.png`);
    if (fs.existsSync(outPath)) {
      console.log(`Skip ${plant.id} (already exists)`);
    } else {
      const prompt = `Professional product photography of a single ${plant.commercial_name} (${plant.scientific_name}) houseplant, ${plant.short_description}. Simple terracotta nursery pot, clean plain white studio background, soft even lighting, centered, full plant visible, realistic botanical photo, no text, no watermark.`;
      try {
        console.log(`Generating ${plant.id}...`);
        const buffer = await generatePhoto(prompt);
        fs.writeFileSync(outPath, buffer);
        console.log(`✅ Saved ${outPath}`);
      } catch (e) {
        console.error(`❌ Failed for ${plant.id}:`, e.message);
        continue;
      }
    }

    const imageUrl = `/images/plants/${plant.id}.png`;
    await supabase.from("plant_images").delete().eq("plant_id", plant.id);
    const { error: insertError } = await supabase.from("plant_images").insert({
      plant_id: plant.id,
      image_url: imageUrl,
      alt_text: plant.commercial_name,
      display_order: 0,
    });
    if (insertError) {
      console.error(`❌ Failed to link image for ${plant.id}:`, insertError);
    } else {
      console.log(`🔗 Linked ${plant.id} -> ${imageUrl}`);
    }
  }
}

async function generatePlanterPhotos() {
  const plantersPath = path.join(__dirname, "..", "data", "planters.ts");
  const plantersSource = fs.readFileSync(plantersPath, "utf-8");

  // Parse the planter entries (id, name, material, color, style) via regex
  // since this is a small hand-authored static file, not a JSON blob.
  const entryRegex =
    /id:\s*"([^"]+)",\s*name:\s*"([^"]+)",\s*material:\s*"([^"]+)",\s*color:\s*"([^"]+)",\s*size:\s*"[^"]+",\s*diameterCm:\s*\d+,\s*style:\s*"([^"]+)"/g;

  const planters = [];
  let match;
  while ((match = entryRegex.exec(plantersSource)) !== null) {
    planters.push({
      id: match[1],
      name: match[2],
      material: match[3],
      color: match[4],
      style: match[5],
    });
  }

  console.log(`Generating photos for ${planters.length} planters...`);

  let updatedSource = plantersSource;

  for (const planter of planters) {
    const outPath = path.join(plantersDir, `${planter.id}.png`);
    if (fs.existsSync(outPath)) {
      console.log(`Skip ${planter.id} (already exists)`);
    } else {
      const prompt = `Professional product photography of a single empty plant pot/planter: ${planter.name}, made of ${planter.material}, color ${planter.color}, ${planter.style} style. Clean plain white studio background, soft even lighting, centered, no plant inside, no text, no watermark.`;
      try {
        console.log(`Generating ${planter.id}...`);
        const buffer = await generatePhoto(prompt);
        fs.writeFileSync(outPath, buffer);
        console.log(`✅ Saved ${outPath}`);
      } catch (e) {
        console.error(`❌ Failed for ${planter.id}:`, e.message);
        continue;
      }
    }

    // Replace this planter's image(...) call with the new local path.
    const idBlockRegex = new RegExp(
      `(id:\\s*"${planter.id}"[\\s\\S]*?image:\\s*)img\\("[^"]*"\\)`,
      "m"
    );
    updatedSource = updatedSource.replace(idBlockRegex, `$1"/images/planters/${planter.id}.png"`);
  }

  fs.writeFileSync(plantersPath, updatedSource);
  console.log("🔗 Updated data/planters.ts with local image paths");
}

(async () => {
  await generatePlantPhotos();
  await generatePlanterPhotos();
  console.log("Done.");
})();
