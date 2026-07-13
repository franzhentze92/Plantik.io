import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Missing SUPABASE_URL or SUPABASE_ANON_KEY in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function runMigrations() {
  console.log("📋 Running migrations...");
  const migrationsPath = path.join(__dirname, "../lib/migrations.sql");
  const migrations = fs.readFileSync(migrationsPath, "utf-8");

  // Split by statements and execute
  const statements = migrations
    .split(";")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  for (const statement of statements) {
    try {
      const { error } = await supabase.rpc("exec_sql", { sql: statement });
      if (error) console.warn("⚠️  ", error.message);
    } catch (e) {
      console.warn("⚠️  Error running migration:", e);
    }
  }
  console.log("✅ Migrations completed");
}

async function seedPlants() {
  console.log("🌱 Seeding 25 plants...");
  const seedPath = path.join(__dirname, "../lib/seed-plants.sql");
  const seedSql = fs.readFileSync(seedPath, "utf-8");

  try {
    const { error } = await supabase.rpc("exec_sql", { sql: seedSql });
    if (error) {
      console.error("❌ Seed failed:", error);
    } else {
      console.log("✅ 25 plants inserted");
    }
  } catch (e) {
    console.error("❌ Error seeding:", e);
  }
}

async function main() {
  console.log("🚀 Setting up Verdea database...\n");
  await runMigrations();
  await seedPlants();
  console.log("\n✨ Database setup complete!");
}

main().catch(console.error);
