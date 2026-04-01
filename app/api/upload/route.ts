import { put } from '@vercel/blob'
import { type NextRequest, NextResponse } from 'next/server'

// Allow large file uploads (videos, etc.)
export const maxDuration = 60

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type') ?? ''

    if (contentType.includes('multipart/form-data')) {
      // Standard form upload
      const formData = await request.formData()
      const file = formData.get('file') as File | null

      if (!file) {
        return NextResponse.json({ error: 'No se proporcionó ningún archivo' }, { status: 400 })
      }

      const filename = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')

      const blob = await put(filename, file.stream(), {
        access: 'public',
        contentType: file.type || undefined,
      })

      return NextResponse.json({ url: blob.url })
    }

    // Fallback: raw body with filename query param
    const url = new URL(request.url)
    const filename = url.searchParams.get('filename') ?? `upload_${Date.now()}`
    const fileType = url.searchParams.get('type') ?? undefined

    if (!request.body) {
      return NextResponse.json({ error: 'No se proporcionó ningún archivo' }, { status: 400 })
    }

    const blob = await put(filename, request.body, {
      access: 'public',
      contentType: fileType,
    })

    return NextResponse.json({ url: blob.url })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Error al subir el archivo. Verifica el tamaño e intenta de nuevo.' },
      { status: 500 }
    )
  }
}
