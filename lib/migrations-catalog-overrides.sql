-- Admin-editable overrides for imported EPA catalog products.
-- Survives EPA re-imports; applied at read time in supabase-queries.ts.

CREATE TABLE IF NOT EXISTS catalog_overrides (
  product_key TEXT PRIMARY KEY,
  source TEXT NOT NULL DEFAULT 'epa',
  kind TEXT NOT NULL,
  name TEXT,
  scientific_name TEXT,
  description TEXT,
  short_description TEXT,
  price_q NUMERIC,
  image_url TEXT,
  images JSONB DEFAULT '[]'::jsonb,
  availability TEXT,
  hidden BOOLEAN DEFAULT false,
  attributes JSONB DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by TEXT
);

CREATE INDEX IF NOT EXISTS idx_catalog_overrides_kind ON catalog_overrides(kind);
CREATE INDEX IF NOT EXISTS idx_catalog_overrides_hidden ON catalog_overrides(hidden);

ALTER TABLE catalog_overrides DISABLE ROW LEVEL SECURITY;
