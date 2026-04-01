import { type NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'

export const dynamic = 'force-dynamic'

// DELETE a specific flash ad (called by /display after showing it once)
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await sql`DELETE FROM ads WHERE id = ${Number(id)} AND flash = TRUE`
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('DELETE /api/flash/[id] error:', error)
    return NextResponse.json({ error: 'Failed to delete flash ad' }, { status: 500 })
  }
}
