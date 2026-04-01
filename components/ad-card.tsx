'use client'

import { useState } from 'react'
import {
  Image as ImageIcon, Video, Globe, Pin,
  Zap, Pencil, Trash2, ToggleLeft, ToggleRight, Clock, Star
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { Ad } from '@/lib/db'

interface AdCardProps {
  ad: Ad
  onEdit: (ad: Ad) => void
  onDelete: (id: number) => void
  onToggleActive: (id: number, active: boolean) => void
}

const TYPE_ICON: Record<string, React.ReactNode> = {
  image: <ImageIcon className="w-3.5 h-3.5" />,
  video: <Video className="w-3.5 h-3.5" />,
  web: <Globe className="w-3.5 h-3.5" />,
}

const PRIORITY_INFO: Record<number, { label: string; icon: React.ReactNode; color: string }> = {
  1: { label: 'Normal', icon: <Star className="w-3 h-3" />, color: 'bg-slate-500/20 text-slate-300 border-slate-500/30' },
  2: { label: 'Importante', icon: <Zap className="w-3 h-3" />, color: 'bg-amber-500/20 text-amber-300 border-amber-500/30' },
  3: { label: 'Urgente', icon: <Zap className="w-3 h-3" />, color: 'bg-red-500/20 text-red-300 border-red-500/30' },
}

export function AdCard({ ad, onEdit, onDelete, onToggleActive }: AdCardProps) {
  const [deleting, setDeleting] = useState(false)
  const priority = PRIORITY_INFO[ad.priority] ?? PRIORITY_INFO[1]

  const handleDelete = async () => {
    if (!confirm(`¿Eliminar el anuncio "${ad.title}"?`)) return
    setDeleting(true)
    await onDelete(ad.id)
    setDeleting(false)
  }

  const renderPreview = () => {
    if (ad.type === 'image') {
      return (
        <div className="w-full h-28 rounded-lg overflow-hidden bg-[var(--dashboard-input)]">
          <img src={ad.content} alt={ad.title} className="w-full h-full object-cover" />
        </div>
      )
    }
    if (ad.type === 'video') {
      return (
        <div className="w-full h-28 rounded-lg overflow-hidden bg-[var(--dashboard-input)] flex flex-col items-center justify-center gap-1">
          <Video className="w-8 h-8 text-[var(--dashboard-muted)]" />
          <span className="text-xs text-[var(--dashboard-muted)] px-2 truncate w-full text-center">Video</span>
        </div>
      )
    }
    return (
      <div className="w-full h-28 rounded-lg overflow-hidden bg-[var(--dashboard-input)] flex flex-col items-center justify-center gap-1">
        <Globe className="w-8 h-8 text-[var(--dashboard-muted)]" />
        <span className="text-xs text-[var(--dashboard-muted)] px-2 truncate w-full text-center">Web</span>
      </div>
    )
  }

  return (
    <div
      className={`flex flex-col gap-3 p-4 rounded-xl border transition-all ${
        ad.active
          ? 'bg-[var(--dashboard-card)] border-[var(--dashboard-border)]'
          : 'bg-[var(--dashboard-card)]/50 border-[var(--dashboard-border)]/50 opacity-60'
      }`}
    >
      {renderPreview()}

      <div className="flex flex-col gap-1.5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-[var(--dashboard-fg)] leading-tight text-sm line-clamp-2">
            {ad.title}
          </h3>
          {ad.pinned && (
            <Pin className="w-3.5 h-3.5 text-[var(--brand-orange)] shrink-0 mt-0.5" />
          )}
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-[var(--dashboard-input)] text-[var(--dashboard-muted)] border border-[var(--dashboard-border)]">
            {TYPE_ICON[ad.type]}
            {ad.type === 'image' ? 'Imagen' : ad.type === 'video' ? 'Video' : 'Web'}
          </span>
          <span className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border ${priority.color}`}>
            {priority.icon} {priority.label}
          </span>
          <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-[var(--dashboard-input)] text-[var(--dashboard-muted)] border border-[var(--dashboard-border)]">
            <Clock className="w-3 h-3" /> {ad.duration}s
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 pt-1">
        <Button
          size="sm"
          variant="outline"
          onClick={() => onToggleActive(ad.id, !ad.active)}
          className="flex-1 text-xs border-[var(--dashboard-border)] text-[var(--dashboard-fg)] hover:bg-[var(--dashboard-hover)]"
        >
          {ad.active
            ? <><ToggleRight className="w-3.5 h-3.5 mr-1 text-green-400" />Activo</>
            : <><ToggleLeft className="w-3.5 h-3.5 mr-1 text-[var(--dashboard-muted)]" />Inactivo</>
          }
        </Button>
        <Button
          size="icon"
          variant="outline"
          onClick={() => onEdit(ad)}
          className="border-[var(--dashboard-border)] text-[var(--dashboard-fg)] hover:bg-[var(--dashboard-hover)] w-8 h-8"
        >
          <Pencil className="w-3.5 h-3.5" />
        </Button>
        <Button
          size="icon"
          variant="outline"
          onClick={handleDelete}
          disabled={deleting}
          className="border-red-500/30 text-red-400 hover:bg-red-500/10 w-8 h-8"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  )
}
