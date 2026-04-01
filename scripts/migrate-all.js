import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL)

async function main() {
  console.log('Running full database migration...')

  // ads table
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
  console.log('[OK] ads')

  await sql`CREATE INDEX IF NOT EXISTS idx_ads_active   ON ads(active)`
  await sql`CREATE INDEX IF NOT EXISTS idx_ads_priority ON ads(priority DESC)`
  await sql`CREATE INDEX IF NOT EXISTS idx_ads_pinned   ON ads(pinned DESC)`
  await sql`CREATE INDEX IF NOT EXISTS idx_ads_flash    ON ads(flash)`
  console.log('[OK] ads indexes')

  // display_settings table
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
  await sql`
    INSERT INTO display_settings (key, value)
    VALUES ('active_custom_screen_id', '')
    ON CONFLICT (key) DO NOTHING
  `
  console.log('[OK] display_settings')

  // custom_screens table
  await sql`
    CREATE TABLE IF NOT EXISTS custom_screens (
      id         SERIAL PRIMARY KEY,
      name       TEXT NOT NULL,
      html       TEXT NOT NULL DEFAULT '',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `
  console.log('[OK] custom_screens')

  console.log('Migration complete.')
}

main().catch(err => { console.error(err); process.exit(1) })
