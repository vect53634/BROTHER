'use client'

import { useState, useRef, useEffect } from 'react'
import { Upload, Video, Image as ImageIcon, Globe, X, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import type { Ad } from '@/lib/db'

interface AdFormProps {
  open: boolean
  onClose: () => void
  onSaved: () => void
  initial?: Ad | null
}

const PRIORITY_LABELS: Record<number, string> = {
  1: 'Normal',
  2: 'Importante',
  3: 'Urgente',
}

const TYPE_ICONS: Record<string, React.ReactNode> = {
  image: <ImageIcon className="w-4 h-4" />,
  video: <Video className="w-4 h-4" />,
  web: <Globe className="w-4 h-4" />,
}

export function AdFormDialog({ open, onClose, onSaved, initial }: AdFormProps) {
  const isEdit = Boolean(initial?.id)

  const [title, setTitle] = useState('')
  const [type, setType] = useState<'image' | 'video' | 'web'>('image')
  const [content, setContent] = useState('')
  const [priority, setPriority] = useState<number>(1)
  const [pinned, setPinned] = useState(false)
  const [duration, setDuration] = useState(8)
  const [active, setActive] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  // Reset form state whenever dialog opens or initial changes
  useEffect(() => {
    if (open) {
      setTitle(initial?.title ?? '')
      setType((initial?.type as 'image' | 'video' | 'web') ?? 'image')
      setContent(initial?.content ?? '')
      setPriority(initial?.priority ?? 1)
      setPinned(initial?.pinned ?? false)
      setDuration(initial?.duration ?? 8)
      setActive(initial?.active ?? true)
      setError('')
    }
  }, [open, initial])

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setError('')
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/upload', { method: 'POST', body: fd })
      const data = await res.json()
      if (data.url) {
        setContent(data.url)
        setType(file.type.startsWith('video') ? 'video' : 'image')
      } else {
        setError('Error al subir el archivo')
      }
    } catch {
      setError('Error al subir el archivo')
    } finally {
      setUploading(false)
    }
  }

  const handleSave = async () => {
    if (!title.trim() || !content.trim()) {
      setError('El título y el contenido son obligatorios')
      return
    }
    setSaving(true)
    setError('')
    try {
      const payload = { title, type, content, priority, pinned, duration, active }
      const url = isEdit ? `/api/admin/ads/${initial!.id}` : '/api/admin/ads'
      const method = isEdit ? 'PATCH' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error('Error al guardar')
      onSaved()
      onClose()
    } catch {
      setError('Error al guardar el anuncio')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-lg bg-[var(--dashboard-card)] border-[var(--dashboard-border)] text-[var(--dashboard-fg)]">
        <DialogHeader>
          <DialogTitle className="text-[var(--dashboard-fg)]">
            {isEdit ? 'Editar anuncio' : 'Nuevo anuncio'}
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-2">
          {/* Title */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="ad-title" className="text-[var(--dashboard-fg)]">Título</Label>
            <Input
              id="ad-title"
              placeholder="Nombre del anuncio"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="bg-[var(--dashboard-input)] border-[var(--dashboard-border)] text-[var(--dashboard-fg)] placeholder:text-[var(--dashboard-muted)]"
            />
          </div>

          {/* Type */}
          <div className="flex flex-col gap-1.5">
            <Label className="text-[var(--dashboard-fg)]">Tipo de anuncio</Label>
            <Select value={type} onValueChange={v => setType(v as 'image' | 'video' | 'web')}>
              <SelectTrigger className="bg-[var(--dashboard-input)] border-[var(--dashboard-border)] text-[var(--dashboard-fg)]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[var(--dashboard-card)] border-[var(--dashboard-border)]">
                {(['image', 'video', 'web'] as const).map(t => (
                  <SelectItem key={t} value={t} className="text-[var(--dashboard-fg)] focus:bg-[var(--dashboard-hover)]">
                    <span className="flex items-center gap-2">
                      {TYPE_ICONS[t]}
                      {t === 'image' ? 'Imagen' : t === 'video' ? 'Video' : 'Página Web'}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Content */}
          <div className="flex flex-col gap-1.5">
            <Label className="text-[var(--dashboard-fg)]">
              {type === 'web' ? 'URL de la página' : 'Archivo o URL'}
            </Label>
            <div className="flex gap-2">
              <Input
                placeholder={type === 'web' ? 'https://...' : 'https://... o sube un archivo'}
                value={content}
                onChange={e => setContent(e.target.value)}
                className="flex-1 bg-[var(--dashboard-input)] border-[var(--dashboard-border)] text-[var(--dashboard-fg)] placeholder:text-[var(--dashboard-muted)]"
              />
              {type !== 'web' && (
                <>
                  <input
                    ref={fileRef}
                    type="file"
                    accept={type === 'video' ? 'video/*' : 'image/*,video/*'}
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    disabled={uploading}
                    onClick={() => fileRef.current?.click()}
                    className="border-[var(--dashboard-border)] text-[var(--dashboard-fg)] hover:bg-[var(--dashboard-hover)]"
                  >
                    {uploading
                      ? <Loader2 className="w-4 h-4 animate-spin" />
                      : <Upload className="w-4 h-4" />
                    }
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Priority */}
          <div className="flex flex-col gap-1.5">
            <Label className="text-[var(--dashboard-fg)]">Prioridad</Label>
            <Select value={String(priority)} onValueChange={v => setPriority(Number(v))}>
              <SelectTrigger className="bg-[var(--dashboard-input)] border-[var(--dashboard-border)] text-[var(--dashboard-fg)]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[var(--dashboard-card)] border-[var(--dashboard-border)]">
                {[1, 2, 3].map(p => (
                  <SelectItem key={p} value={String(p)} className="text-[var(--dashboard-fg)] focus:bg-[var(--dashboard-hover)]">
                    {PRIORITY_LABELS[p]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Duration */}
          <div className="flex flex-col gap-1.5">
            <Label className="text-[var(--dashboard-fg)]">Duración (segundos)</Label>
            <Input
              type="number"
              min={3}
              max={120}
              value={duration}
              onChange={e => setDuration(Number(e.target.value))}
              className="bg-[var(--dashboard-input)] border-[var(--dashboard-border)] text-[var(--dashboard-fg)]"
            />
          </div>

          {/* Pinned & Active */}
          <div className="flex items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <Switch
                id="pinned"
                checked={pinned}
                onCheckedChange={setPinned}
              />
              <Label htmlFor="pinned" className="cursor-pointer text-[var(--dashboard-fg)]">
                Fijar permanentemente
              </Label>
            </div>
            <div className="flex items-center gap-3">
              <Switch
                id="active"
                checked={active}
                onCheckedChange={setActive}
              />
              <Label htmlFor="active" className="cursor-pointer text-[var(--dashboard-fg)]">
                Activo
              </Label>
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-400 flex items-center gap-1">
              <X className="w-3 h-3" /> {error}
            </p>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            className="border-[var(--dashboard-border)] text-[var(--dashboard-fg)] hover:bg-[var(--dashboard-hover)]"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-[var(--brand-orange)] hover:bg-[var(--brand-orange-hover)] text-white"
          >
            {saving && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
            {isEdit ? 'Guardar cambios' : 'Crear anuncio'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
