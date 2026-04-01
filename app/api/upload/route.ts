import { put } from '@vercel/blob'
import { handleUpload, type HandleUploadBody } from '@vercel/blob/client'
import { type NextRequest, NextResponse } from 'next/server'

// Allow up to 5 minutes for large video uploads
export const maxDuration = 300

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type') ?? ''

    // --- Client-side direct upload token flow (avoids API body size limits / 413) ---
    if (contentType.includes('application/json')) {
      const body = (await request.json()) as HandleUploadBody

      const jsonResponse = await handleUpload({
        body,
        request,
        onBeforeGenerateToken: async () => {
          return {
            addRandomSuffix: true,
            allowedContentTypes: ['image/*', 'video/*'],
          }
        },
        onUploadCompleted: async () => {
          // No-op for now. Ads store the returned blob URL directly in the client.
        },
      })

      return NextResponse.json(jsonResponse)
    }

    // --- Legacy upload endpoints (small files/local environments) ---
    const url = new URL(request.url)
    const filenameParam = url.searchParams.get('filename')
    const typeParam = url.searchParams.get('type') ?? undefined

    if (filenameParam && request.body) {
      const safeName = filenameParam.replace(/[^a-zA-Z0-9._-]/g, '_')
      const blob = await put(safeName, request.body, {
        access: 'public',
        contentType: typeParam,
      })
      return NextResponse.json({ url: blob.url })
    }

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
