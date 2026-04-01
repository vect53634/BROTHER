import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL)

async function main() {
  console.log('Running full database setup...')

  // 1. Create ads table
  await sql`
    CREATE TABLE IF NOT EXISTS ads (
      id         SERIAL PRIMARY KEY,
      title      TEXT NOT NULL,
      type       TEXT NOT NULL CHECK (type IN ('image', 'video', 'web')),
      content    TEXT NOT NULL,
      priority   INTEGER NOT NULL DEFAULT 1 CHECK (priority IN (1, 2, 3)),
      pinned     BOOLEAN NOT NULL DEFAULT FALSE,
      duration   INTEGER NOT NULL DEFAULT 8,
      active     BOOLEAN NOT NULL DEFAULT TRUE,
      flash      BOOLEAN NOT NULL DEFAULT FALSE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `
  console.log('ads table OK')

  // 2. Indexes
  await sql`CREATE INDEX IF NOT EXISTS idx_ads_active   ON ads(active)`
  await sql`CREATE INDEX IF NOT EXISTS idx_ads_priority ON ads(priority DESC)`
  await sql`CREATE INDEX IF NOT EXISTS idx_ads_pinned   ON ads(pinned DESC)`
  await sql`CREATE INDEX IF NOT EXISTS idx_ads_flash    ON ads(flash)`
  console.log('indexes OK')

  // 3. display_settings table (blocking screens)
  await sql`
    CREATE TABLE IF NOT EXISTS display_settings (
      key   TEXT PRIMARY KEY,
      value TEXT NOT NULL DEFAULT ''
    )
  `
  await sql`
    INSERT INTO display_settings (key, value)
    VALUES ('blocking_screen', 'none')
    ON CONFLICT (key) DO NOTHING
  `
  console.log('display_settings table OK')

  console.log('All done!')
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
