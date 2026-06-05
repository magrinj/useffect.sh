'use client'

import type { HandLandmarkerResult } from '@mediapipe/tasks-vision'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { members } from '../data'
import { useHandTracking } from '../hooks/use-hand-tracking.client'
import { HeroCard } from './hero-card'

const TOUCH_IDLE_MS = 600
// Lowered from the carousel-era 0.18 — a closed fist's bounding box is much
// smaller than an open hand's spread fingers, and we need to keep tracking
// when the user makes a fist to grab a card.
const MIN_HAND_SIZE = 0.1
const SPOTLIGHT_RADIUS_PX = 280
// During an active grab, allow a short window where the hand may briefly
// disappear (MediaPipe re-locking after a rapid shape change) without
// releasing the card. Beyond this, treat the hand as actually gone.
const GRAB_HAND_LOST_GRACE_MS = 250
// Minimum pull scale to count a fist-open as a "deliberate yank" that
// should navigate to the held member's LinkedIn. Smaller releases are
// treated as an accidental grab + drop.
const GRAB_OPEN_LINKEDIN_THRESHOLD = 1.25

// Grab gesture tuning.
// FIST_FINGER_THRESHOLD: a finger counts as "curled" when its tip is no farther
// than this multiplier of its metacarpal-to-wrist distance. 1.1 = generous;
// users with slightly cupped hands still register.
const FIST_FINGER_THRESHOLD = 1.1
// FIST_REQUIRED_CURLED: how many of the four non-thumb fingers must be curled
// for the hand to count as a fist. 3/4 lets the thumb sit anywhere.
const FIST_REQUIRED_CURLED = 3
// Max scale a card reaches when the hand is pulled fully away from the camera.
const GRAB_MAX_SCALE = 1.55

// MediaPipe hand-landmark connection graph (21 landmarks). Order: thumb,
// index, middle, ring, pinky, then a wrist→pinky-MCP closer.
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
]

type Landmark = { x: number; y: number; z?: number }

// Hand bounding-box diagonal in normalized [0,1] space — proxy for how big
// the hand appears in the camera frame. Smaller = hand is further away.
function handBoxSize(hand: Landmark[]): number {
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
  return Math.hypot(maxX - minX, maxY - minY)
}

// Closed-fist detection: for each non-thumb finger, the tip should be roughly
// as close to the wrist as its metacarpal — when the finger curls inward the
// tip travels back toward the palm.
// Pairs of (fingertip index, metacarpal index) for the four non-thumb fingers.
const FINGER_TIP_MCP_PAIRS: ReadonlyArray<readonly [number, number]> = [
  [8, 5],
  [12, 9],
  [16, 13],
  [20, 17],
]

function isFistClosed(hand: Landmark[]): boolean {
  const wrist = hand[0]
  if (!wrist) return false
  let curled = 0
  for (const [tipIdx, mcpIdx] of FINGER_TIP_MCP_PAIRS) {
    const tip = hand[tipIdx]
    const mcp = hand[mcpIdx]
    if (!tip || !mcp) continue
    const tipDist = Math.hypot(tip.x - wrist.x, tip.y - wrist.y)
    const mcpDist = Math.hypot(mcp.x - wrist.x, mcp.y - wrist.y)
    if (tipDist < mcpDist * FIST_FINGER_THRESHOLD) curled++
  }
  return curled >= FIST_REQUIRED_CURLED
}

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

function drawHandOverlay(
  canvas: HTMLCanvasElement,
  hand: Landmark[] | null,
): void {
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  const dpr = window.devicePixelRatio || 1
  const w = canvas.width / dpr
  const h = canvas.height / dpr
  ctx.clearRect(0, 0, w, h)
  if (!hand) return

  // Front-camera mirror: x → 1 - x so the skeleton tracks left/right the way
  // a user expects when looking at the screen.
  const toX = (lx: number) => (1 - lx) * w
  const toY = (ly: number) => ly * h

  ctx.strokeStyle = 'rgba(0, 200, 83, 0.75)'
  ctx.lineWidth = 2
  ctx.lineCap = 'round'
  ctx.beginPath()
  for (const [a, b] of HAND_CONNECTIONS) {
    const pa = hand[a]
    const pb = hand[b]
    if (!pa || !pb) continue
    ctx.moveTo(toX(pa.x), toY(pa.y))
    ctx.lineTo(toX(pb.x), toY(pb.y))
  }
  ctx.stroke()

  ctx.fillStyle = 'rgba(0, 200, 83, 0.95)'
  for (const p of hand) {
    ctx.beginPath()
    ctx.arc(toX(p.x), toY(p.y), 3.5, 0, Math.PI * 2)
    ctx.fill()
  }

  // Emphasize the index-finger tip — the landmark we map to a card.
  const tip = hand[8]
  if (tip) {
    ctx.shadowColor = 'rgba(0, 200, 83, 0.85)'
    ctx.shadowBlur = 16
    ctx.fillStyle = 'rgba(0, 200, 83, 1)'
    ctx.beginPath()
    ctx.arc(toX(tip.x), toY(tip.y), 7, 0, Math.PI * 2)
    ctx.fill()
    ctx.shadowBlur = 0
  }
}

export function HeroGrid() {
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [cameraEnabled, setCameraEnabled] = useState(false)
  const [cursorPos, setCursorPos] = useState<{ x: number; y: number } | null>(
    null,
  )
  // Grab gesture state: which card is being held + how much the user has
  // pulled (scale ≥ 1).
  const [grabbedId, setGrabbedId] = useState<string | null>(null)
  const [grabScale, setGrabScale] = useState(1)

  const touchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const cardRectsRef = useRef<Map<string, DOMRect>>(new Map())
  // Refs that mirror state for read-access inside the 30fps camera callback —
  // avoids stale-closure issues without rebuilding handleResult on every state
  // change (which would tear down the camera RAF loop).
  const hoveredIdRef = useRef<string | null>(null)
  const grabbedIdRef = useRef<string | null>(null)
  const grabRefSizeRef = useRef(0)
  const lastHandSeenAtRef = useRef(0)
  // Live grab-scale value for the camera callback — used at release to decide
  // whether to open LinkedIn (only fire when the user actually pulled).
  const grabScaleRef = useRef(1)

  useEffect(() => {
    hoveredIdRef.current = hoveredId
  }, [hoveredId])
  useEffect(() => {
    grabbedIdRef.current = grabbedId
  }, [grabbedId])
  useEffect(() => {
    grabScaleRef.current = grabScale
  }, [grabScale])

  const clearTouchTimer = useCallback(() => {
    if (touchTimerRef.current !== null) {
      clearTimeout(touchTimerRef.current)
      touchTimerRef.current = null
    }
  }, [])

  useEffect(() => clearTouchTimer, [clearTouchTimer])

  // Re-cache card rects on resize. The hand tracker runs at ~30fps and reads
  // these every frame — looking them up live would thrash layout.
  useEffect(() => {
    const recompute = () => {
      const container = containerRef.current
      if (!container) return
      const next = new Map<string, DOMRect>()
      const items = container.querySelectorAll('[data-member-id]')
      items.forEach((el) => {
        const id = el.getAttribute('data-member-id')
        if (id) next.set(id, el.getBoundingClientRect())
      })
      cardRectsRef.current = next
    }
    recompute()
    window.addEventListener('resize', recompute)
    window.addEventListener('scroll', recompute, { passive: true })
    return () => {
      window.removeEventListener('resize', recompute)
      window.removeEventListener('scroll', recompute)
    }
  }, [])

  // Size the hand-overlay canvas to match the grid container in CSS pixels,
  // with internal resolution scaled by devicePixelRatio for crisp lines.
  useEffect(() => {
    if (!cameraEnabled) return
    const container = containerRef.current
    const canvas = canvasRef.current
    if (!container || !canvas) return
    const resize = () => {
      const rect = container.getBoundingClientRect()
      const dpr = window.devicePixelRatio || 1
      canvas.width = Math.round(rect.width * dpr)
      canvas.height = Math.round(rect.height * dpr)
      canvas.style.width = `${rect.width}px`
      canvas.style.height = `${rect.height}px`
      const ctx = canvas.getContext('2d')
      if (ctx) {
        // Reset any prior transform before applying a fresh DPR scale.
        ctx.setTransform(1, 0, 0, 1, 0, 0)
        ctx.scale(dpr, dpr)
      }
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(container)
    return () => ro.disconnect()
  }, [cameraEnabled])

  const handlePointerEnter = useCallback(
    (id: string) => () => setHoveredId(id),
    [],
  )
  const handlePointerLeave = useCallback(() => setHoveredId(null), [])
  const handleTouchStart = useCallback(
    (id: string) => () => {
      clearTouchTimer()
      setHoveredId(id)
      touchTimerRef.current = setTimeout(() => {
        setHoveredId(null)
        touchTimerRef.current = null
      }, TOUCH_IDLE_MS)
    },
    [clearTouchTimer],
  )
  const handleTouchEnd = useCallback(() => {
    clearTouchTimer()
    setHoveredId(null)
  }, [clearTouchTimer])

  const handleGridPointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const rect = e.currentTarget.getBoundingClientRect()
      setCursorPos({ x: e.clientX - rect.left, y: e.clientY - rect.top })
    },
    [],
  )

  const handleGridPointerLeave = useCallback(() => setCursorPos(null), [])

  const handleResult = useCallback((result: HandLandmarkerResult) => {
    const container = containerRef.current
    if (!container) return
    const hand = pickHand(result.landmarks as Landmark[][])

    // Repaint the skeleton overlay every frame, including the "no hand" case
    // which clears the canvas.
    const canvas = canvasRef.current
    if (canvas) drawHandOverlay(canvas, hand)

    if (!hand) {
      // Hand left the frame.
      // During an active grab, MediaPipe sometimes drops the hand for a frame
      // or two right after a rapid shape change (open → fist). Hold the grab
      // through a short grace window so a single flaky frame doesn't release
      // the card prematurely.
      if (grabbedIdRef.current !== null) {
        const elapsed = performance.now() - (lastHandSeenAtRef.current || 0)
        if (elapsed < GRAB_HAND_LOST_GRACE_MS) {
          return // keep grab state intact, wait for re-detection
        }
        setGrabbedId(null)
        setGrabScale(1)
        grabRefSizeRef.current = 0
      }
      setHoveredId(null)
      setCursorPos(null)
      return
    }
    lastHandSeenAtRef.current = performance.now()
    const tip = hand[8]
    if (!tip) return

    const handX = 1 - tip.x
    const handY = tip.y

    const containerRect = container.getBoundingClientRect()
    const localX = handX * containerRect.width
    const localY = handY * containerRect.height
    setCursorPos({ x: localX, y: localY })

    const fist = isFistClosed(hand)
    const size = handBoxSize(hand)

    // Grab state machine.
    if (fist && grabbedIdRef.current === null && hoveredIdRef.current) {
      // Just closed: latch onto whichever card the finger was over.
      setGrabbedId(hoveredIdRef.current)
      grabRefSizeRef.current = size
    } else if (fist && grabbedIdRef.current !== null) {
      // Held: derive pull from how much the hand has shrunk since latch.
      // ratio > 1 = hand is further from the camera than at grab start.
      const ratio = grabRefSizeRef.current / Math.max(size, 0.05)
      const clamped = Math.max(1, Math.min(GRAB_MAX_SCALE, ratio))
      setGrabScale(clamped)
      // Don't reassign hoveredId — keep the grabbed card lit.
      return
    } else if (!fist && grabbedIdRef.current !== null) {
      // Released. Capture state BEFORE clearing so we can decide whether the
      // user pulled hard enough to count as "yanked the card open".
      const releasedId = grabbedIdRef.current
      const wasPulled = grabScaleRef.current >= GRAB_OPEN_LINKEDIN_THRESHOLD
      setGrabbedId(null)
      setGrabScale(1)
      grabRefSizeRef.current = 0
      // Yanked → open the member's LinkedIn in a new tab. A light release
      // just snaps back with no navigation.
      if (wasPulled) {
        const member = members.find((m) => m.id === releasedId)
        if (member?.linkedin) {
          window.open(member.linkedin, '_blank', 'noopener,noreferrer')
        }
      }
    }

    // No active grab — normal closest-card hover logic.
    const fingerX = containerRect.left + localX
    const fingerY = containerRect.top + localY

    let bestId: string | null = null
    let bestDist = Infinity
    for (const [id, rect] of cardRectsRef.current) {
      const cx = rect.left + rect.width / 2
      const cy = rect.top + rect.height / 2
      const d = Math.hypot(fingerX - cx, fingerY - cy)
      if (d < bestDist) {
        bestDist = d
        bestId = id
      }
    }
    setHoveredId(bestId)
  }, [])

  const tracking = useHandTracking(videoRef, handleResult, cameraEnabled)

  const buttonLabel = useMemo(() => {
    if (!cameraEnabled) return 'Enable camera'
    if (tracking.status === 'loading') return 'Initializing…'
    if (tracking.status === 'error') return 'Camera blocked'
    return 'Disable camera'
  }, [cameraEnabled, tracking.status])

  const toggle = useCallback(() => {
    setCameraEnabled((on) => !on)
  }, [])

  const cameraLive = cameraEnabled && tracking.status === 'ready'

  return (
    <div className="space-y-6">
      <div
        ref={containerRef}
        className="relative isolate"
        onPointerMove={handleGridPointerMove}
        onPointerLeave={handleGridPointerLeave}
      >
        {/* Camera feed: faint, mirrored, sits BEHIND everything. Only paints
            when the hook reports a live stream — pre-stream there's nothing
            useful to show. */}
        {cameraEnabled ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            aria-hidden={true}
            tabIndex={-1}
            className="pointer-events-none absolute inset-0 -z-10 h-full w-full rounded-lg object-cover"
            style={{
              opacity: cameraLive ? 0.22 : 0,
              transform: 'scaleX(-1)',
              filter: 'contrast(1.05) saturate(0.7) brightness(0.85)',
              transition: 'opacity 400ms ease-out',
            }}
          />
        ) : null}

        <ul
          // biome-ignore lint/a11y/noRedundantRoles: explicit role="list" preserves Safari list semantics under list-style:none
          role="list"
          aria-label="team"
          className="grid grid-cols-2 gap-6 sm:grid-cols-3 sm:gap-7"
        >
          {members.map((member, i) => {
            const isGrabbed = grabbedId === member.id
            // While being grabbed the card needs to render OVER its neighbours
            // (it scales up out of its grid cell). z-30 keeps it above the
            // spotlight overlay too.
            const liClassName = isGrabbed
              ? 'relative z-30 rounded-lg border border-accent shadow-[0_0_24px_rgba(0,200,83,0.35)] transition-[box-shadow,border-color] duration-200 ease-out'
              : hoveredId === member.id
                ? 'rounded-lg border border-accent shadow-[0_0_24px_rgba(0,200,83,0.35)] transition-[box-shadow,border-color] duration-200 ease-out'
                : 'rounded-lg border border-transparent transition-[box-shadow,border-color] duration-200 ease-out'
            return (
              <li
                key={member.id}
                // biome-ignore lint/a11y/noRedundantRoles: explicit role preserves Safari list semantics; CSS selector [role="listitem"] used in tests
                role="listitem"
                data-member-id={member.id}
                className={liClassName}
                onPointerEnter={handlePointerEnter(member.id)}
                onPointerLeave={handlePointerLeave}
                onTouchStart={handleTouchStart(member.id)}
                onTouchEnd={handleTouchEnd}
                onTouchCancel={handleTouchEnd}
              >
                <HeroCard
                  member={member}
                  isHovered={hoveredId === member.id}
                  priority={i < 3}
                  isGrabbed={isGrabbed}
                  grabScale={isGrabbed ? grabScale : 1}
                />
              </li>
            )
          })}
        </ul>

        {/* Cursor spotlight: radial gradient that follows pointer or finger. */}
        <div
          aria-hidden={true}
          className="pointer-events-none absolute inset-0 rounded-lg transition-opacity duration-300"
          style={{
            background: cursorPos
              ? `radial-gradient(${SPOTLIGHT_RADIUS_PX}px circle at ${cursorPos.x}px ${cursorPos.y}px, rgba(0,200,83,0.18), transparent 70%)`
              : undefined,
            opacity: cursorPos ? 1 : 0,
            mixBlendMode: 'screen',
          }}
        />

        {/* Hand-skeleton canvas: drawn above the cards so the wire-frame stays
            visible even when the hand passes over a portrait. */}
        {cameraEnabled ? (
          <canvas
            ref={canvasRef}
            aria-hidden={true}
            tabIndex={-1}
            className="pointer-events-none absolute inset-0 rounded-lg transition-opacity duration-300"
            style={{ opacity: cameraLive ? 1 : 0 }}
          />
        ) : null}
      </div>

      {/* Camera toggle is hidden on mobile (<640px): front-camera hand-tracking
          has no useful UX on a phone the user is holding. */}
      <div className="hidden items-center justify-center gap-3 sm:flex">
        <button
          type="button"
          onClick={toggle}
          aria-pressed={cameraEnabled}
          className="rounded-md border border-accent/50 bg-accent/10 px-4 py-2 font-mono text-[12px] text-accent transition-colors hover:bg-accent/20"
        >
          {buttonLabel}
        </button>
        <p aria-live="polite" className="font-mono text-[11px] text-dark-muted">
          {cameraEnabled && tracking.status === 'ready'
            ? 'point your finger · the closest tile lights up'
            : null}
          {tracking.status === 'error' ? 'camera permission denied' : null}
        </p>
      </div>
    </div>
  )
}
