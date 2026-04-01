import { type NextRequest, NextResponse } from 'next/server'
import {
  getCustomScreens,
  createCustomScreen,
  getActiveCustomScreenId,
} from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const screens = await getCustomScreens()
    const activeId = await getActiveCustomScreenId()
    return NextResponse.json({ screens, activeId })
  } catch (error) {
    console.error('GET /api/admin/custom-screens error:', error)
    return NextResponse.json({ error: 'Failed to get custom screens' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, html } = body as { name: string; html: string }
    if (!name?.trim()) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }
    const screen = await createCustomScreen(name.trim(), html ?? '')
    return NextResponse.json({ screen })
  } catch (error) {
    console.error('POST /api/admin/custom-screens error:', error)
    return NextResponse.json({ error: 'Failed to create custom screen' }, { status: 500 })
  }
}
