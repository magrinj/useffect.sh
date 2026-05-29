'use client'

import type { HandLandmarkerResult } from '@mediapipe/tasks-vision'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Carousel, type CarouselItem } from './carousel'
import { useHandTracking } from './use-hand-tracking'

const TEAM: CarouselItem[] = [
  {
    id: '001',
    name: 'David Leuliette',
    role: 'Native Engineer',
    image: '/david.png',
  },
  {
    id: '002',
    name: 'Pablo Giraud-Carrier',
    role: 'Architect',
    image: '/pablo.png',
  },
  {
    id: '003',
    name: 'Matthys Ducrocq',
    role: 'Native Engineer',
    image: '/matthys.png',
  },
  { id: '004', name: 'Subject Delta', role: 'Strategist' },
  { id: '005', name: 'Subject Echo', role: 'Designer' },
  { id: '006', name: 'Subject Foxtrot', role: 'Analyst' },
  { id: '007', name: 'Subject Golf', role: 'Operator' },
  { id: '008', name: 'Subject Hotel', role: 'Cryptographer' },
  { id: '009', name: 'Subject India', role: 'Sensor Lead' },
  { id: '010', name: 'Subject Juliet', role: 'Signal Hunter' },
  { id: '011', name: 'Subject Kilo', role: 'Field Medic' },
  { id: '012', name: 'Subject Lima', role: 'Handler' },
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

// Centered rectangle (normalized 0..1) where the hand is allowed to drive the
// carousel. Horizontal margins shrink to 0 below COMPACT_VIEWPORT_PX.
const HITBOX_TOP = 0.15
const HITBOX_BOTTOM = 0.7
const HITBOX_MARGIN_X = 0.15
const COMPACT_VIEWPORT_PX = 1024

// How much normalized hand-x movement equals one carousel step.
// 0.25 of the frame width = 1 item → SCALE = 4.
const HAND_SCALE = 4

// Fraction of an item the user must drag past to commit when released slowly.
const BREAKPOINT = 0.32

// Window used to compute release velocity from recent samples.
const VELOCITY_WINDOW_MS = 120

// Inertia decay rate (1/s) — higher means a faster stop.
const FRICTION = 3
// Below this velocity (items/s) we switch from inertia to the snap spring.
const SNAP_VELOCITY = 1.3
// Underdamped spring for snapping to the nearest integer slot.
const SPRING_STIFFNESS = 180
const SPRING_DAMPING = 24

// Minimum bounding-box diagonal (normalized 0..1) for a hand to count — keeps
// the carousel from reacting to background hands or distant people.
const MIN_HAND_SIZE = 0.22

type Landmark = { x: number; y: number; z?: number }

function pickHand(landmarks: Landmark[][] | undefined): Landmark[] | null {
  if (!landmarks || landmarks.length === 0) return null
  let best: { hand: Landmark[]; size: number } | null = null
  for (const hand of landmarks) {
    let minX = 1
    let maxX = 0
    let minY = 1
    let maxY = 0
    for (const p of hand) {
      if (p.x < minX) minX = p.x
      if (p.x > maxX) maxX = p.x
      if (p.y < minY) minY = p.y
      if (p.y > maxY) maxY = p.y
    }
    const size = Math.hypot(maxX - minX, maxY - minY)
    if (!best || size > best.size) best = { hand, size }
  }
  return best && best.size >= MIN_HAND_SIZE ? best.hand : null
}

type Mode = 'idle' | 'tracking' | 'inertia' | 'snap'
type Sample = { x: number; t: number }
type Engine = {
  mode: Mode
  position: number
  velocity: number
  anchor: { handX: number; position: number }
  samples: Sample[]
  snapTarget: number
}
type Hitbox = { left: number; right: number; top: number; bottom: number }

function computeHitbox(viewportWidth: number): Hitbox {
  const margin = viewportWidth < COMPACT_VIEWPORT_PX ? 0 : HITBOX_MARGIN_X
  return {
    left: margin,
    right: 1 - margin,
    top: HITBOX_TOP,
    bottom: HITBOX_BOTTOM,
  }
}

const ITEM_COUNT = TEAM.length
const modIndex = (p: number) =>
  ((Math.round(p) % ITEM_COUNT) + ITEM_COUNT) % ITEM_COUNT

export default function CinemaPage() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const engineRef = useRef<Engine>({
    mode: 'idle',
    position: 0,
    velocity: 0,
    anchor: { handX: 0, position: 0 },
    samples: [],
    snapTarget: 0,
  })

  const hitboxRef = useRef<Hitbox>(
    computeHitbox(typeof window === 'undefined' ? 1280 : window.innerWidth),
  )

  const [position, setPosition] = useState(0)

  useEffect(() => {
    const update = () => {
      hitboxRef.current = computeHitbox(window.innerWidth)
    }
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  // Animation loop drives inertia + spring snap. Tracking updates come from
  // handleResult and bypass this loop (they happen at the hand-tracking rate).
  useEffect(() => {
    let raf = 0
    let last = performance.now()
    const tick = (now: number) => {
      raf = requestAnimationFrame(tick)
      const dt = Math.min(0.04, (now - last) / 1000)
      last = now
      const s = engineRef.current

      if (s.mode === 'inertia') {
        s.position += s.velocity * dt
        s.velocity *= Math.exp(-FRICTION * dt)
        if (Math.abs(s.velocity) < SNAP_VELOCITY) {
          s.snapTarget = Math.round(s.position)
          s.mode = 'snap'
        }
        setPosition(s.position)
        return
      }

      if (s.mode === 'snap') {
        const acc =
          -SPRING_STIFFNESS * (s.position - s.snapTarget) -
          SPRING_DAMPING * s.velocity
        s.velocity += acc * dt
        s.position += s.velocity * dt
        if (
          Math.abs(s.position - s.snapTarget) < 0.0015 &&
          Math.abs(s.velocity) < 0.04
        ) {
          // Wrap once at rest to keep numbers bounded over many revolutions.
          // Visually identical because the carousel transform is mod 360°.
          const wrapped =
            ((s.snapTarget % ITEM_COUNT) + ITEM_COUNT) % ITEM_COUNT
          s.position = wrapped
          s.snapTarget = wrapped
          s.velocity = 0
          s.mode = 'idle'
        }
        setPosition(s.position)
      }
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

  const handleResult = useCallback((result: HandLandmarkerResult) => {
    const s = engineRef.current
    const hbox = hitboxRef.current
    const hand = pickHand(result.landmarks)
    drawOverlay(canvasRef.current, hand, hbox)

    if (!hand) {
      if (s.mode === 'tracking') releaseTracking(s)
      return
    }

    const tip = hand[8]
    if (!tip) return

    // Video is mirrored: hand-right movement should move the carousel forward.
    const handX = 1 - tip.x
    const handY = tip.y
    const inside =
      handY >= hbox.top &&
      handY <= hbox.bottom &&
      handX >= hbox.left &&
      handX <= hbox.right

    if (!inside) {
      if (s.mode === 'tracking') releaseTracking(s)
      return
    }

    const now = performance.now()
    if (s.mode !== 'tracking') {
      s.mode = 'tracking'
      s.velocity = 0
      s.anchor = { handX, position: s.position }
      s.samples = [{ x: handX, t: now }]
      return
    }

    s.samples.push({ x: handX, t: now })
    s.samples = s.samples.filter((p) => now - p.t <= VELOCITY_WINDOW_MS)

    const next = s.anchor.position - (handX - s.anchor.handX) * HAND_SCALE
    s.position = next
    setPosition(next)
  }, [])

  const { status, error } = useHandTracking(videoRef, handleResult)

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
          {String(modIndex(position) + 1).padStart(2, '0')} /{' '}
          {String(TEAM.length).padStart(2, '0')}
        </span>
      </header>

      <Carousel items={TEAM} position={position} />

      <footer className="absolute inset-x-0 bottom-0 z-10 flex flex-col items-center gap-2 pb-10 font-mono text-[11px] uppercase tracking-[0.25em] text-cyan-300/60">
        <p>swipe through the cyan band to scrub</p>
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

function releaseTracking(s: Engine) {
  let velocity = 0
  if (s.samples.length >= 2) {
    const first = s.samples[0]
    const last = s.samples[s.samples.length - 1]
    if (first && last) {
      const dt = (last.t - first.t) / 1000
      if (dt > 0) {
        velocity = -((last.x - first.x) * HAND_SCALE) / dt
      }
    }
  }
  s.samples = []

  if (Math.abs(velocity) > SNAP_VELOCITY) {
    s.mode = 'inertia'
    s.velocity = velocity
    return
  }

  // Slow release: use the breakpoint to commit forward or snap back.
  const delta = s.position - s.anchor.position
  const base = Math.round(s.anchor.position)
  s.snapTarget = Math.abs(delta) >= BREAKPOINT ? base + Math.sign(delta) : base
  s.velocity = velocity
  s.mode = 'snap'
}

function drawOverlay(
  canvas: HTMLCanvasElement | null,
  hand: Landmark[] | null,
  hbox: Hitbox,
) {
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  const w = canvas.width
  const h = canvas.height
  ctx.clearRect(0, 0, w, h)

  // Highlight the hitbox when the picked hand's fingertip is inside it.
  let active = false
  if (hand) {
    const tip = hand[8]
    if (tip) {
      const mirroredX = 1 - tip.x
      active =
        tip.y >= hbox.top &&
        tip.y <= hbox.bottom &&
        mirroredX >= hbox.left &&
        mirroredX <= hbox.right
    }
  }

  // Hitbox is symmetric around the horizontal center, so raw and mirrored x
  // coincide — we can draw directly with hbox.left/right.
  const x1 = hbox.left * w
  const x2 = hbox.right * w
  const y1 = hbox.top * h
  const y2 = hbox.bottom * h
  ctx.fillStyle = active
    ? 'rgba(34, 211, 238, 0.10)'
    : 'rgba(34, 211, 238, 0.04)'
  ctx.fillRect(x1, y1, x2 - x1, y2 - y1)

  ctx.save()
  ctx.strokeStyle = active
    ? 'rgba(34, 211, 238, 0.9)'
    : 'rgba(34, 211, 238, 0.35)'
  ctx.lineWidth = active ? 3 : 2
  ctx.setLineDash([14, 10])
  ctx.strokeRect(x1, y1, x2 - x1, y2 - y1)
  ctx.restore()

  if (!hand) return

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
