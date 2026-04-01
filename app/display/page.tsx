'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Image from 'next/image'
import type { Ad } from '@/lib/db'

export default function DisplayPage() {
  const [ads, setAds] = useState<Ad[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [fading, setFading] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const etagRef = useRef<string | null>(null)

  const fetchAds = useCallback(async (forceRefresh = false) => {
    try {
      const headers: HeadersInit = {}
      if (etagRef.current && !forceRefresh) {
        headers['If-None-Match'] = etagRef.current
      }
      const res = await fetch('/api/ads', { headers, cache: 'no-store' })

      if (res.status === 304) return // nothing changed

      const newEtag = res.headers.get('etag')
      if (newEtag) etagRef.current = newEtag

      const data: Ad[] = await res.json()
      const active = data.filter((a: Ad) => a.active)

      setAds(prev => {
        if (JSON.stringify(prev) === JSON.stringify(active)) return prev
        return active
      })
    } catch {
      // silent — keep showing current ads
    } finally {
      setLoaded(true)
    }
  }, [])

  useEffect(() => {
    fetchAds(true)
  }, [fetchAds])

  useEffect(() => {
    pollRef.current = setInterval(() => fetchAds(), 10_000)
    return () => {
      if (pollRef.current) clearInterval(pollRef.current)
    }
  }, [fetchAds])

  // Reset index when ads list changes
  useEffect(() => {
    if (ads.length > 0 && currentIndex >= ads.length) {
      setCurrentIndex(0)
    }
  }, [ads.length, currentIndex])

  // Auto-advance + handle flash deletion
  const advance = useCallback((shownAd?: Ad) => {
    if (shownAd?.flash) {
      // Fire-and-forget: delete the flash ad after it has been shown
      fetch(`/api/flash/${shownAd.id}`, { method: 'DELETE' }).catch(() => {})
    }
    if (ads.length <= 1) {
      // If the only ad was a flash, list will update on next poll
      return
    }
    setFading(true)
    setTimeout(() => {
      setCurrentIndex(prev => {
        const next = (prev + 1) % ads.length
        return next
      })
      setFading(false)
    }, 500)
  }, [ads])

  useEffect(() => {
    if (ads.length === 0) return
    const current = ads[currentIndex]
    const dur = (current?.duration ?? 8) * 1000
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => advance(current), dur)
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [currentIndex, ads, advance])

  if (!loaded) {
    return (
      <div className="fixed inset-0 flex items-center justify-center" style={{ background: '#0a0f1a' }}>
        <div className="relative animate-pulse opacity-60" style={{ width: '50vw', height: '50vh' }}>
          <Image
            src="/logo.png"
            alt="Astra Center"
            fill
            className="object-contain"
            priority
          />
        </div>
      </div>
    )
  }

  if (ads.length === 0) {
    return (
      <div className="fixed inset-0 flex items-center justify-center" style={{ background: '#0a0f1a' }}>
        <div className="relative" style={{ width: '70vw', height: '70vh' }}>
          <Image
            src="/logo.png"
            alt="Astra Center"
            fill
            className="object-contain"
            priority
          />
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
      {/* Slide content */}
      <div
        className="absolute inset-0 transition-opacity duration-500"
        style={{ opacity: fading ? 0 : 1 }}
      >
        <SlideContent ad={ad} />
      </div>

      {/* Bottom overlay bar */}
      <div className="absolute bottom-0 left-0 right-0 h-16 flex items-end pb-4 px-6"
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
              <span
                className="text-xs font-bold px-2 py-0.5 rounded-full uppercase tracking-widest"
                style={{ background: '#ef4444', color: '#fff' }}
              >
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
      <img
        src={ad.content}
        alt={ad.title}
        className="w-full h-full object-contain bg-black"
      />
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
