import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL)

async function main() {
  console.log('Creating display_settings table...')

  await sql`
    CREATE TABLE IF NOT EXISTS display_settings (
      key   TEXT PRIMARY KEY,
      value TEXT NOT NULL DEFAULT ''
    )
  `

  // Seed with default (no blocking screen active)
  await sql`
    INSERT INTO display_settings (key, value)
    VALUES ('blocking_screen', 'none')
    ON CONFLICT (key) DO NOTHING
  `

  console.log('display_settings table ready.')
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
