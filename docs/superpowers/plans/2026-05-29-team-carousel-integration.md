# Team carousel integration — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:subagent-driven-development. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Resolve merge conflicts from the team's pulled work, fix the dark CodeBlock black-on-black token bug, and replace the static fake-personas grid in the Team section with the camera-driven 3D ring carousel of the real team (David, Pablo, Matthys, Ludwig, Jérémy, Gabriel + Robots), recolored cyan → accent green, with opt-in camera (default wheel+swipe).

**Architecture:** Land everything at `apps/web/src/` (delete legacy `apps/web/app/`). One new client island `TeamCarousel` orchestrates state + camera opt-in; composes a recolored `Carousel` + the moved hand-tracking hook. Camera UX is opt-in — MediaPipe only loads after click.

**Tech Stack:** existing — Bun · Turborepo · Next.js 16 · TypeScript 5.9 strict · Tailwind v4 · Biome · Vitest · `@mediapipe/tasks-vision@^0.10.35` (already installed by team).

**Spec:** `docs/superpowers/specs/2026-05-29-team-carousel-integration-design.md`

---

## CRITICAL EXECUTION CONSTRAINTS

- **NEVER `git add`/`commit`/`push`.** Read-only git (`git status`, `git diff`, `git log`) is fine. `git mv` is allowed (no commit).
- **Bun only.** No npm/pnpm/yarn.
- **Strict TS.** No `any`, no `@ts-ignore`.
- **Tailwind utility-first.** Inline `style={...}` only where original code already uses it (carousel transforms, gradients).
- **No new dependencies.** Everything needed is already installed.

---

## Execution order

- **Phase 1 (PARALLEL):** T1 (merge cleanup) + T2 (dark CodeBlock fix) — independent file sets
- **Phase 2 (PARALLEL):** T3 (real team data) + T4 (carousel recolor)
- **Phase 3 (SEQUENTIAL):** T5 (TeamCarousel orchestrator) → T6 (team.tsx restructure)
- **Phase 4:** T7 (final validation)

---

## Task 1: Merge cleanup

**Files:**
- Delete: `apps/web/app/` (entire directory; legacy)
- Resolve conflict markers in: `apps/web/src/app/layout.tsx`, `apps/web/src/app/carousel.tsx`, `apps/web/src/app/use-hand-tracking.ts`
- Move: `apps/web/src/app/carousel.tsx` → `apps/web/src/features/team/components/carousel.client.tsx`
- Move: `apps/web/src/app/use-hand-tracking.ts` → `apps/web/src/features/team/hooks/use-hand-tracking.client.ts`

- [ ] **Step 1: Resolve conflict markers in `apps/web/src/app/layout.tsx`**

The current file has `<<<<<<< Updated upstream / ======= / >>>>>>> Stashed changes` markers. Resolve by keeping the "Stashed changes" side (my landing-page version). Final content should match what was approved in the previous spec — read the file, delete every conflict-marker line, keep ONLY the version below the `=======` marker on each conflict. Specifically:

- Imports: keep `Geist, Geist_Mono` (no Playfair_Display) AND keep the `ConsoleEgg` import.
- Title constant: keep `'useffect.sh — React Native Expert on Demand'`.
- Body className: keep `${geistSans.variable} ${geistMono.variable} font-sans antialiased bg-bg text-ink` (no `playfair.variable`, no `bg-white text-neutral-950`).
- Inside body: keep the skip-link, `{children}`, `<Analytics />`, `<SpeedInsights />`, `<ConsoleEgg />` in that order.

When done, run `grep -n "<<<<<<\|=======\|>>>>>>" apps/web/src/app/layout.tsx` and expect zero output.

- [ ] **Step 2: Resolve conflict markers in `apps/web/src/app/carousel.tsx` and `apps/web/src/app/use-hand-tracking.ts`**

For both files, resolve any `<<<<<<< / ======= / >>>>>>>` markers by keeping the team's working version (the post-merge `Stashed changes` side that has the real component code). The carousel will be recolored in Task 4 — for now just produce a clean file with no markers. Same for the hand-tracking hook.

Verify: `grep -rn "<<<<<<\|=======\|>>>>>>" apps/web/src/` returns zero lines.

- [ ] **Step 3: Move carousel + hand-tracking into the team feature**

Use `git mv` (allowed — it modifies working tree, no commit):

```bash
mkdir -p apps/web/src/features/team/hooks
git mv apps/web/src/app/carousel.tsx apps/web/src/features/team/components/carousel.client.tsx
git mv apps/web/src/app/use-hand-tracking.ts apps/web/src/features/team/hooks/use-hand-tracking.client.ts
```

- [ ] **Step 4: Delete the legacy `apps/web/app/` directory**

```bash
git rm -r apps/web/app/
```

(`git rm` modifies the working tree + staging area but does NOT commit — allowed.)

- [ ] **Step 5: Verify no conflict markers and the codebase still compiles**

```bash
grep -rn "<<<<<<\|=======\|>>>>>>" apps/web/src/ 2>/dev/null && echo "FAIL: markers remain" || echo "OK: no markers"
bun run lint && bun run typecheck
```

Expected: `OK: no markers`. Lint and typecheck pass.

Note: `bun run build` will likely fail at this point because nothing imports the moved `carousel.client.tsx` / `use-hand-tracking.client.ts` yet, and the moved files still reference each other by old paths. That's expected and gets resolved in Tasks 4 and 5. For Task 1, lint + typecheck passing is enough.

---

## Task 2: Dark CodeBlock token fix

**Files:**
- Modify: `apps/web/src/components/ui/code-block.tsx`
- Modify: `apps/web/src/app/globals.css`

- [ ] **Step 1: Add `data-variant` attribute to the CodeBlock wrapper**

In `apps/web/src/components/ui/code-block.tsx`, find the root `<div>` (which already has the conditional `role`/`aria-label` spread). Add `data-variant={variant}` to that `<div>`:

```tsx
<div
  {...(label ? { role: 'region', 'aria-label': label } : {})}
  data-variant={variant}
  className={cn(
    'overflow-hidden border',
    isDark
      ? 'bg-dark-2 text-bg border-dark-line'
      : 'bg-bg-2 border-line',
    className,
  )}
>
```

- [ ] **Step 2: Add dark-variant token color overrides to globals.css**

In `apps/web/src/app/globals.css`, find the `/* Custom block #2: terminal syntax token colors */` block (lines that include `.tok-c`, `.tok-k`, etc.). After the existing 6 light-variant rules, add:

```css
/* Dark-variant overrides: keywords/punctuation/comments need lighter colors. */
[data-variant='dark'] .tok-k {
  color: var(--color-bg);
}
[data-variant='dark'] .tok-fn {
  color: var(--color-bg);
}
[data-variant='dark'] .tok-p {
  color: var(--color-dark-muted);
}
[data-variant='dark'] .tok-c {
  color: var(--color-dark-muted);
}
/* .tok-s (accent-ink, dark green) and .tok-us (accent, bright green)
   remain legible on both light and dark backgrounds — no override needed. */
```

- [ ] **Step 3: Verify gate**

```bash
bun run lint:fix
bun run lint && bun run typecheck
```

Build will fail because of T1's pending moves; that's fine for this task. Lint and typecheck must pass.

---

## Task 3: Real team data + package.json block

**Files:**
- Modify: `apps/web/src/features/team/data.ts` (rewrite)
- Modify: `apps/web/src/features/team/components/package-block.tsx` (rewrite)

- [ ] **Step 1: Rewrite `data.ts`** with the real team

```ts
export interface Member {
  id: string
  name: string
  role: string
  /** Public-folder path. `undefined` for the Robots easter egg. */
  image?: string
  /** npm scope handle for the package.json pseudo-snippet. */
  scope: string
}

export const members: readonly Member[] = [
  { id: '001', name: 'David Leuliette',       role: 'Native Engineer', image: '/david.png',   scope: '@useffect/david' },
  { id: '002', name: 'Pablo Giraud-Carrier',  role: 'Architect',       image: '/pablo.png',   scope: '@useffect/pablo' },
  { id: '003', name: 'Matthys Ducrocq',       role: 'Native Engineer', image: '/matthys.png', scope: '@useffect/matthys' },
  { id: '004', name: 'Ludwig Vantours',       role: 'Strategist',      image: '/ludwig.png',  scope: '@useffect/ludwig' },
  { id: '005', name: 'Jérémy Magrin',         role: 'Designer',        image: '/jeremy.png',  scope: '@useffect/jeremy' },
  { id: '006', name: 'Gabriel Hofman',        role: 'Analyst',         image: '/gabriel.png', scope: '@useffect/gabriel' },
  { id: '007', name: 'Robots',                role: 'Automation',                            scope: '@useffect/robots' },
] as const
```

- [ ] **Step 2: Rewrite `package-block.tsx`** to list the real team

Same dark CodeBlock structure, real handles + versions + comments. Versions are intentionally invented but on-brand; the comment column reflects each person's role.

```tsx
import { CodeBlock } from '@/components/ui/code-block'

export function PackageBlock() {
  return (
    <CodeBlock
      variant="dark"
      title={<>~/your-app/package.json</>}
      status="// 7 deps · 0 vulnerabilities"
    >
      <span className="block">
        <span className="tok-c">{'// the squad mounts together.'}</span>
      </span>
      <span className="block">
        <span className="tok-p">"</span>
        <span className="tok-k">dependencies</span>
        <span className="tok-p">"</span>
        <span className="tok-p">: {'{'}</span>
      </span>
      <span className="block pl-4">
        <span className="tok-p">"</span><span className="tok-k">@useffect/david</span><span className="tok-p">"</span>
        <span className="tok-p">: "</span><span className="tok-s">^7.3.0</span><span className="tok-p">",</span>{' '}
        <span className="tok-c">{'// native modules & bridges'}</span>
      </span>
      <span className="block pl-4">
        <span className="tok-p">"</span><span className="tok-k">@useffect/pablo</span><span className="tok-p">"</span>
        <span className="tok-p">: "</span><span className="tok-s">^6.1.4</span><span className="tok-p">",</span>{' '}
        <span className="tok-c">{'// architecture & new arch'}</span>
      </span>
      <span className="block pl-4">
        <span className="tok-p">"</span><span className="tok-k">@useffect/matthys</span><span className="tok-p">"</span>
        <span className="tok-p">: "</span><span className="tok-s">^5.8.2</span><span className="tok-p">",</span>{' '}
        <span className="tok-c">{'// native + perf'}</span>
      </span>
      <span className="block pl-4">
        <span className="tok-p">"</span><span className="tok-k">@useffect/ludwig</span><span className="tok-p">"</span>
        <span className="tok-p">: "</span><span className="tok-s">^8.0.1</span><span className="tok-p">",</span>{' '}
        <span className="tok-c">{'// product & strategy'}</span>
      </span>
      <span className="block pl-4">
        <span className="tok-p">"</span><span className="tok-k">@useffect/jeremy</span><span className="tok-p">"</span>
        <span className="tok-p">: "</span><span className="tok-s">^4.9.0</span><span className="tok-p">",</span>{' '}
        <span className="tok-c">{'// design & DX'}</span>
      </span>
      <span className="block pl-4">
        <span className="tok-p">"</span><span className="tok-k">@useffect/gabriel</span><span className="tok-p">"</span>
        <span className="tok-p">: "</span><span className="tok-s">^3.4.0</span><span className="tok-p">",</span>{' '}
        <span className="tok-c">{'// analytics & data'}</span>
      </span>
      <span className="block pl-4">
        <span className="tok-p">"</span><span className="tok-k">@useffect/robots</span><span className="tok-p">"</span>
        <span className="tok-p">: "</span><span className="tok-s">^1.0.0</span><span className="tok-p">"</span>{'  '}
        <span className="tok-c">{'// the bench'}</span>
      </span>
      <span className="block">
        <span className="tok-p">{'}'}</span>
      </span>
    </CodeBlock>
  )
}
```

- [ ] **Step 3: Verify gate**

```bash
bun run lint:fix
bun run lint && bun run typecheck
```

Pass.

---

## Task 4: Carousel recolor (cyan → accent green)

**Files:**
- Modify: `apps/web/src/features/team/components/carousel.client.tsx` (after T1's move)

The file currently uses cyan classes everywhere. Rewrite to use the brand's accent green tokens + dark-line tones.

- [ ] **Step 1: Update the type signature to match new data**

The carousel currently expects `CarouselItem = { id, name, role, image? }`. Our team `Member` interface is `{ id, name, role, image?, scope }` — the extra `scope` is unused by the carousel. Keep the local `CarouselItem` shape exactly as is (don't import from data), so the carousel stays decoupled from team-specific fields. The consumer (Task 5) will map `members` → `CarouselItem[]` before passing in.

- [ ] **Step 2: Replace the cyan palette throughout `carousel.client.tsx`**

Recolor every cyan reference. Final relevant snippets:

- The active portrait card:
```tsx
className={`relative h-full w-full overflow-hidden rounded-lg border backdrop-blur-sm transition-colors ${
  active
    ? 'border-accent shadow-[0_0_60px_rgba(0,200,83,0.4)]'
    : 'border-dark-line'
}`}
style={{
  background:
    'linear-gradient(135deg, rgba(11,11,10,0.6) 0%, rgba(19,19,17,0.85) 100%)',
}}
```

- Initials fallback text:
```tsx
<span
  className="font-mono font-light tracking-wider text-bg"
  style={{ fontSize: 'clamp(40px, 12vmin, 72px)' }}
>
  {initials}
</span>
```

- No-image caption block:
```tsx
<div className="absolute inset-x-0 bottom-0 border-t border-accent/30 bg-black/40 p-4">
  <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-accent/70">
    {item.role}
  </p>
  <p className="mt-1 font-mono text-sm text-bg">{item.name}</p>
</div>
```

- "ID://" timecode + indicator dot:
```tsx
<div className="absolute left-2 top-2 font-mono text-[10px] text-accent/60">
  ID://{item.id}
</div>
<div className="absolute right-2 top-2 h-2 w-2 animate-pulse rounded-full bg-accent" />
```

The structural code (3D ring math, perspective, transforms, opacity fog) is **unchanged**.

- [ ] **Step 3: Verify gate**

```bash
bun run lint:fix
bun run lint && bun run typecheck
```

Pass.

---

## Task 5: TeamCarousel orchestrator client island

**Files:**
- Create: `apps/web/src/features/team/components/team-carousel.client.tsx`

This is the single new client island. It owns:
- The `Engine` state machine (tracking → inertia → spring snap) — ported from the team's `page.tsx`
- Wheel + touch input drivers attached to the carousel container ref (not document)
- The animation RAF loop
- The opt-in camera state (`'wheel-touch' | 'camera-loading' | 'camera-active' | 'camera-denied'`)
- The `<video>`, `<canvas>` overlay, and "Enable camera" button
- Maps the `members` data to `CarouselItem[]` and renders `<Carousel>`
- Recolor: canvas overlay strokes/fills from cyan `rgba(34,211,238,*)` → accent green `rgba(0,200,83,*)`

- [ ] **Step 1: Create the file**

```tsx
'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import type { HandLandmarkerResult } from '@mediapipe/tasks-vision'
import { Carousel, type CarouselItem } from './carousel.client'
import { useHandTracking } from '../hooks/use-hand-tracking.client'
import { members } from '../data'

// ============================================================================
// Tuning constants (ported from team's page.tsx — unchanged)
// ============================================================================
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
  [0, 1], [1, 2], [2, 3], [3, 4],
  [0, 5], [5, 6], [6, 7], [7, 8],
  [5, 9], [9, 10], [10, 11], [11, 12],
  [9, 13], [13, 14], [14, 15], [15, 16],
  [13, 17], [17, 18], [18, 19], [19, 20],
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

// ============================================================================
// Engine types + state-machine helpers (ported, unchanged behavior)
// ============================================================================
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
    let minX = 1, maxX = 0, minY = 1, maxY = 0
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

// ============================================================================
// Component
// ============================================================================

type CameraMode = 'wheel-touch' | 'camera-loading' | 'camera-active' | 'camera-denied'

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

  // Wheel + touch listeners on the carousel container only (not document).
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
      startTracking(engineRef.current, t.clientX / window.innerWidth, performance.now())
      setPosition(engineRef.current.position)
      touchActive = true
    }
    const onTouchMove = (e: TouchEvent) => {
      if (!touchActive || e.touches.length !== 1) return
      const t = e.touches[0]
      if (!t) return
      updateTracking(engineRef.current, t.clientX / window.innerWidth, performance.now())
      setPosition(engineRef.current.position)
      e.preventDefault()
    }
    const onTouchEnd = () => {
      if (!touchActive) return
      touchActive = false
      if (engineRef.current.mode === 'tracking') releaseTracking(engineRef.current)
    }
    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      const s = engineRef.current
      const now = performance.now()
      const delta = Math.abs(e.deltaX) >= Math.abs(e.deltaY) ? e.deltaX : e.deltaY
      if (s.mode !== 'tracking') {
        wheelVirtualX = 0
        startTracking(s, 0, now)
      }
      wheelVirtualX -= (delta * WHEEL_BOOST) / window.innerWidth
      updateTracking(s, wheelVirtualX, now)
      setPosition(s.position)
      if (wheelTimer !== null) clearTimeout(wheelTimer)
      wheelTimer = window.setTimeout(() => {
        if (engineRef.current.mode === 'tracking') releaseTracking(engineRef.current)
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

  // RAF loop: inertia + spring snap.
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
          const wrapped = ((s.snapTarget % ITEM_COUNT) + ITEM_COUNT) % ITEM_COUNT
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

  // Hand-tracking callback. Only meaningful when cameraMode === 'camera-active'.
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

  const activeIndex = modIndex(position)
  const activeItem = TEAM[activeIndex]

  return (
    <div
      ref={containerRef}
      className="relative w-full overflow-hidden bg-dark touch-none aspect-[16/10] min-h-[500px] max-h-[80vh] border border-dark-line"
    >
      {cameraMode !== 'wheel-touch' && (
        <CameraLayer
          videoRef={videoRef}
          canvasRef={canvasRef}
          onResult={handleResult}
          onStatus={(s) => {
            if (s === 'ready') setCameraMode('camera-active')
            if (s === 'error') setCameraMode('camera-denied')
          }}
        />
      )}

      <div className="absolute inset-0 bg-gradient-to-b from-dark-2/40 via-transparent to-dark/80 pointer-events-none" />

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
            <span className="text-accent">▸</span> {activeItem.name} <span className="text-dark-muted">— {activeItem.role}</span>
          </p>
        )}
        {cameraMode === 'wheel-touch' && (
          <button
            type="button"
            onClick={() => setCameraMode('camera-loading')}
            className="border border-accent/60 px-4 py-2 text-accent transition-colors hover:bg-accent hover:text-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
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

// CameraLayer is only mounted once the user opts in.
// It owns the <video>/<canvas> elements and the useHandTracking hook,
// so MediaPipe WASM + model only load after click.
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
```

- [ ] **Step 2: Verify gate**

```bash
bun run lint:fix
bun run lint && bun run typecheck
```

If lint flags `useArrayIndexKey` on the connections, ignore — they're tuple literals, not iterated. If TS complains about HandLandmarkerResult landmark typing, the `as Landmark[][]` cast is intentional (MediaPipe's NormalizedLandmark satisfies our minimal `Landmark` shape).

---

## Task 6: Team-section restructure

**Files:**
- Rewrite: `apps/web/src/features/team/components/team.tsx`
- Delete: `apps/web/src/features/team/components/member-card.tsx`
- Delete: `apps/web/src/features/team/components/portrait-svg.tsx`

- [ ] **Step 1: Rewrite `team.tsx`**

Drops the 5-col MemberCard grid AND the "147 conference talks combined" footer line. Inserts `<TeamCarousel />` in their place. The lead paragraph updates from "Five" → "Six".

```tsx
import { Container } from '@/components/ui/container'
import { Section } from '@/components/section'
import { Eyebrow } from '@/components/ui/eyebrow'
import { PackageBlock } from './package-block'
import { TeamCarousel } from './team-carousel.client'

export function Team() {
  return (
    <Section id="team" variant="dark" className="py-[120px]">
      <Container>
        <Eyebrow variant="dark">{'// package.json > dependencies'}</Eyebrow>
        <h2 className="mt-6 font-sans text-[56px] font-medium leading-[1.05] tracking-[-0.025em] text-bg">
          The <em className="not-italic text-accent">dependencies.</em>
        </h2>

        <div className="mt-12 grid grid-cols-1 gap-12 lg:grid-cols-[1fr_1fr]">
          <p className="text-[16px] leading-[1.55] text-dark-muted">
            Six senior engineers who mount as one. Every member ships native modules to npm,
            speaks at conferences, and has shipped React Native at scale.{' '}
            <b className="text-bg">No juniors. No subcontractors. No bench.</b> The squad that
            lands on your project is the squad on this page.
          </p>
          <PackageBlock />
        </div>

        <div className="mt-16">
          <TeamCarousel />
        </div>
      </Container>
    </Section>
  )
}
```

- [ ] **Step 2: Delete the obsolete files**

```bash
git rm apps/web/src/features/team/components/member-card.tsx apps/web/src/features/team/components/portrait-svg.tsx
```

(`git rm` is allowed — modifies working tree + index, doesn't commit.)

- [ ] **Step 3: Verify full gate (build should pass now)**

```bash
bun run lint:fix
bun run lint && bun run typecheck && bun run test:ci && bun run build
```

Expected: all pass. Test count stays at 10 (no test changes). Build compiles the carousel + hand-tracking client islands cleanly.

If `next build` complains about `useHandTracking` importing `@mediapipe/tasks-vision` types at the top of the file but only running in the browser, that's fine — Next handles client-only imports in `'use client'` files correctly.

---

## Task 7: Final validation + smoke

**Files:** none

- [ ] **Step 1: Confirm no conflict markers anywhere**

```bash
grep -rn "<<<<<<\|=======\|>>>>>>" apps/web/ 2>/dev/null && echo "FAIL: markers remain" || echo "OK"
```

Expected: `OK`.

- [ ] **Step 2: Confirm legacy directory gone**

```bash
test -d apps/web/app && echo "FAIL: legacy app/ still exists" || echo "OK"
```

Expected: `OK`.

- [ ] **Step 3: Full gate**

```bash
bun run lint && bun run typecheck && bun run test:ci && bun run build
```

All four pass. 10 tests total.

- [ ] **Step 4: Dev server smoke**

```bash
(cd apps/web && timeout 25 bun run dev) || true
```

Expected: `Ready` / `Local: http://localhost:3000` line printed.

Manual visual confirmation (out of band): open localhost:3000, scroll to the Team section, confirm:
- The carousel renders with the 7 real cards
- Wheel/scroll rotates the ring smoothly
- Touch (in mobile mode) rotates it
- "Enable camera" button is visible at the bottom
- Clicking it requests camera permission
- The package.json snippet is readable (no black-on-black tokens)

---

## Handoff to user

When all tasks are green:

### Review the diff

```bash
git status   # large diff: legacy app/ deletion, team feature rewrites, globals.css + code-block.tsx
git diff --staged
git diff
```

### Commit + push

```bash
git add .
git commit -m "feat: real team + camera carousel in team section"
git push origin main
```

Suggested alternative messages:
- `feat: useEffect(() => mountSquad(), [])`
- `feat: the dependencies, with cameras`
- `feat: hand-tracking carousel + real team`

Vercel auto-deploys on push. First visit: confirm carousel + camera flow + readable package.json.

### Not in this iteration

- Hero headline/tagline updates the team made (kept my Hero)
- Real bios / per-engineer click-throughs
- og.png + favicon
- Visual regression tests
