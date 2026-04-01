'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Image from 'next/image'
import type { Ad, BlockingScreen } from '@/lib/db'

// ─── Blocking screen overlays ────────────────────────────────────────────────

function MaintenanceScreen() {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center gap-8 font-mono" style={{ background: '#0e1421' }}>
      <div className="flex flex-col items-center gap-5">
        <div
          className="w-24 h-24 rounded-full flex items-center justify-center"
          style={{ background: 'rgba(245,158,11,0.12)', border: '2px solid rgba(245,158,11,0.4)' }}
        >
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
          </svg>
        </div>
        <div className="text-center">
          <p className="text-4xl font-bold tracking-tight" style={{ color: '#f59e0b' }}>
            Mantenimiento
          </p>
          <p className="text-base mt-2" style={{ color: 'rgba(255,255,255,0.5)' }}>
            El sistema se encuentra en mantenimiento
          </p>
          <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.3)' }}>
            Volveremos en breve
          </p>
        </div>
        <PulsingDots color="#f59e0b" />
      </div>
      <LogoWatermark />
    </div>
  )
}

function OutageScreen() {
  const [tick, setTick] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setTick(p => p + 1), 1000)
    return () => clearInterval(t)
  }, [])

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center gap-8 font-mono" style={{ background: '#0e0808' }}>
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(239,68,68,0.03) 2px,rgba(239,68,68,0.03) 4px)',
        }}
      />
      <div className="flex flex-col items-center gap-5 relative">
        <div
          className="w-24 h-24 rounded-full flex items-center justify-center"
          style={{
            background: 'rgba(239,68,68,0.1)',
            border: `2px solid ${tick % 2 === 0 ? 'rgba(239,68,68,0.6)' : 'rgba(239,68,68,0.2)'}`,
            transition: 'border-color 0.4s',
          }}
        >
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        </div>
        <div className="text-center">
          <p className="text-4xl font-bold tracking-tight" style={{ color: '#ef4444' }}>
            Servicio no disponible
          </p>
          <p className="text-base mt-2" style={{ color: 'rgba(255,255,255,0.5)' }}>
            El servicio de anuncios presenta una interrupcion
          </p>
          <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.3)' }}>
            Nuestro equipo esta trabajando para resolverlo
          </p>
        </div>
        <PulsingDots color="#ef4444" />
      </div>
      <LogoWatermark />
    </div>
  )
}

const TERMINAL_LINES = [
  '> Iniciando sistema de carteleria digital...',
  '> Verificando conexion con servidor central... OK',
  '> Cargando base de datos de anuncios... OK',
  '> Sincronizando contenido multimedia...',
  '> Descargando paquete: ads_bundle_v3.2.tar.gz [=====>     ] 54%',
  '> Descargando paquete: ads_bundle_v3.2.tar.gz [==========>] 100%',
  '> Verificando integridad de archivos... OK',
  '> Inicializando motor de renderizado...',
  '> Conectando con CDN de contenido... OK',
  '> Actualizando playlist de anuncios...',
  '> Cargando 12 anuncios activos...',
  '> Sistema listo. Iniciando reproduccion en 3...',
  '> Sistema listo. Iniciando reproduccion en 2...',
  '> Sistema listo. Iniciando reproduccion en 1...',
]

function TerminalScreen() {
  const [lines, setLines] = useState<string[]>([])
  const [cursor, setCursor] = useState(true)
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let i = 0
    const next = () => {
      setLines(TERMINAL_LINES.slice(0, i + 1))
      i++
      if (i < TERMINAL_LINES.length) {
        setTimeout(next, 600 + Math.random() * 600)
      } else {
        // Loop back after a pause
        setTimeout(() => { i = 0; setLines([]); next() }, 4000)
      }
    }
    const t = setTimeout(next, 500)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [lines])

  useEffect(() => {
    const t = setInterval(() => setCursor(p => !p), 500)
    return () => clearInterval(t)
  }, [])

  return (
    <div className="fixed inset-0 flex flex-col font-mono" style={{ background: '#050e05' }}>
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(0,255,0,0.025) 3px,rgba(0,255,0,0.025) 4px)',
        }}
      />
      {/* Terminal header */}
      <div
        className="flex items-center gap-2 px-4 py-2 border-b text-xs"
        style={{ background: '#0a1a0a', borderColor: 'rgba(74,222,128,0.2)', color: 'rgba(74,222,128,0.6)' }}
      >
        <span className="w-3 h-3 rounded-full bg-red-600" />
        <span className="w-3 h-3 rounded-full bg-yellow-500" />
        <span className="w-3 h-3 rounded-full bg-green-500" />
        <span className="ml-2">astra-system@display:~$</span>
      </div>
      {/* Lines */}
      <div className="flex-1 overflow-hidden p-6 relative">
        <div className="space-y-1.5">
          {lines.map((line, i) => (
            <p
              key={i}
              className="text-sm leading-relaxed"
              style={{ color: line.includes('OK') ? '#4ade80' : line.includes('%') ? '#facc15' : 'rgba(74,222,128,0.85)' }}
            >
              {line}
            </p>
          ))}
          <p className="text-sm" style={{ color: '#4ade80' }}>
            {cursor ? '_' : ' '}
          </p>
        </div>
        <div ref={endRef} />
      </div>
      <LogoWatermark />
    </div>
  )
}

function LoadingScreen() {
  const [progress, setProgress] = useState(0)
  const [phase, setPhase] = useState(0)

  const PHASES = [
    'Iniciando hardware...',
    'Cargando sistema operativo...',
    'Montando sistema de archivos...',
    'Iniciando servicios de red...',
    'Cargando motor de anuncios...',
    'Sincronizando contenido...',
    'Sistema listo',
  ]

  useEffect(() => {
    let p = 0
    const interval = setInterval(() => {
      p += Math.random() * 3
      if (p >= 100) {
        p = 100
        clearInterval(interval)
        // Restart after a pause
        setTimeout(() => { setProgress(0); setPhase(0) }, 2000)
      }
      setProgress(p)
      setPhase(Math.floor((p / 100) * (PHASES.length - 1)))
    }, 80)
    return () => clearInterval(interval)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [progress === 0])

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center gap-10 font-mono" style={{ background: '#0a0f1a' }}>
      {/* Logo */}
      <div className="relative w-32 h-32">
        <Image src="/logo.png" alt="Astra Center" fill className="object-contain" />
      </div>

      <div className="flex flex-col items-center gap-4 w-80">
        <p className="text-xl font-bold tracking-widest uppercase" style={{ color: '#60a5fa' }}>
          Astra Center
        </p>
        <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
          {PHASES[phase]}
        </p>

        {/* Progress bar */}
        <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.1)' }}>
          <div
            className="h-full rounded-full transition-all duration-100"
            style={{
              width: `${progress}%`,
              background: 'linear-gradient(to right, #1d4ed8, #60a5fa)',
            }}
          />
        </div>
        <p className="text-xs tabular-nums" style={{ color: 'rgba(255,255,255,0.3)' }}>
          {Math.floor(progress)}%
        </p>
      </div>

      <div className="flex gap-1.5">
        {[0, 1, 2, 3, 4].map(i => (
          <div
            key={i}
            className="w-1.5 h-1.5 rounded-full"
            style={{
              background: '#60a5fa',
              opacity: (progress / 100) > i / 5 ? 1 : 0.2,
              transition: 'opacity 0.3s',
            }}
          />
        ))}
      </div>
    </div>
  )
}

// ─── Shared helpers ───────────────────────────────────────────────────────────

function PulsingDots({ color }: { color: string }) {
  return (
    <div className="flex gap-1.5">
      {[0, 1, 2].map(i => (
        <div
          key={i}
          className="w-2 h-2 rounded-full animate-bounce"
          style={{ background: color, animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </div>
  )
}

function LogoWatermark() {
  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 opacity-20">
      <Image src="/logo.png" alt="Astra Center" width={20} height={20} className="object-contain brightness-0 invert" style={{ width: 'auto', height: 20 }} />
      <span className="text-xs font-mono text-white tracking-widest uppercase">Astra Center</span>
    </div>
  )
}

// ─── Main display page ────────────────────────────────────────────────────────

export default function DisplayPage() {
  const [ads, setAds] = useState<Ad[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [fading, setFading] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const [blockingScreen, setBlockingScreen] = useState<BlockingScreen>('none')
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const blockPollRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const etagRef = useRef<string | null>(null)

  const fetchAds = useCallback(async (forceRefresh = false) => {
    try {
      const headers: HeadersInit = {}
      if (etagRef.current && !forceRefresh) {
        headers['If-None-Match'] = etagRef.current
      }
      const res = await fetch('/api/ads', { headers, cache: 'no-store' })

      if (res.status === 304) return

      const newEtag = res.headers.get('etag')
      if (newEtag) etagRef.current = newEtag

      const data: Ad[] = await res.json()
      const active = data.filter((a: Ad) => a.active)

      setAds(prev => {
        if (JSON.stringify(prev) === JSON.stringify(active)) return prev
        return active
      })
    } catch {
      // silent
    } finally {
      setLoaded(true)
    }
  }, [])

  const fetchBlockingScreen = useCallback(async () => {
    try {
      const res = await fetch('/api/blocking-screen', { cache: 'no-store' })
      const data = await res.json()
      if (data.screen) setBlockingScreen(data.screen)
    } catch {
      // silent
    }
  }, [])

  useEffect(() => {
    fetchAds(true)
    fetchBlockingScreen()
  }, [fetchAds, fetchBlockingScreen])

  useEffect(() => {
    pollRef.current = setInterval(() => fetchAds(), 10_000)
    return () => { if (pollRef.current) clearInterval(pollRef.current) }
  }, [fetchAds])

  useEffect(() => {
    blockPollRef.current = setInterval(() => fetchBlockingScreen(), 5_000)
    return () => { if (blockPollRef.current) clearInterval(blockPollRef.current) }
  }, [fetchBlockingScreen])

  useEffect(() => {
    if (ads.length > 0 && currentIndex >= ads.length) {
      setCurrentIndex(0)
    }
  }, [ads.length, currentIndex])

  const advance = useCallback((shownAd?: Ad) => {
    if (shownAd?.flash) {
      fetch(`/api/flash/${shownAd.id}`, { method: 'DELETE' }).catch(() => {})
    }
    if (ads.length <= 1) return
    setFading(true)
    setTimeout(() => {
      setCurrentIndex(prev => (prev + 1) % ads.length)
      setFading(false)
    }, 500)
  }, [ads])

  useEffect(() => {
    if (ads.length === 0) return
    const current = ads[currentIndex]
    const dur = (current?.duration ?? 8) * 1000
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => advance(current), dur)
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [currentIndex, ads, advance])

  // ── Blocking screen takes full priority ────────────────────────────────────
  if (blockingScreen === 'maintenance') return <MaintenanceScreen />
  if (blockingScreen === 'outage') return <OutageScreen />
  if (blockingScreen === 'terminal') return <TerminalScreen />
  if (blockingScreen === 'loading') return <LoadingScreen />

  // ── Normal ad display ──────────────────────────────────────────────────────
  if (!loaded) {
    return (
      <div className="fixed inset-0 flex items-center justify-center" style={{ background: '#0a0f1a' }}>
        <div className="relative animate-pulse opacity-60" style={{ width: '50vw', height: '50vh' }}>
          <Image src="/logo.png" alt="Astra Center" fill className="object-contain" priority />
        </div>
      </div>
    )
  }

  if (ads.length === 0) {
    return (
      <div className="fixed inset-0 flex items-center justify-center" style={{ background: '#0a0f1a' }}>
        <div className="relative" style={{ width: '70vw', height: '70vh' }}>
          <Image src="/logo.png" alt="Astra Center" fill className="object-contain" priority />
        </div>
      </div>
    )
  }

  const ad = ads[currentIndex]

  const goTo = (i: number) => {
    if (i === currentIndex) return
    if (timerRef.current) clearTimeout(timerRef.current)
    setFading(true)
    setTimeout(() => {
      setCurrentIndex(i)
      setFading(false)
    }, 500)
  }

  return (
    <div className="fixed inset-0 bg-black overflow-hidden">
      <div
        className="absolute inset-0 transition-opacity duration-500"
        style={{ opacity: fading ? 0 : 1 }}
      >
        <SlideContent ad={ad} />
      </div>

      <div
        className="absolute bottom-0 left-0 right-0 h-16 flex items-end pb-4 px-6"
        style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.85), transparent)' }}
      >
        <div className="flex items-center gap-4 w-full">
          <Image
            src="/logo.png"
            alt="Astra Center"
            width={36}
            height={36}
            className="object-contain opacity-70 brightness-0 invert"
            style={{ width: 'auto', height: 36 }}
          />
          <span className="flex-1 text-white/80 text-sm font-medium tracking-wide truncate flex items-center gap-2">
            {ad.flash && (
              <span className="text-xs font-bold px-2 py-0.5 rounded-full uppercase tracking-widest" style={{ background: '#ef4444', color: '#fff' }}>
                Flash
              </span>
            )}
            {ad.title}
          </span>
          <div className="flex items-center gap-1.5">
            {ads.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                className="rounded-full transition-all duration-300"
                style={{
                  width: i === currentIndex ? 24 : 8,
                  height: 8,
                  background: i === currentIndex ? 'var(--brand-orange, #f59e0b)' : 'rgba(255,255,255,0.3)',
                }}
                aria-label={`Ir al anuncio ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function SlideContent({ ad }: { ad: Ad }) {
  if (ad.type === 'image') {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={ad.content} alt={ad.title} className="w-full h-full object-contain bg-black" />
    )
  }

  if (ad.type === 'video') {
    return (
      <video
        key={ad.content}
        src={ad.content}
        className="w-full h-full object-contain bg-black"
        autoPlay
        muted
        loop
        playsInline
      />
    )
  }

  return (
    <iframe
      src={ad.content}
      title={ad.title}
      className="w-full h-full border-0"
      allow="autoplay; fullscreen; encrypted-media"
    />
  )
}
