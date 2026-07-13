-- Sprint 2 Tables: Space Analysis & Recommendations

-- spaces: User's space/room
CREATE TABLE IF NOT EXISTS spaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL,
  name TEXT,
  room_type TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- space_images: Uploaded photos
CREATE TABLE IF NOT EXISTS space_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  space_id UUID NOT NULL REFERENCES spaces(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  public_url TEXT,
  width INTEGER,
  height INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- space_analyses: AI analysis results
CREATE TABLE IF NOT EXISTS space_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  space_id UUID NOT NULL REFERENCES spaces(id) ON DELETE CASCADE,
  image_id UUID REFERENCES space_images(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  room_type TEXT,
  light_level TEXT,
  direct_sun BOOLEAN,
  estimated_space_size TEXT,
  styles JSONB DEFAULT '[]'::jsonb,
  dominant_colors JSONB DEFAULT '[]'::jsonb,
  placements JSONB DEFAULT '[]'::jsonb,
  warnings JSONB DEFAULT '[]'::jsonb,
  confidence NUMERIC,
  raw_response JSONB,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- plant_recommendations: Recommended plants per analysis
CREATE TABLE IF NOT EXISTS plant_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  analysis_id UUID NOT NULL REFERENCES space_analyses(id) ON DELETE CASCADE,
  plant_id TEXT NOT NULL REFERENCES plants(id) ON DELETE CASCADE,
  placement_id TEXT,
  score NUMERIC NOT NULL,
  reasons JSONB DEFAULT '[]'::jsonb,
  warnings JSONB DEFAULT '[]'::jsonb,
  rank INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_spaces_session_id ON spaces(session_id);
CREATE INDEX IF NOT EXISTS idx_space_images_space_id ON space_images(space_id);
CREATE INDEX IF NOT EXISTS idx_space_analyses_space_id ON space_analyses(space_id);
CREATE INDEX IF NOT EXISTS idx_space_analyses_status ON space_analyses(status);
CREATE INDEX IF NOT EXISTS idx_plant_recommendations_analysis_id ON plant_recommendations(analysis_id);
CREATE INDEX IF NOT EXISTS idx_plant_recommendations_plant_id ON plant_recommendations(plant_id);

-- Disable RLS for now (add policies later)
ALTER TABLE spaces DISABLE ROW LEVEL SECURITY;
ALTER TABLE space_images DISABLE ROW LEVEL SECURITY;
ALTER TABLE space_analyses DISABLE ROW LEVEL SECURITY;
ALTER TABLE plant_recommendations DISABLE ROW LEVEL SECURITY;
