import { type NextRequest, NextResponse } from 'next/server'
import {
  getCustomScreen,
  updateCustomScreen,
  deleteCustomScreen,
  getActiveCustomScreenId,
  setActiveCustomScreenId,
  setBlockingScreen,
} from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const screen = await getCustomScreen(parseInt(id, 10))
    if (!screen) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({ screen })
  } catch (error) {
    console.error('GET /api/admin/custom-screens/[id] error:', error)
    return NextResponse.json({ error: 'Failed to get custom screen' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { name, html } = body as { name: string; html: string }
    if (!name?.trim()) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }
    const screen = await updateCustomScreen(parseInt(id, 10), name.trim(), html ?? '')
    return NextResponse.json({ screen })
  } catch (error) {
    console.error('PUT /api/admin/custom-screens/[id] error:', error)
    return NextResponse.json({ error: 'Failed to update custom screen' }, { status: 500 })
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const numId = parseInt(id, 10)

    // If this was the active custom screen, deactivate it
    const activeId = await getActiveCustomScreenId()
    if (activeId === numId) {
      await setActiveCustomScreenId(null)
      await setBlockingScreen('none')
    }

    await deleteCustomScreen(numId)
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('DELETE /api/admin/custom-screens/[id] error:', error)
    return NextResponse.json({ error: 'Failed to delete custom screen' }, { status: 500 })
  }
}
