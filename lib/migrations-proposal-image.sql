-- Adds storage for the AI-generated "plants placed in your room" visualization

ALTER TABLE proposals ADD COLUMN IF NOT EXISTS generated_image_url TEXT;
ALTER TABLE proposals ADD COLUMN IF NOT EXISTS generated_image_status TEXT DEFAULT 'pending';
