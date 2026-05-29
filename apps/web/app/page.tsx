'use client'

import type { HandLandmarkerResult } from '@mediapipe/tasks-vision'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Carousel, type CarouselItem } from './carousel'
import { useHandTracking } from './use-hand-tracking'

const TEAM: CarouselItem[] = [
  { id: '001', name: 'Subject Alpha', role: 'Precognitive' },
  { id: '002', name: 'Subject Bravo', role: 'Architect' },
  { id: '003', name: 'Subject Charlie', role: 'Native Engineer' },
  { id: '004', name: 'Subject Delta', role: 'Strategist' },
  { id: '005', name: 'Subject Echo', role: 'Designer' },
  { id: '006', name: 'Subject Foxtrot', role: 'Analyst' },
  { id: '007', name: 'Subject Golf', role: 'Operator' },
]

const HAND_CONNECTIONS: Array<[number, number]> = [
  [0, 1],
  [1, 2],
  [2, 3],
  [3, 4],
  [0, 5],
  [5, 6],
  [6, 7],
  [7, 8],
  [5, 9],
  [9, 10],
  [10, 11],
  [11, 12],
  [9, 13],
  [13, 14],
  [14, 15],
  [15, 16],
  [13, 17],
  [17, 18],
  [18, 19],
  [19, 20],
  [0, 17],
]

const SWIPE_THRESHOLD = 0.22 // normalized screen units (~22% width)
const SWIPE_WINDOW_MS = 400
const SWIPE_COOLDOWN_MS = 700

type Sample = { x: number; t: number }

export default function CinemaPage() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const samplesRef = useRef<Sample[]>([])
  const lastSwipeRef = useRef(0)

  const [index, setIndex] = useState(0)
  const [lastGesture, setLastGesture] = useState<'left' | 'right' | null>(null)

  const handleResult = useCallback((result: HandLandmarkerResult) => {
    drawOverlay(canvasRef.current, result)
    detectSwipe(result, samplesRef, lastSwipeRef, (dir) => {
      setLastGesture(dir)
      setIndex((i) => {
        if (dir === 'right') return Math.min(TEAM.length - 1, i + 1)
        return Math.max(0, i - 1)
      })
    })
  }, [])

  const { status, error } = useHandTracking(videoRef, handleResult)

  useEffect(() => {
    if (!lastGesture) return
    const t = setTimeout(() => setLastGesture(null), 600)
    return () => clearTimeout(t)
  }, [lastGesture])

  return (
    <main className="relative h-screen w-screen overflow-hidden bg-black text-cyan-100">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="absolute inset-0 h-full w-full scale-x-[-1] object-cover opacity-40"
      />
      <canvas
        ref={canvasRef}
        width={1280}
        height={720}
        className="absolute inset-0 h-full w-full scale-x-[-1] object-cover"
      />

      <div className="absolute inset-0 bg-gradient-to-b from-cyan-950/40 via-transparent to-black/80" />

      <header className="absolute inset-x-0 top-0 z-10 flex items-center justify-between px-8 py-6 font-mono text-xs uppercase tracking-[0.3em] text-cyan-300/70">
        <span>useffect.sh / precog</span>
        <span>{statusLabel(status)}</span>
        <span>
          {String(index + 1).padStart(2, '0')} /{' '}
          {String(TEAM.length).padStart(2, '0')}
        </span>
      </header>

      <Carousel items={TEAM} index={index} />

      <footer className="absolute inset-x-0 bottom-0 z-10 flex flex-col items-center gap-2 pb-10 font-mono text-[11px] uppercase tracking-[0.25em] text-cyan-300/60">
        <p>swipe your hand left or right to scrub</p>
        {lastGesture && (
          <p className="text-cyan-200">
            {lastGesture === 'right' ? '→ next' : '← prev'}
          </p>
        )}
        {error && <p className="text-red-400">{error}</p>}
      </footer>
    </main>
  )
}

function statusLabel(status: string) {
  if (status === 'loading') return 'booting precog...'
  if (status === 'ready') return 'tracking active'
  if (status === 'error') return 'sensor offline'
  return 'standby'
}

function detectSwipe(
  result: HandLandmarkerResult,
  samplesRef: React.RefObject<Sample[]>,
  lastSwipeRef: React.RefObject<number>,
  fire: (dir: 'left' | 'right') => void,
) {
  const hand = result.landmarks?.[0]
  if (!hand) {
    samplesRef.current = []
    return
  }
  const indexTip = hand[8]
  if (!indexTip) return

  const now = performance.now()
  // visualX: mirror the raw x so "right hand movement" maps to "right swipe" on screen
  const visualX = 1 - indexTip.x

  samplesRef.current.push({ x: visualX, t: now })
  samplesRef.current = samplesRef.current.filter(
    (s) => now - s.t <= SWIPE_WINDOW_MS,
  )

  if (now - lastSwipeRef.current < SWIPE_COOLDOWN_MS) return
  const samples = samplesRef.current
  if (samples.length < 4) return

  const first = samples[0]
  const last = samples[samples.length - 1]
  if (!first || !last) return
  const dx = last.x - first.x

  if (Math.abs(dx) >= SWIPE_THRESHOLD) {
    lastSwipeRef.current = now
    samplesRef.current = []
    fire(dx > 0 ? 'right' : 'left')
  }
}

function drawOverlay(
  canvas: HTMLCanvasElement | null,
  result: HandLandmarkerResult,
) {
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  const w = canvas.width
  const h = canvas.height
  ctx.clearRect(0, 0, w, h)

  if (!result.landmarks) return

  for (const hand of result.landmarks) {
    ctx.strokeStyle = 'rgba(34, 211, 238, 0.85)'
    ctx.lineWidth = 3
    ctx.shadowColor = 'rgba(34, 211, 238, 0.9)'
    ctx.shadowBlur = 8

    for (const [a, b] of HAND_CONNECTIONS) {
      const pa = hand[a]
      const pb = hand[b]
      if (!pa || !pb) continue
      ctx.beginPath()
      ctx.moveTo(pa.x * w, pa.y * h)
      ctx.lineTo(pb.x * w, pb.y * h)
      ctx.stroke()
    }

    ctx.fillStyle = 'rgba(165, 243, 252, 0.95)'
    for (const p of hand) {
      ctx.beginPath()
      ctx.arc(p.x * w, p.y * h, 4, 0, Math.PI * 2)
      ctx.fill()
    }

    const tip = hand[8]
    if (tip) {
      ctx.beginPath()
      ctx.arc(tip.x * w, tip.y * h, 14, 0, Math.PI * 2)
      ctx.strokeStyle = 'rgba(34, 211, 238, 1)'
      ctx.lineWidth = 2
      ctx.stroke()
    }

    ctx.shadowBlur = 0
  }
}
