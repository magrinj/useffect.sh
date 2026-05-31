'use client'

import type { HandLandmarkerResult } from '@mediapipe/tasks-vision'
import { useCallback, useEffect, useRef, useState } from 'react'
import { members } from '../data'
import { useHandTracking } from '../hooks/use-hand-tracking.client'
import {
  Carousel,
  type CarouselHandle,
  type CarouselItem,
} from './carousel.client'

// Hitbox band, vertically centered on the camera frame.
const HITBOX_HEIGHT = 0.55
const HITBOX_TOP = (1 - HITBOX_HEIGHT) / 2
const HITBOX_BOTTOM = HITBOX_TOP + HITBOX_HEIGHT
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
const WHEEL_BOOST = 1.0
const WHEEL_RELEASE_MS = 140
// A wheel gesture only scrubs when it's clearly horizontal — deltaX must beat
// deltaY by this factor. Otherwise we leave it to scroll the page vertically.
const WHEEL_HORIZONTAL_RATIO = 1.2
// After manual touch/wheel input ends, keep hand-tracking locked out this long
// so it can't snatch the carousel mid-settle.
const MANUAL_LOCK_MS = 500

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

// Vertical space reserved for the header / footer overlays so cards never
// slide under the text. Mirrored as padding on the carousel ring.
const INSET_TOP = 72
const INSET_BOTTOM = 120
// Breathing room between a card edge and the reserved overlay zones.
const CARD_GAP = 24
// Source portraits are 2:3 (1024×1536) — keep that ratio when scaling.
const CARD_ASPECT = 2 / 3
const MAX_CARD_HEIGHT = 480
const MIN_CARD_HEIGHT = 180

type CardLayout = { cardWidth: number; cardHeight: number; radius: number }

// Must match the `perspective` on the Carousel ring.
const PERSPECTIVE = 1500
// For N=6 the minimum non-overlapping radius is the card width; 1.35× keeps
// a comfortable gap between adjacent portraits on the ring.
const RADIUS_FACTOR = 1.35

// Fit the front card inside the container minus the reserved overlay zones.
// The card sits at translateZ(radius), so perspective magnifies its rendered
// size — we size against that *rendered* box (not the layout box) so the
// magnified front card never spills into the header/footer text. Width follows
// the fixed 2:3 portrait ratio and is capped to a share of the container width
// so neighbouring ring cards stay on screen.
function computeCardLayout(width: number, height: number): CardLayout {
  const availH = height - INSET_TOP - INSET_BOTTOM - CARD_GAP * 2
  let cardHeight = Math.max(MIN_CARD_HEIGHT, Math.min(MAX_CARD_HEIGHT, availH))
  // Iterate: magnification depends on radius which depends on the card size.
  for (let i = 0; i < 4; i++) {
    const radius = cardHeight * CARD_ASPECT * RADIUS_FACTOR
    const mag = PERSPECTIVE / Math.max(1, PERSPECTIVE - radius)
    const fitByHeight = availH / mag
    const fitByWidth = (width * 0.5) / (CARD_ASPECT * mag)
    const fit = Math.min(fitByHeight, fitByWidth)
    cardHeight = Math.max(MIN_CARD_HEIGHT, Math.min(MAX_CARD_HEIGHT, fit))
  }
  const cardWidth = cardHeight * CARD_ASPECT
  const radius = cardWidth * RADIUS_FACTOR
  return { cardWidth, cardHeight, radius }
}

const VISIBLE_ENTER = 0.8
const VISIBLE_EXIT = 0.55
const VISIBILITY_THRESHOLDS = Array.from({ length: 21 }, (_, i) => i / 20)

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

type TrackingStatus = 'idle' | 'loading' | 'ready' | 'error'

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
  // Manual touch/wheel input takes priority: while a drag is held, or for a
  // short cooldown after one, hand-tracking is locked out so the two inputs
  // never fight over the carousel.
  const manualHoldRef = useRef(false)
  const manualUntilRef = useRef(0)

  // The scrub position lives in a ref and is pushed straight to the carousel's
  // imperative handle — it never goes through React state, so dragging at
  // 60fps doesn't re-render the card tree. Only the front-card index, used by
  // the header counter and footer label, is React state (flips ~6×/spin).
  const positionRef = useRef(0)
  const carouselRef = useRef<CarouselHandle>(null)
  const [activeIndex, setActiveIndex] = useState(0)

  const applyPosition = useCallback((p: number) => {
    positionRef.current = p
    carouselRef.current?.render(p)
    const idx = modIndex(p)
    setActiveIndex((prev) => (prev === idx ? prev : idx))
  }, [])

  // `cameraEnabled` mounts the CameraLayer once and keeps it mounted so the
  // landmarker survives; `visible` then pauses/resumes the stream as the
  // section scrolls in and out of view.
  const [cameraEnabled, setCameraEnabled] = useState(false)
  const [trackingStatus, setTrackingStatus] = useState<TrackingStatus>('idle')
  const [layout, setLayout] = useState<CardLayout>(() =>
    computeCardLayout(960, 600),
  )
  const [visible, setVisible] = useState(false)
  // Once the user blocks the camera we stop auto-requesting it on every
  // re-entry, otherwise scrolling past would spam the permission prompt.
  const deniedRef = useRef(false)

  useEffect(() => {
    const update = () => {
      hitboxRef.current = computeHitbox(window.innerWidth)
    }
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  // Track the container size so cards scale to fit instead of overflowing.
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const measure = () => {
      const rect = el.getBoundingClientRect()
      setLayout(computeCardLayout(rect.width, rect.height))
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  // Enable the camera once the carousel is ≥80% on screen, disable it again
  // when it scrolls mostly out of view (hysteresis avoids flapping).
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const obs = new IntersectionObserver(
      (entries) => {
        const ratio = entries[0]?.intersectionRatio ?? 0
        setVisible((prev) => {
          if (!prev && ratio >= VISIBLE_ENTER) return true
          if (prev && ratio < VISIBLE_EXIT) return false
          return prev
        })
      },
      { threshold: VISIBILITY_THRESHOLDS },
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  // First time it scrolls into view, mount the camera layer (unless blocked).
  // It then stays mounted; `visible` drives pause/resume from there.
  useEffect(() => {
    if (visible && !deniedRef.current) setCameraEnabled(true)
  }, [visible])

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
      applyPosition(engineRef.current.position)
      touchActive = true
      manualHoldRef.current = true
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
      applyPosition(engineRef.current.position)
      e.preventDefault()
    }
    const onTouchEnd = () => {
      if (!touchActive) return
      touchActive = false
      manualHoldRef.current = false
      manualUntilRef.current = performance.now() + MANUAL_LOCK_MS
      if (engineRef.current.mode === 'tracking')
        releaseTracking(engineRef.current)
    }
    const onWheel = (e: WheelEvent) => {
      // Only hijack clearly-horizontal gestures; let vertical wheel/trackpad
      // scroll the page so users can scroll past the section without snagging.
      if (Math.abs(e.deltaX) < Math.abs(e.deltaY) * WHEEL_HORIZONTAL_RATIO)
        return
      e.preventDefault()
      const s = engineRef.current
      const now = performance.now()
      manualUntilRef.current = now + MANUAL_LOCK_MS
      const delta = e.deltaX
      if (s.mode !== 'tracking') {
        wheelVirtualX = 0
        startTracking(s, 0, now)
      }
      wheelVirtualX -= (delta * WHEEL_BOOST) / window.innerWidth
      updateTracking(s, wheelVirtualX, now)
      applyPosition(s.position)
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
  }, [applyPosition])

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
        applyPosition(s.position)
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
        applyPosition(s.position)
      }
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [applyPosition])

  const handleResult = useCallback(
    (result: HandLandmarkerResult) => {
      const s = engineRef.current
      const hbox = hitboxRef.current
      const hand = pickHand(result.landmarks as Landmark[][])
      drawOverlay(canvasRef.current, hand, hbox)

      // Manual touch/wheel input wins: while it's held or still cooling down,
      // ignore the hand entirely so the gesture can't fight the scroll.
      if (manualHoldRef.current || performance.now() < manualUntilRef.current)
        return

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
      applyPosition(s.position)
    },
    [applyPosition],
  )

  const handleCameraStatus = useCallback((s: TrackingStatus) => {
    setTrackingStatus(s)
    if (s === 'error') {
      // Blocked/unavailable: unmount to free the landmarker and don't retry.
      deniedRef.current = true
      setCameraEnabled(false)
    }
  }, [])

  const activeItem = TEAM[activeIndex]

  return (
    <div
      ref={containerRef}
      className="relative aspect-[16/10] max-h-[80vh] min-h-[500px] w-full touch-none overflow-hidden border border-dark-line bg-dark"
    >
      {cameraEnabled && (
        <CameraLayer
          videoRef={videoRef}
          canvasRef={canvasRef}
          onResult={handleResult}
          onStatus={handleCameraStatus}
          active={visible}
        />
      )}

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-dark-2/40 via-transparent to-dark/80" />

      <header className="absolute inset-x-0 top-0 z-10 flex items-center justify-between px-6 py-5 font-mono text-[11px] uppercase tracking-[0.3em] text-accent/70">
        <span>useffect.sh / dependencies</span>
        <span>{statusLabel(cameraEnabled, trackingStatus)}</span>
        <span>
          {String(activeIndex + 1).padStart(2, '0')} /{' '}
          {String(TEAM.length).padStart(2, '0')}
        </span>
      </header>

      <Carousel
        ref={carouselRef}
        items={TEAM}
        activeIndex={activeIndex}
        cardWidth={layout.cardWidth}
        cardHeight={layout.cardHeight}
        radius={layout.radius}
        insetTop={INSET_TOP}
        insetBottom={INSET_BOTTOM}
      />

      <footer className="absolute inset-x-0 bottom-0 z-10 flex flex-col items-center gap-2 px-6 pb-6 text-center font-mono text-[11px] uppercase tracking-[0.25em] text-dark-muted">
        {activeItem && (
          <p className="text-bg">
            <span className="text-accent">▸</span> {activeItem.name}{' '}
            <span className="text-dark-muted">— {activeItem.role}</span>
          </p>
        )}
        {trackingStatus === 'error' && (
          <p className="text-warn">camera blocked — wheel & swipe still work</p>
        )}
        <p>swipe or scroll to scrub</p>
      </footer>
    </div>
  )
}

function statusLabel(enabled: boolean, status: TrackingStatus) {
  if (status === 'error') return 'sensor offline'
  if (!enabled) return 'standby'
  if (status === 'loading') return 'booting precog...'
  if (status === 'ready') return 'tracking active'
  return 'standby'
}

function CameraLayer({
  videoRef,
  canvasRef,
  onResult,
  onStatus,
  active,
}: {
  videoRef: React.RefObject<HTMLVideoElement | null>
  canvasRef: React.RefObject<HTMLCanvasElement | null>
  onResult: (r: HandLandmarkerResult) => void
  onStatus: (s: TrackingStatus) => void
  active: boolean
}) {
  const { status } = useHandTracking(videoRef, onResult, active)

  useEffect(() => {
    onStatus(status)
  }, [status, onStatus])

  return (
    <>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        onLoadedMetadata={() => {
          // Match the overlay canvas to the real stream size so the hitbox /
          // skeleton stay aligned even when iOS hands back a different aspect
          // (e.g. a portrait frame) than the 640×480 we request.
          const v = videoRef.current
          const c = canvasRef.current
          if (v?.videoWidth && c) {
            c.width = v.videoWidth
            c.height = v.videoHeight
          }
        }}
        // contain (not cover) on mobile: the carousel box is portrait there, so
        // cover cropped ~half the landscape frame off-screen — "too zoomed in",
        // and the visible area no longer matched the active gesture region.
        className="absolute inset-0 h-full w-full scale-x-[-1] object-contain opacity-20 lg:object-cover"
      />
      <canvas
        ref={canvasRef}
        width={640}
        height={480}
        className="absolute inset-0 h-full w-full scale-x-[-1] object-contain lg:object-cover"
      />
    </>
  )
}
