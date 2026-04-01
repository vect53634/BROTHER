import { type NextRequest, NextResponse } from 'next/server'
import { updateAd, deleteAd } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const ad = await updateAd(Number(id), body)
    return NextResponse.json(ad)
  } catch (error) {
    console.error('PATCH /api/admin/ads/[id] error:', error)
    return NextResponse.json({ error: 'Failed to update ad' }, { status: 500 })
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await deleteAd(Number(id))
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('DELETE /api/admin/ads/[id] error:', error)
    return NextResponse.json({ error: 'Failed to delete ad' }, { status: 500 })
  }
}
