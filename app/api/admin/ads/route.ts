import { type NextRequest, NextResponse } from 'next/server'
import { getAds, createAd } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const ads = await getAds()
    return NextResponse.json(ads)
  } catch (error) {
    console.error('GET /api/admin/ads error:', error)
    return NextResponse.json({ error: 'Failed to fetch ads' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, type, content, priority, pinned, duration } = body

    if (!title || !type || !content) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const ad = await createAd({
      title,
      type,
      content,
      priority: Number(priority) || 1,
      pinned: Boolean(pinned),
      duration: Number(duration) || 8,
    })

    return NextResponse.json(ad, { status: 201 })
  } catch (error) {
    console.error('POST /api/admin/ads error:', error)
    return NextResponse.json({ error: 'Failed to create ad' }, { status: 500 })
  }
}
