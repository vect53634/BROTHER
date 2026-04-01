-- Add flash ads support: flash = show once then auto-delete
ALTER TABLE ads ADD COLUMN IF NOT EXISTS flash BOOLEAN NOT NULL DEFAULT FALSE;

-- Index for fast flash ad lookup
CREATE INDEX IF NOT EXISTS idx_ads_flash ON ads(flash);
