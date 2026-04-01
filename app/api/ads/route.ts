import { type NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import type { Ad } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    // Return active regular ads + active flash ads together
    // Flash ads come first so they are shown ASAP
    const rows = await sql`
      SELECT * FROM ads
      WHERE active = TRUE
      ORDER BY flash DESC, pinned DESC, priority DESC, created_at DESC
    `
    const ads = rows as Ad[]

    const lastModified = ads.length > 0
      ? Math.max(...ads.map(a => new Date(a.updated_at).getTime()))
      : 0

    const ifNoneMatch = request.headers.get('if-none-match')
    const etag = `"${lastModified}"`

    if (ifNoneMatch === etag) {
      return new NextResponse(null, { status: 304 })
    }

    return NextResponse.json(ads, {
      headers: {
        'Cache-Control': 'no-store',
        'ETag': etag,
      },
    })
  } catch (error) {
    console.error('GET /api/ads error:', error)
    return NextResponse.json({ error: 'Failed to fetch ads' }, { status: 500 })
  }
}

