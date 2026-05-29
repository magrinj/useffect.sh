'use client'

import type { HandLandmarkerResult } from '@mediapipe/tasks-vision'
import { useCallback, useEffect, useRef, useState } from 'react'
import { members } from '../data'
import { useHandTracking } from '../hooks/use-hand-tracking.client'
import { Carousel, type CarouselItem } from './carousel.client'

const HITBOX_TOP = 0.15
const HITBOX_BOTTOM = 0.7
const HITBOX_MARGIN_X = 0.15
const COMPACT_VIEWPORT_PX = 1024
const HAND_SCALE = 4
const BREAKPOINT = 0.32
const VELOCITY_WINDOW_MS = 120
const FRICTION = 3
const SNAP_VELOCITY = 1.3
const SPRING_STIFFNESS = 180
const SPRING_DAMPING = 24
const MIN_HAND_SIZE = 0.22
const WHEEL_BOOST = 2.5
const WHEEL_RELEASE_MS = 140

const HAND_CONNECTIONS: ReadonlyArray<readonly [number, number]> = [
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
] as const

const TEAM: CarouselItem[] = members.map((m) => ({
  id: m.id,
  name: m.name,
  role: m.role,
  image: m.image,
}))

const ITEM_COUNT = TEAM.length
const modIndex = (p: number) =>
  ((Math.round(p) % ITEM_COUNT) + ITEM_COUNT) % ITEM_COUNT

type Landmark = { x: number; y: number; z?: number }
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

function startTracking(s: Engine, x: number, now: number) {
  s.mode = 'tracking'
  s.velocity = 0
  s.anchor = { handX: x, position: s.position }
  s.samples = [{ x, t: now }]
}

function updateTracking(s: Engine, x: number, now: number) {
  s.samples.push({ x, t: now })
  s.samples = s.samples.filter((p) => now - p.t <= VELOCITY_WINDOW_MS)
  s.position = s.anchor.position - (x - s.anchor.handX) * HAND_SCALE
}

function releaseTracking(s: Engine) {
  let velocity = 0
  if (s.samples.length >= 2) {
    const first = s.samples[0]
    const last = s.samples[s.samples.length - 1]
    if (first && last) {
      const dt = (last.t - first.t) / 1000
      if (dt > 0) velocity = -((last.x - first.x) * HAND_SCALE) / dt
    }
  }
  s.samples = []
  if (Math.abs(velocity) > SNAP_VELOCITY) {
    s.mode = 'inertia'
    s.velocity = velocity
    return
  }
  const delta = s.position - s.anchor.position
  const base = Math.round(s.anchor.position)
  s.snapTarget = Math.abs(delta) >= BREAKPOINT ? base + Math.sign(delta) : base
  s.velocity = velocity
  s.mode = 'snap'
}

function computeHitbox(viewportWidth: number): Hitbox {
  const margin = viewportWidth < COMPACT_VIEWPORT_PX ? 0 : HITBOX_MARGIN_X
  return {
    left: margin,
    right: 1 - margin,
    top: HITBOX_TOP,
    bottom: HITBOX_BOTTOM,
  }
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

  const x1 = hbox.left * w
  const x2 = hbox.right * w
  const y1 = hbox.top * h
  const y2 = hbox.bottom * h
  ctx.fillStyle = active ? 'rgba(0, 200, 83, 0.10)' : 'rgba(0, 200, 83, 0.04)'
  ctx.fillRect(x1, y1, x2 - x1, y2 - y1)

  ctx.save()
  ctx.strokeStyle = active ? 'rgba(0, 200, 83, 0.9)' : 'rgba(0, 200, 83, 0.35)'
  ctx.lineWidth = active ? 3 : 2
  ctx.setLineDash([14, 10])
  ctx.strokeRect(x1, y1, x2 - x1, y2 - y1)
  ctx.restore()

  if (!hand) return

  ctx.strokeStyle = 'rgba(0, 200, 83, 0.85)'
  ctx.lineWidth = 3
  ctx.shadowColor = 'rgba(0, 200, 83, 0.9)'
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

  ctx.fillStyle = 'rgba(178, 255, 204, 0.95)'
  for (const p of hand) {
    ctx.beginPath()
    ctx.arc(p.x * w, p.y * h, 4, 0, Math.PI * 2)
    ctx.fill()
  }

  const tip = hand[8]
  if (tip) {
    ctx.beginPath()
    ctx.arc(tip.x * w, tip.y * h, 14, 0, Math.PI * 2)
    ctx.strokeStyle = 'rgba(0, 200, 83, 1)'
    ctx.lineWidth = 2
    ctx.stroke()
  }

  ctx.shadowBlur = 0
}

type CameraMode =
  | 'wheel-touch'
  | 'camera-loading'
  | 'camera-active'
  | 'camera-denied'

export function TeamCarousel() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
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
  const [cameraMode, setCameraMode] = useState<CameraMode>('wheel-touch')

  useEffect(() => {
    const update = () => {
      hitboxRef.current = computeHitbox(window.innerWidth)
    }
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    let touchActive = false
    let wheelVirtualX = 0
    let wheelTimer: number | null = null

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length !== 1) return
      const t = e.touches[0]
      if (!t) return
      startTracking(
        engineRef.current,
        t.clientX / window.innerWidth,
        performance.now(),
      )
      setPosition(engineRef.current.position)
      touchActive = true
    }
    const onTouchMove = (e: TouchEvent) => {
      if (!touchActive || e.touches.length !== 1) return
      const t = e.touches[0]
      if (!t) return
      updateTracking(
        engineRef.current,
        t.clientX / window.innerWidth,
        performance.now(),
      )
      setPosition(engineRef.current.position)
      e.preventDefault()
    }
    const onTouchEnd = () => {
      if (!touchActive) return
      touchActive = false
      if (engineRef.current.mode === 'tracking')
        releaseTracking(engineRef.current)
    }
    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      const s = engineRef.current
      const now = performance.now()
      const delta =
        Math.abs(e.deltaX) >= Math.abs(e.deltaY) ? e.deltaX : e.deltaY
      if (s.mode !== 'tracking') {
        wheelVirtualX = 0
        startTracking(s, 0, now)
      }
      wheelVirtualX -= (delta * WHEEL_BOOST) / window.innerWidth
      updateTracking(s, wheelVirtualX, now)
      setPosition(s.position)
      if (wheelTimer !== null) clearTimeout(wheelTimer)
      wheelTimer = window.setTimeout(() => {
        if (engineRef.current.mode === 'tracking')
          releaseTracking(engineRef.current)
        wheelTimer = null
      }, WHEEL_RELEASE_MS)
    }

    el.addEventListener('touchstart', onTouchStart, { passive: true })
    el.addEventListener('touchmove', onTouchMove, { passive: false })
    el.addEventListener('touchend', onTouchEnd)
    el.addEventListener('touchcancel', onTouchEnd)
    el.addEventListener('wheel', onWheel, { passive: false })

    return () => {
      el.removeEventListener('touchstart', onTouchStart)
      el.removeEventListener('touchmove', onTouchMove)
      el.removeEventListener('touchend', onTouchEnd)
      el.removeEventListener('touchcancel', onTouchEnd)
      el.removeEventListener('wheel', onWheel)
      if (wheelTimer !== null) clearTimeout(wheelTimer)
    }
  }, [])

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
    const hand = pickHand(result.landmarks as Landmark[][])
    drawOverlay(canvasRef.current, hand, hbox)

    if (!hand) {
      if (s.mode === 'tracking') releaseTracking(s)
      return
    }
    const tip = hand[8]
    if (!tip) return

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
    if (s.mode !== 'tracking') startTracking(s, handX, now)
    else updateTracking(s, handX, now)
    setPosition(s.position)
  }, [])

  const handleCameraStatus = useCallback((s: 'loading' | 'ready' | 'error') => {
    if (s === 'ready') setCameraMode('camera-active')
    if (s === 'error') setCameraMode('camera-denied')
  }, [])

  const activeIndex = modIndex(position)
  const activeItem = TEAM[activeIndex]

  return (
    <div
      ref={containerRef}
      className="relative aspect-[16/10] max-h-[80vh] min-h-[500px] w-full touch-none overflow-hidden border border-dark-line bg-dark"
    >
      {cameraMode !== 'wheel-touch' && (
        <CameraLayer
          videoRef={videoRef}
          canvasRef={canvasRef}
          onResult={handleResult}
          onStatus={handleCameraStatus}
        />
      )}

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-dark-2/40 via-transparent to-dark/80" />

      <header className="absolute inset-x-0 top-0 z-10 flex items-center justify-between px-6 py-5 font-mono text-[11px] uppercase tracking-[0.3em] text-accent/70">
        <span>useffect.sh / dependencies</span>
        <span>{statusLabel(cameraMode)}</span>
        <span>
          {String(activeIndex + 1).padStart(2, '0')} /{' '}
          {String(TEAM.length).padStart(2, '0')}
        </span>
      </header>

      <Carousel items={TEAM} position={position} />

      <footer className="absolute inset-x-0 bottom-0 z-10 flex flex-col items-center gap-3 pb-6 font-mono text-[11px] uppercase tracking-[0.25em] text-dark-muted">
        {activeItem && (
          <p className="text-bg">
            <span className="text-accent">▸</span> {activeItem.name}{' '}
            <span className="text-dark-muted">— {activeItem.role}</span>
          </p>
        )}
        {cameraMode === 'wheel-touch' && (
          <button
            type="button"
            onClick={() => setCameraMode('camera-loading')}
            className="border border-accent/60 px-4 py-2 text-accent transition-colors hover:border-accent hover:bg-accent hover:text-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            Enable camera
          </button>
        )}
        {cameraMode === 'camera-denied' && (
          <p className="text-warn">camera blocked — wheel & swipe still work</p>
        )}
        <p>swipe or scroll to scrub</p>
      </footer>
    </div>
  )
}

function statusLabel(mode: CameraMode) {
  if (mode === 'wheel-touch') return 'standby'
  if (mode === 'camera-loading') return 'booting precog...'
  if (mode === 'camera-active') return 'tracking active'
  return 'sensor offline'
}

function CameraLayer({
  videoRef,
  canvasRef,
  onResult,
  onStatus,
}: {
  videoRef: React.RefObject<HTMLVideoElement | null>
  canvasRef: React.RefObject<HTMLCanvasElement | null>
  onResult: (r: HandLandmarkerResult) => void
  onStatus: (s: 'loading' | 'ready' | 'error') => void
}) {
  const { status } = useHandTracking(videoRef, onResult)

  useEffect(() => {
    if (status === 'loading') onStatus('loading')
    else if (status === 'ready') onStatus('ready')
    else if (status === 'error') onStatus('error')
  }, [status, onStatus])

  return (
    <>
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
    </>
  )
}
