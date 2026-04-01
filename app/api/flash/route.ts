import { type NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import type { Ad } from '@/lib/db'
import { put } from '@vercel/blob'

export const dynamic = 'force-dynamic'

// GET all flash ads (for the flash dashboard)
export async function GET() {
  try {
    const rows = await sql`
      SELECT * FROM ads
      WHERE flash = TRUE
      ORDER BY created_at DESC
    `
    return NextResponse.json(rows as Ad[])
  } catch (error) {
    console.error('GET /api/flash error:', error)
    return NextResponse.json({ error: 'Failed to fetch flash ads' }, { status: 500 })
  }
}

// POST create a new flash ad
export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type') ?? ''

    let type: string
    let content: string
    let title: string

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData()
      const file = formData.get('file') as File | null
      type = formData.get('type') as string
      title = (formData.get('title') as string) || 'Anuncio Flash'

      if (file) {
        const blob = await put(`flash/${Date.now()}-${file.name}`, file, { access: 'public' })
        content = blob.url
      } else {
        content = formData.get('content') as string
      }
    } else {
      const body = await request.json()
      type = body.type
      content = body.content
      title = body.title || 'Anuncio Flash'
    }

    if (!type || !content) {
      return NextResponse.json({ error: 'Missing type or content' }, { status: 400 })
    }

    const rows = await sql`
      INSERT INTO ads (title, type, content, priority, pinned, duration, active, flash)
      VALUES (${title}, ${type}, ${content}, 1, FALSE, 8, TRUE, TRUE)
      RETURNING *
    `
    return NextResponse.json(rows[0] as Ad, { status: 201 })
  } catch (error) {
    console.error('POST /api/flash error:', error)
    return NextResponse.json({ error: 'Failed to create flash ad' }, { status: 500 })
  }
}
