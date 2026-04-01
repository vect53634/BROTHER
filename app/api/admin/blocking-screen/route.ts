import { type NextRequest, NextResponse } from 'next/server'
import { getBlockingScreen, setBlockingScreen, type BlockingScreen } from '@/lib/db'

export const dynamic = 'force-dynamic'

const VALID: BlockingScreen[] = ['none', 'maintenance', 'outage', 'terminal', 'loading']

export async function GET() {
  try {
    const screen = await getBlockingScreen()
    return NextResponse.json({ screen })
  } catch (error) {
    console.error('GET /api/admin/blocking-screen error:', error)
    return NextResponse.json({ error: 'Failed to get blocking screen' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const screen = body.screen as BlockingScreen

    if (!VALID.includes(screen)) {
      return NextResponse.json({ error: 'Invalid screen value' }, { status: 400 })
    }

    await setBlockingScreen(screen)
    return NextResponse.json({ screen })
  } catch (error) {
    console.error('POST /api/admin/blocking-screen error:', error)
    return NextResponse.json({ error: 'Failed to set blocking screen' }, { status: 500 })
  }
}
