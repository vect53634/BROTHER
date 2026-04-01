import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL)

async function main() {
  // Custom HTML screens table
  await sql`
    CREATE TABLE IF NOT EXISTS custom_screens (
      id         SERIAL PRIMARY KEY,
      name       TEXT NOT NULL,
      html       TEXT NOT NULL DEFAULT '',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `
  console.log('custom_screens table ready')

  // Store the active custom screen id in display_settings
  await sql`
    INSERT INTO display_settings (key, value)
    VALUES ('active_custom_screen_id', '')
    ON CONFLICT (key) DO NOTHING
  `
  console.log('display_settings seeded')
}

main().catch(err => { console.error(err); process.exit(1) })
