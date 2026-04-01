import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL!)

export { sql }

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
