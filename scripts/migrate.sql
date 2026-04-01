CREATE TABLE IF NOT EXISTS ads (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('image', 'video', 'web')),
  content TEXT NOT NULL,
  priority INTEGER NOT NULL DEFAULT 1 CHECK (priority IN (1, 2, 3)),
  pinned BOOLEAN NOT NULL DEFAULT FALSE,
  duration INTEGER NOT NULL DEFAULT 8,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ads_active ON ads(active);
CREATE INDEX IF NOT EXISTS idx_ads_priority ON ads(priority DESC);
CREATE INDEX IF NOT EXISTS idx_ads_pinned ON ads(pinned DESC);
