import { put } from '@vercel/blob'
import { type NextRequest, NextResponse } from 'next/server'

// Allow up to 5 minutes for large video uploads
export const maxDuration = 300

export async function POST(request: NextRequest) {
  try {
    // Get filename + type from query params (set by the client for raw uploads)
    const url = new URL(request.url)
    const filenameParam = url.searchParams.get('filename')
    const typeParam = url.searchParams.get('type') ?? undefined

    // --- Raw body stream upload (preferred for large files) ---
    if (filenameParam && request.body) {
      const safeName = filenameParam.replace(/[^a-zA-Z0-9._-]/g, '_')
      const blob = await put(safeName, request.body, {
        access: 'public',
        contentType: typeParam,
      })
      return NextResponse.json({ url: blob.url })
    }

    // --- Multipart form-data fallback (small files only) ---
    const contentType = request.headers.get('content-type') ?? ''
    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData()
      const file = formData.get('file') as File | null

      if (!file) {
        return NextResponse.json({ error: 'No se proporcionó ningún archivo' }, { status: 400 })
      }

      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')

      const blob = await put(safeName, file.stream(), {
        access: 'public',
        contentType: file.type || undefined,
      })

      return NextResponse.json({ url: blob.url })
    }

    return NextResponse.json({ error: 'Formato de solicitud no soportado' }, { status: 400 })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Error al subir el archivo. Verifica el tamaño e intenta de nuevo.' },
      { status: 500 }
    )
  }
}
