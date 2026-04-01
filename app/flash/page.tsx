'use client'

import { useState, useCallback } from 'react'
import Image from 'next/image'
import useSWR, { mutate } from 'swr'
import type { Ad } from '@/lib/db'

const fetcher = (url: string) =>
  fetch(url).then(r => r.json()).then(d => (Array.isArray(d) ? d : []))

type AdType = 'image' | 'video' | 'web'

export default function FlashPage() {
  const { data: ads = [], isLoading } = useSWR<Ad[]>('/api/flash', fetcher, {
    refreshInterval: 5000,
  })

  const [type, setType] = useState<AdType>('image')
  const [title, setTitle] = useState('')
  const [url, setUrl] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const reset = () => {
    setTitle('')
    setUrl('')
    setFile(null)
    setError('')
  }

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess(false)

    const needsFile = type === 'image' || type === 'video'
    if (needsFile && !file && !url) {
      setError('Sube un archivo o introduce una URL.')
      return
    }
    if (type === 'web' && !url) {
      setError('Introduce la URL de la web.')
      return
    }

    setSubmitting(true)
    try {
      let body: BodyInit
      let headers: HeadersInit = {}

      if (needsFile && file) {
        const fd = new FormData()
        fd.append('type', type)
        fd.append('title', title || 'Anuncio Flash')
        fd.append('file', file)
        body = fd
      } else {
        headers = { 'Content-Type': 'application/json' }
        body = JSON.stringify({ type, content: url, title: title || 'Anuncio Flash' })
      }

      const res = await fetch('/api/flash', { method: 'POST', headers, body })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Error al crear el anuncio')
      }

      reset()
      setSuccess(true)
      mutate('/api/flash')
      setTimeout(() => setSuccess(false), 3000)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setSubmitting(false)
    }
  }, [type, file, url, title])

  const handleDelete = async (id: number) => {
    await fetch(`/api/flash/${id}`, { method: 'DELETE' })
    mutate('/api/flash')
  }

  return (
    <div className="min-h-screen font-sans" style={{ background: 'var(--dashboard-bg, #0e1421)', color: 'var(--dashboard-fg, #e8edf5)' }}>
      {/* Header */}
      <header className="border-b px-6 py-4 flex items-center justify-between sticky top-0 z-10"
        style={{ background: 'var(--dashboard-card, #151f30)', borderColor: 'var(--dashboard-border, #1e2d45)' }}
      >
        <div className="flex items-center gap-3">
          <Image src="/logo.png" alt="Astra Center" width={36} height={36} className="object-contain" style={{ width: 'auto', height: 36 }} priority loading="eager" />
          <div>
            <h1 className="text-base font-bold tracking-tight leading-none">Anuncios Flash</h1>
            <p className="text-xs mt-0.5" style={{ color: 'var(--dashboard-muted, #6b7a96)' }}>
              Se muestran una vez y se eliminan automáticamente
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <a
            href="/flash/preview"
            target="_blank"
            className="text-xs px-3 py-1.5 rounded-lg font-medium transition-colors"
            style={{ background: 'rgba(239,68,68,0.15)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)' }}
          >
            Vista previa Flash
          </a>
          <a
            href="/"
            className="text-xs px-3 py-1.5 rounded-lg font-medium transition-colors"
            style={{ background: 'var(--dashboard-hover, #1e2d45)', color: 'var(--dashboard-muted, #6b7a96)' }}
          >
            Panel principal
          </a>
          <a
            href="/display"
            target="_blank"
            className="text-xs px-3 py-1.5 rounded-lg font-medium transition-colors"
            style={{ background: 'var(--brand-navy-light, #243358)', color: 'var(--brand-orange, #f59e0b)' }}
          >
            Ver pantalla
          </a>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8 flex flex-col gap-8">
        {/* Create form */}
        <section
          className="rounded-2xl p-6"
          style={{ background: 'var(--dashboard-card, #151f30)', border: '1px solid var(--dashboard-border, #1e2d45)' }}
        >
          <div className="flex items-center gap-2 mb-5">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <h2 className="font-semibold text-sm uppercase tracking-widest" style={{ color: 'var(--brand-orange, #f59e0b)' }}>
              Nuevo anuncio flash
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Title */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium" style={{ color: 'var(--dashboard-muted, #6b7a96)' }}>
                Nombre (opcional)
              </label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Anuncio Flash"
                className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                style={{
                  background: 'var(--dashboard-input, #1a2740)',
                  border: '1px solid var(--dashboard-border, #1e2d45)',
                  color: 'var(--dashboard-fg, #e8edf5)',
                }}
              />
            </div>

            {/* Type selector */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium" style={{ color: 'var(--dashboard-muted, #6b7a96)' }}>
                Tipo de anuncio
              </label>
              <div className="flex gap-2">
                {(['image', 'video', 'web'] as AdType[]).map(t => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => { setType(t); setFile(null); setUrl('') }}
                    className="flex-1 py-2 rounded-lg text-sm font-medium transition-all"
                    style={{
                      background: type === t ? 'var(--brand-orange, #f59e0b)' : 'var(--dashboard-input, #1a2740)',
                      color: type === t ? '#0e1421' : 'var(--dashboard-muted, #6b7a96)',
                      border: `1px solid ${type === t ? 'var(--brand-orange, #f59e0b)' : 'var(--dashboard-border, #1e2d45)'}`,
                    }}
                  >
                    {t === 'image' ? 'Imagen' : t === 'video' ? 'Video' : 'Web / URL'}
                  </button>
                ))}
              </div>
            </div>

            {/* Content input */}
            {(type === 'image' || type === 'video') ? (
              <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium" style={{ color: 'var(--dashboard-muted, #6b7a96)' }}>
                    Subir archivo
                  </label>
                  <label
                    className="flex flex-col items-center justify-center gap-2 rounded-xl py-8 cursor-pointer transition-colors"
                    style={{
                      background: 'var(--dashboard-input, #1a2740)',
                      border: '2px dashed var(--dashboard-border, #1e2d45)',
                    }}
                  >
                    <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: 'var(--dashboard-muted)' }}>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                    </svg>
                    <span className="text-sm" style={{ color: 'var(--dashboard-muted)' }}>
                      {file ? file.name : `Haz clic para subir ${type === 'image' ? 'una imagen' : 'un video'}`}
                    </span>
                    <input
                      type="file"
                      accept={type === 'image' ? 'image/*' : 'video/*'}
                      className="hidden"
                      onChange={e => { setFile(e.target.files?.[0] ?? null); setUrl('') }}
                    />
                  </label>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px" style={{ background: 'var(--dashboard-border)' }} />
                  <span className="text-xs" style={{ color: 'var(--dashboard-muted)' }}>o introduce URL</span>
                  <div className="flex-1 h-px" style={{ background: 'var(--dashboard-border)' }} />
                </div>
                <input
                  type="url"
                  value={url}
                  onChange={e => { setUrl(e.target.value); setFile(null) }}
                  placeholder={`https://ejemplo.com/${type === 'image' ? 'imagen.jpg' : 'video.mp4'}`}
                  className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                  style={{
                    background: 'var(--dashboard-input, #1a2740)',
                    border: '1px solid var(--dashboard-border, #1e2d45)',
                    color: 'var(--dashboard-fg, #e8edf5)',
                  }}
                />
              </div>
            ) : (
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium" style={{ color: 'var(--dashboard-muted, #6b7a96)' }}>
                  URL de la pagina web
                </label>
                <input
                  type="url"
                  value={url}
                  onChange={e => setUrl(e.target.value)}
                  placeholder="https://ejemplo.com"
                  required
                  className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                  style={{
                    background: 'var(--dashboard-input, #1a2740)',
                    border: '1px solid var(--dashboard-border, #1e2d45)',
                    color: 'var(--dashboard-fg, #e8edf5)',
                  }}
                />
              </div>
            )}

            {error && (
              <p className="text-sm px-3 py-2 rounded-lg" style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)' }}>
                {error}
              </p>
            )}
            {success && (
              <p className="text-sm px-3 py-2 rounded-lg" style={{ background: 'rgba(34,197,94,0.1)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.2)' }}>
                Anuncio flash creado. Aparecera en pantalla como siguiente anuncio.
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 rounded-xl font-semibold text-sm transition-all"
              style={{
                background: submitting ? 'var(--dashboard-hover)' : '#ef4444',
                color: submitting ? 'var(--dashboard-muted)' : '#fff',
                cursor: submitting ? 'not-allowed' : 'pointer',
              }}
            >
              {submitting ? 'Enviando...' : 'Lanzar anuncio flash'}
            </button>
          </form>
        </section>

        {/* Queue */}
        <section>
          <h2 className="text-sm font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--dashboard-muted)' }}>
            Cola de flash pendientes
            <span
              className="text-xs px-2 py-0.5 rounded-full font-bold"
              style={{ background: ads.length > 0 ? 'rgba(239,68,68,0.2)' : 'var(--dashboard-hover)', color: ads.length > 0 ? '#ef4444' : 'var(--dashboard-muted)' }}
            >
              {isLoading ? '...' : ads.length}
            </span>
          </h2>

          {!isLoading && ads.length === 0 ? (
            <div
              className="rounded-xl py-12 flex flex-col items-center gap-3"
              style={{ background: 'var(--dashboard-card)', border: '1px dashed var(--dashboard-border)' }}
            >
              <svg width="36" height="36" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: 'var(--dashboard-muted)', opacity: 0.4 }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
              </svg>
              <p className="text-sm" style={{ color: 'var(--dashboard-muted)' }}>No hay anuncios flash pendientes</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {ads.map((ad, idx) => (
                <div
                  key={ad.id}
                  className="flex items-center gap-4 rounded-xl px-4 py-3"
                  style={{ background: 'var(--dashboard-card)', border: '1px solid var(--dashboard-border)' }}
                >
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                    style={{ background: idx === 0 ? 'rgba(239,68,68,0.2)' : 'var(--dashboard-hover)', color: idx === 0 ? '#ef4444' : 'var(--dashboard-muted)' }}
                  >
                    {idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{ad.title}</p>
                    <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--dashboard-muted)' }}>
                      {ad.type === 'image' ? 'Imagen' : ad.type === 'video' ? 'Video' : 'Web'} &middot; {ad.content}
                    </p>
                  </div>
                  {idx === 0 && (
                    <span className="text-xs px-2 py-0.5 rounded-full font-semibold flex-shrink-0"
                      style={{ background: 'rgba(239,68,68,0.15)', color: '#ef4444' }}>
                      Siguiente
                    </span>
                  )}
                  <button
                    onClick={() => handleDelete(ad.id)}
                    className="p-1.5 rounded-lg transition-colors flex-shrink-0"
                    style={{ color: 'var(--dashboard-muted)' }}
                    aria-label="Eliminar"
                    title="Eliminar"
                  >
                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  )
}
