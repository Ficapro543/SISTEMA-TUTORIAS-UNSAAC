
ALTER TABLE cronogramas
ADD COLUMN IF NOT EXISTS hora_fin TIME;

-- Update existing records to have a default duration (e.g., 1 hour) if needed, 
-- or leave null. Let's start by assuming 1 hour duration for existing ones to avoid nulls if we make it not null later.
UPDATE cronogramas SET hora_fin = hora + interval '1 hour' WHERE hora_fin IS NULL;
