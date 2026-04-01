'use client'

import { useState, useEffect, useCallback } from 'react'
import { Loader2, MonitorOff, Wrench, Zap, Terminal, Cpu } from 'lucide-react'
import type { BlockingScreen } from '@/lib/db'

interface ScreenDef {
  id: BlockingScreen
  label: string
  description: string
  icon: React.ReactNode
  color: string
  bg: string
}

const SCREENS: ScreenDef[] = [
  {
    id: 'none',
    label: 'Desactivado',
    description: 'Mostrar anuncios con normalidad',
    icon: <MonitorOff className="w-5 h-5" />,
    color: '#6b7a96',
    bg: 'rgba(107,122,150,0.12)',
  },
  {
    id: 'maintenance',
    label: 'Mantenimiento',
    description: 'Pantalla de mantenimiento del sistema',
    icon: <Wrench className="w-5 h-5" />,
    color: '#f59e0b',
    bg: 'rgba(245,158,11,0.12)',
  },
  {
    id: 'outage',
    label: 'Caida de servicios',
    description: 'Caida de servicios de anuncios',
    icon: <Zap className="w-5 h-5" />,
    color: '#ef4444',
    bg: 'rgba(239,68,68,0.12)',
  },
  {
    id: 'terminal',
    label: 'Terminal',
    description: 'Terminal simulando actividad del sistema',
    icon: <Terminal className="w-5 h-5" />,
    color: '#4ade80',
    bg: 'rgba(74,222,128,0.12)',
  },
  {
    id: 'loading',
    label: 'Cargando sistemas',
    description: 'Pantalla de inicio y carga del sistema',
    icon: <Cpu className="w-5 h-5" />,
    color: '#60a5fa',
    bg: 'rgba(96,165,250,0.12)',
  },
]

export function BlockingScreenPanel() {
  const [active, setActive] = useState<BlockingScreen>('none')
  const [saving, setSaving] = useState(false)

  const fetchCurrent = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/blocking-screen', { cache: 'no-store' })
      const data = await res.json()
      if (data.screen) setActive(data.screen as BlockingScreen)
    } catch {
      // silent
    }
  }, [])

  useEffect(() => {
    fetchCurrent()
  }, [fetchCurrent])

  const activate = async (screen: BlockingScreen) => {
    if (screen === active || saving) return
    setSaving(true)
    try {
      await fetch('/api/admin/blocking-screen', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ screen }),
      })
      setActive(screen)
    } catch {
      // silent
    } finally {
      setSaving(false)
    }
  }

  return (
    <section
      className="rounded-xl border p-5"
      style={{ background: 'var(--dashboard-card)', borderColor: 'var(--dashboard-border)' }}
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-sm font-semibold" style={{ color: 'var(--dashboard-fg)' }}>
            Pantallas de bloqueo
          </h2>
          <p className="text-xs mt-0.5" style={{ color: 'var(--dashboard-muted)' }}>
            Reemplaza los anuncios en pantalla con una pantalla especial
          </p>
        </div>
        {saving && <Loader2 className="w-4 h-4 animate-spin" style={{ color: 'var(--dashboard-muted)' }} />}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
        {SCREENS.map(screen => {
          const isActive = active === screen.id
          const shadow = isActive ? '0 0 0 1px ' + screen.color + '40' : 'none'
          return (
            <button
              key={screen.id}
              onClick={() => activate(screen.id)}
              disabled={saving}
              className="flex flex-col items-start gap-2 p-3 rounded-lg border text-left transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: isActive ? screen.bg : 'var(--dashboard-input)',
                borderColor: isActive ? screen.color : 'var(--dashboard-border)',
                boxShadow: shadow,
              }}
            >
              <div
                className="w-8 h-8 rounded-md flex items-center justify-center"
                style={{
                  background: isActive ? screen.bg : 'var(--dashboard-hover)',
                  color: isActive ? screen.color : 'var(--dashboard-muted)',
                }}
              >
                {screen.icon}
              </div>
              <div>
                <p
                  className="text-xs font-semibold leading-snug"
                  style={{ color: isActive ? screen.color : 'var(--dashboard-fg)' }}
                >
                  {screen.label}
                </p>
                <p className="text-[10px] mt-0.5 leading-snug" style={{ color: 'var(--dashboard-muted)' }}>
                  {screen.description}
                </p>
              </div>
              {isActive && (
                <span
                  className="text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded-full"
                  style={{ background: screen.color, color: '#fff' }}
                >
                  Activo
                </span>
              )}
            </button>
          )
        })}
      </div>
    </section>
  )
}
