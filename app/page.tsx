'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { Plus, Monitor, RefreshCw, Tv, Pin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AdCard } from '@/components/ad-card'
import { AdFormDialog } from '@/components/ad-form-dialog'
import type { Ad } from '@/lib/db'

export default function DashboardPage() {
  const [ads, setAds] = useState<Ad[]>([])
  const [loading, setLoading] = useState(true)
  const [formOpen, setFormOpen] = useState(false)
  const [editAd, setEditAd] = useState<Ad | null>(null)

  const fetchAds = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/ads', { cache: 'no-store' })
      const data = await res.json()
      setAds(Array.isArray(data) ? data : [])
    } catch {
      setAds([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAds()
  }, [fetchAds])

  const handleDelete = async (id: number) => {
    await fetch(`/api/admin/ads/${id}`, { method: 'DELETE' })
    setAds(prev => prev.filter(a => a.id !== id))
  }

  const handleToggleActive = async (id: number, active: boolean) => {
    await fetch(`/api/admin/ads/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active }),
    })
    setAds(prev => prev.map(a => a.id === id ? { ...a, active } : a))
  }

  const openCreate = () => {
    setEditAd(null)
    setFormOpen(true)
  }

  const openEdit = (ad: Ad) => {
    setEditAd(ad)
    setFormOpen(true)
  }

  const activeCount = ads.filter(a => a.active).length
  const pinnedCount = ads.filter(a => a.pinned).length

  return (
    <div className="min-h-screen font-sans" style={{ background: 'var(--dashboard-bg)' }}>
      {/* Header */}
      <header
        className="sticky top-0 z-50 backdrop-blur"
        style={{
          background: 'color-mix(in srgb, var(--dashboard-bg) 95%, transparent)',
          borderBottom: '1px solid var(--dashboard-border)',
        }}
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image
              src="/logo.png"
              alt="Astra Center"
              width={40}
              height={40}
              className="object-contain"
              loading="eager"
              priority
            />
            <div>
              <h1 className="text-lg font-bold leading-none" style={{ color: 'var(--dashboard-fg)' }}>
                Panel de Anuncios
              </h1>
              <p className="text-xs mt-0.5" style={{ color: 'var(--dashboard-muted)' }}>
                Sistema de cartelería digital
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="/flash"
              className="flex items-center gap-2 text-sm px-4 py-2 rounded-lg border transition-colors"
              style={{ borderColor: 'rgba(239,68,68,0.4)', color: '#ef4444', background: 'rgba(239,68,68,0.07)' }}
            >
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              Anuncios Flash
            </a>
            <a
              href="/display"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm px-4 py-2 rounded-lg border transition-colors"
              style={{
                borderColor: 'var(--dashboard-border)',
                color: 'var(--dashboard-fg)',
              }}
            >
              <Tv className="w-4 h-4" />
              Ver pantalla
            </a>
            <Button
              onClick={openCreate}
              className="flex items-center gap-2 text-white"
              style={{ background: 'var(--brand-orange)' }}
            >
              <Plus className="w-4 h-4" />
              Nuevo anuncio
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Total anuncios', value: ads.length, icon: <Monitor className="w-5 h-5" />, iconColor: 'var(--dashboard-muted)' },
            { label: 'Activos', value: activeCount, icon: <RefreshCw className="w-5 h-5" />, iconColor: '#4ade80' },
            { label: 'Fijados', value: pinnedCount, icon: <Pin className="w-5 h-5" />, iconColor: 'var(--brand-orange)' },
          ].map(stat => (
            <div
              key={stat.label}
              className="flex items-center gap-4 p-5 rounded-xl border"
              style={{
                background: 'var(--dashboard-card)',
                borderColor: 'var(--dashboard-border)',
              }}
            >
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ background: 'var(--dashboard-input)', color: stat.iconColor }}
              >
                {stat.icon}
              </div>
              <div>
                <p className="text-2xl font-bold" style={{ color: 'var(--dashboard-fg)' }}>
                  {stat.value}
                </p>
                <p className="text-xs" style={{ color: 'var(--dashboard-muted)' }}>
                  {stat.label}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Ads grid */}
        {loading ? (
          <div className="flex items-center justify-center h-48" style={{ color: 'var(--dashboard-muted)' }}>
            <RefreshCw className="w-6 h-6 animate-spin mr-2" />
            Cargando anuncios...
          </div>
        ) : ads.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 gap-4">
            <Image
              src="/logo.png"
              alt="Astra Center - Sin anuncios"
              width={96}
              height={96}
              className="object-contain opacity-20"
            />
            <p className="text-sm" style={{ color: 'var(--dashboard-muted)' }}>
              No hay anuncios todavía. ¡Crea el primero!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {ads.map(ad => (
              <AdCard
                key={ad.id}
                ad={ad}
                onEdit={openEdit}
                onDelete={handleDelete}
                onToggleActive={handleToggleActive}
              />
            ))}
          </div>
        )}
      </main>

      <AdFormDialog
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSaved={fetchAds}
        initial={editAd}
      />
    </div>
  )
}
