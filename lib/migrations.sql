-- Create plants table
CREATE TABLE IF NOT EXISTS plants (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  commercial_name TEXT NOT NULL,
  scientific_name TEXT NOT NULL,
  description TEXT,
  short_description TEXT,

  -- Pricing
  price_q DECIMAL(10, 2) NOT NULL,
  cost_q DECIMAL(10, 2),

  -- Physical attributes
  current_size_cm INT,
  pot_diameter_cm INT,
  mature_height_cm INT,

  -- Care & environment
  light_level TEXT CHECK (light_level IN ('baja', 'media', 'alta')),
  care_difficulty TEXT CHECK (care_difficulty IN ('facil', 'moderado', 'exigente')),
  watering_frequency_days INT,
  humidity_preference TEXT,
  min_temperature_c DECIMAL(5, 1),
  max_temperature_c DECIMAL(5, 1),

  -- Placement
  indoor_outdoor TEXT CHECK (indoor_outdoor IN ('interior', 'exterior', 'ambos')),

  -- Safety & Features
  pet_friendly BOOLEAN DEFAULT FALSE,
  smart_care_compatible BOOLEAN DEFAULT FALSE,

  -- Categories (stored as comma-separated for now)
  categories TEXT, -- e.g. "interior,bajo-mantenimiento,escritorio"
  decorative_styles TEXT, -- e.g. "minimalist,boho,tropical"
  room_types TEXT, -- e.g. "bedroom,office,bathroom"

  -- Inventory
  stock_quantity INT DEFAULT 0,
  available BOOLEAN DEFAULT TRUE,
  featured BOOLEAN DEFAULT FALSE,

  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create plant images table
CREATE TABLE IF NOT EXISTS plant_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plant_id TEXT REFERENCES plants(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  alt_text TEXT,
  display_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create plant variants (sizes)
CREATE TABLE IF NOT EXISTS plant_variants (
  id TEXT PRIMARY KEY,
  plant_id TEXT REFERENCES plants(id) ON DELETE CASCADE,
  size_label TEXT NOT NULL,
  height_cm INT,
  price_q DECIMAL(10, 2) NOT NULL,
  stock_quantity INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create plant inventory
CREATE TABLE IF NOT EXISTS plant_inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plant_id TEXT REFERENCES plants(id) ON DELETE CASCADE,
  variant_id TEXT REFERENCES plant_variants(id) ON DELETE SET NULL,
  quantity_available INT DEFAULT 0,
  quantity_reserved INT DEFAULT 0,
  last_restocked TIMESTAMP,
  supplier_code TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create recommendation profiles
CREATE TABLE IF NOT EXISTS plant_recommendation_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plant_id TEXT REFERENCES plants(id) ON DELETE CASCADE,
  minimum_light_score INT,
  maximum_light_score INT,
  suitable_for_bedroom BOOLEAN DEFAULT TRUE,
  suitable_for_bathroom BOOLEAN DEFAULT FALSE,
  suitable_for_office BOOLEAN DEFAULT TRUE,
  suitable_for_balcony BOOLEAN DEFAULT FALSE,
  suitable_for_small_spaces BOOLEAN DEFAULT FALSE,
  suitable_for_large_spaces BOOLEAN DEFAULT FALSE,
  maintenance_score INT, -- 1-5
  pet_safety_score INT, -- 1-5
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_plants_slug ON plants(slug);
CREATE INDEX idx_plants_featured ON plants(featured);
CREATE INDEX idx_plants_available ON plants(available);
CREATE INDEX idx_plant_images_plant_id ON plant_images(plant_id);
CREATE INDEX idx_plant_variants_plant_id ON plant_variants(plant_id);
