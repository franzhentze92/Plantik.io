-- Proposals table
CREATE TABLE IF NOT EXISTS proposals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL,
  space_id UUID REFERENCES spaces(id) ON DELETE CASCADE,
  analysis_id UUID REFERENCES space_analyses(id) ON DELETE CASCADE,
  name TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  total_price_q NUMERIC,
  items JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Proposal items
CREATE TABLE IF NOT EXISTS proposal_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id UUID NOT NULL REFERENCES proposals(id) ON DELETE CASCADE,
  placement_id TEXT,
  plant_id TEXT NOT NULL REFERENCES plants(id) ON DELETE CASCADE,
  quantity INT DEFAULT 1,
  plant_size TEXT,
  price_q NUMERIC,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_proposals_session_id ON proposals(session_id);
CREATE INDEX IF NOT EXISTS idx_proposals_space_id ON proposals(space_id);
CREATE INDEX IF NOT EXISTS idx_proposals_analysis_id ON proposals(analysis_id);
CREATE INDEX IF NOT EXISTS idx_proposal_items_proposal_id ON proposal_items(proposal_id);
CREATE INDEX IF NOT EXISTS idx_proposal_items_plant_id ON proposal_items(plant_id);

-- Disable RLS
ALTER TABLE proposals DISABLE ROW LEVEL SECURITY;
ALTER TABLE proposal_items DISABLE ROW LEVEL SECURITY;
