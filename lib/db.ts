import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL!)

export { sql }

export type BlockingScreen = 'none' | 'maintenance' | 'outage' | 'terminal' | 'loading' | 'custom'

export interface CustomScreen {
  id: number
  name: string
  html: string
  created_at: string
  updated_at: string
}

export interface Ad {
  id: number
  title: string
  type: 'image' | 'video' | 'web'
  content: string
  priority: 1 | 2 | 3
  pinned: boolean
  duration: number
  active: boolean
  flash: boolean
  created_at: string
  updated_at: string
}

export async function getAds(): Promise<Ad[]> {
  const rows = await sql`
    SELECT * FROM ads
    ORDER BY pinned DESC, priority DESC, created_at DESC
  `
  return rows as Ad[]
}

export async function getActiveAds(): Promise<Ad[]> {
  const rows = await sql`
    SELECT * FROM ads
    WHERE active = TRUE
    ORDER BY pinned DESC, priority DESC, created_at DESC
  `
  return rows as Ad[]
}

export async function createAd(data: {
  title: string
  type: 'image' | 'video' | 'web'
  content: string
  priority: number
  pinned: boolean
  duration: number
}): Promise<Ad> {
  const rows = await sql`
    INSERT INTO ads (title, type, content, priority, pinned, duration)
    VALUES (${data.title}, ${data.type}, ${data.content}, ${data.priority}, ${data.pinned}, ${data.duration})
    RETURNING *
  `
  return rows[0] as Ad
}

export async function updateAd(
  id: number,
  data: Partial<{
    title: string
    type: string
    content: string
    priority: number
    pinned: boolean
    duration: number
    active: boolean
  }>
): Promise<Ad> {
  // Build the update dynamically — only patch what was provided
  const rows = await sql`
    UPDATE ads SET
      title    = CASE WHEN ${data.title    !== undefined} THEN ${data.title    ?? ''}  ELSE title    END,
      type     = CASE WHEN ${data.type     !== undefined} THEN ${data.type     ?? ''}  ELSE type     END,
      content  = CASE WHEN ${data.content  !== undefined} THEN ${data.content  ?? ''}  ELSE content  END,
      priority = CASE WHEN ${data.priority !== undefined} THEN ${data.priority ?? 1}   ELSE priority END,
      pinned   = CASE WHEN ${data.pinned   !== undefined} THEN ${data.pinned   ?? false} ELSE pinned END,
      duration = CASE WHEN ${data.duration !== undefined} THEN ${data.duration ?? 8}   ELSE duration END,
      active   = CASE WHEN ${data.active   !== undefined} THEN ${data.active   ?? true} ELSE active  END,
      updated_at = NOW()
    WHERE id = ${id}
    RETURNING *
  `
  return rows[0] as Ad
}

export async function deleteAd(id: number): Promise<void> {
  await sql`DELETE FROM ads WHERE id = ${id}`
}

// ── Blocking Screens ──────────────────────────────────────────────────────────

export async function getBlockingScreen(): Promise<BlockingScreen> {
  try {
    const rows = await sql`
      SELECT value FROM display_settings WHERE key = 'blocking_screen'
    `
    return (rows[0]?.value ?? 'none') as BlockingScreen
  } catch {
    return 'none'
  }
}

export async function setBlockingScreen(screen: BlockingScreen): Promise<void> {
  await sql`
    INSERT INTO display_settings (key, value) VALUES ('blocking_screen', ${screen})
    ON CONFLICT (key) DO UPDATE SET value = ${screen}
  `
}

// ── Custom Screens ────────────────────────────────────────────────────────────

export async function getCustomScreens(): Promise<CustomScreen[]> {
  const rows = await sql`SELECT * FROM custom_screens ORDER BY created_at DESC`
  return rows as CustomScreen[]
}

export async function getCustomScreen(id: number): Promise<CustomScreen | null> {
  const rows = await sql`SELECT * FROM custom_screens WHERE id = ${id}`
  return (rows[0] as CustomScreen) ?? null
}

export async function createCustomScreen(name: string, html: string): Promise<CustomScreen> {
  const rows = await sql`
    INSERT INTO custom_screens (name, html)
    VALUES (${name}, ${html})
    RETURNING *
  `
  return rows[0] as CustomScreen
}

export async function updateCustomScreen(id: number, name: string, html: string): Promise<CustomScreen> {
  const rows = await sql`
    UPDATE custom_screens
    SET name = ${name}, html = ${html}, updated_at = NOW()
    WHERE id = ${id}
    RETURNING *
  `
  return rows[0] as CustomScreen
}

export async function deleteCustomScreen(id: number): Promise<void> {
  await sql`DELETE FROM custom_screens WHERE id = ${id}`
}

export async function getActiveCustomScreenId(): Promise<number | null> {
  const rows = await sql`SELECT value FROM display_settings WHERE key = 'active_custom_screen_id'`
  const val = rows[0]?.value
  if (!val) return null
  const n = parseInt(val, 10)
  return isNaN(n) ? null : n
}

export async function setActiveCustomScreenId(id: number | null): Promise<void> {
  const val = id == null ? '' : String(id)
  await sql`
    INSERT INTO display_settings (key, value) VALUES ('active_custom_screen_id', ${val})
    ON CONFLICT (key) DO UPDATE SET value = ${val}
  `
}
