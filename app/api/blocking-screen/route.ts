import { NextResponse } from 'next/server'
import { getBlockingScreen } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const screen = await getBlockingScreen()
    return NextResponse.json({ screen })
  } catch {
    return NextResponse.json({ screen: 'none' })
  }
}
