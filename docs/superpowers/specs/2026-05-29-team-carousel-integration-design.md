# Design — Team-section carousel integration + merge cleanup + dark-CodeBlock fix

**Date:** 2026-05-29
**Status:** Approved (decisions made) — pending spec review
**Author:** Jérémy Magrin (with Claude Code)
**Builds on:** `2026-05-29-useffect-sh-landing-page-design.md`

## Context

The landing-page implementation completed earlier today was uncommitted when the user pulled `origin/main`. The team had committed parallel work:
- `apps/web/app/page.tsx` — a 3D ring carousel of the real team (David, Pablo, Matthys, Ludwig, Jérémy, Gabriel + a "Robots" easter egg) driven by MediaPipe Hands camera tracking
- `apps/web/app/carousel.tsx` — the 3D ring component
- `apps/web/app/use-hand-tracking.ts` — camera + MediaPipe hook with visibility-aware pause
- Portrait images at `apps/web/public/<name>.png` (6 files, ~14MB total)
- A few unrelated commits (hero headline/tagline, person adds)

The pull collided with the uncommitted move from `app/` → `src/app/`, leaving `<<<<<<< Updated upstream / >>>>>>> Stashed changes` markers across `apps/web/src/app/layout.tsx`, `apps/web/app/page.tsx`, `apps/web/app/page.test.tsx`, `apps/web/app/globals.css`, `apps/web/src/app/carousel.tsx`, and `apps/web/src/app/use-hand-tracking.ts`. Both `apps/web/app/` and `apps/web/src/app/` directories now exist on disk.

This spec also resolves a visible bug in the just-built Team section: the package.json `<CodeBlock variant="dark">` renders `.tok-k` and `.tok-fn` spans in `var(--color-ink)` (near-black) on the dark background — invisible (per the user's screenshot).

## Goals

1. Clean working-tree merge state — single source of truth at `apps/web/src/`, no legacy `apps/web/app/`, no conflict markers anywhere.
2. Fix the dark-CodeBlock syntax-token colors so the package.json snippet is readable.
3. Replace the static fake-persona MemberCard grid in the Team section with the team's camera-driven 3D ring carousel, populated with the 6 real engineers + the "Robots" easter egg.
4. Recolor the carousel from cyan/Precog to the brand's accent green so it fits the rest of the site.
5. Make camera **opt-in** (button), with wheel + swipe as the default no-permission input — the carousel works for everyone before they click anything.
6. Keep every other section of the landing exactly as built (Nav, Hero, Services, Effect, Missions, Process, Closer, Footer all unchanged).

**Success condition:** `bun run lint && bun run typecheck && bun run test:ci && bun run build` is green; the live Team section shows the 3D carousel of the real team, drivable by wheel/swipe out of the box, with a discreet "Enable camera" affordance that switches to hand-tracking on click; the package.json snippet is readable; legacy `apps/web/app/` is gone.

## Decisions made

| Question | Decision |
|---|---|
| Structure | My landing page is the base; carousel goes **inside** the Team section, replacing MemberCard grid |
| Fake personas (Mira/Tomáš/Sora/Léo/Ana) + "147 talks" stats | **Replaced with real team** |
| Camera UX | **Opt-in via "Enable camera" button**; default is wheel + swipe |
| Aesthetic | **Recolor cyan → accent green** (brand-coherent) |

## Merge cleanup

The current working tree is mid-stash-pop conflict. The shortest correct path:

1. Discard the legacy `apps/web/app/` directory entirely — its files are superseded by `apps/web/src/app/`. No content lives there that isn't elsewhere.
2. Resolve conflict markers in `apps/web/src/app/layout.tsx`:
   - Keep my version's body (skip-link, ConsoleEgg via Task 7, font setup with Geist + Geist_Mono only, `bg-bg text-ink` tokens, the "React Native Expert on Demand" title).
   - Drop the team's `Playfair_Display` font (not used anywhere in my landing components).
3. Move `apps/web/src/app/carousel.tsx` and `apps/web/src/app/use-hand-tracking.ts` into the team feature: `apps/web/src/features/team/components/carousel.client.tsx` and `apps/web/src/features/team/hooks/use-hand-tracking.client.ts` respectively. Rewrite the import paths in the consumer.
4. Verify zero `<<<<<<<` / `=======` / `>>>>>>>` strings remain anywhere under `apps/`.

The team's portraits at `apps/web/public/<name>.png` and the `@mediapipe/tasks-vision` dependency in `apps/web/package.json` stay as they are.

## Dark CodeBlock fix

Current `globals.css`:

```css
.tok-k  { color: var(--color-ink); font-weight: 500; }
.tok-fn { color: var(--color-ink); font-weight: 600; }
```

`--color-ink` (`#0E0E0C`) is near-black, illegible on the dark CodeBlock's `--color-dark-2` background. The CodeBlock primitive accepts `variant: 'light' | 'dark'` but doesn't currently scope the token colors.

**Fix:** Add a `data-variant` attribute on the `<CodeBlock>` wrapper and scope the dark overrides via attribute selectors in `globals.css`:

```tsx
// code-block.tsx — outer wrapper gains:
data-variant={variant}
```

```css
/* globals.css — add to the syntax token block: */
[data-variant='dark'] .tok-k  { color: var(--color-bg); }
[data-variant='dark'] .tok-fn { color: var(--color-bg); }
[data-variant='dark'] .tok-p  { color: var(--color-dark-muted); }
[data-variant='dark'] .tok-c  { color: var(--color-dark-muted); }
/* .tok-s (accent-ink) and .tok-us (accent) remain unchanged — they're
   already legible on both backgrounds. */
```

Light variant keeps current colors (already correct on cream).

## Team-section restructure

The current `team.tsx` renders, in order: dark `<Section>` → `<Eyebrow variant="dark">` → `<h2>The dependencies.</h2>` → 2-col (lead paragraph + `<PackageBlock>`) → 5-col grid of `<MemberCard>` → footer stats line.

The new structure:

```
<Section id="team" variant="dark">
  <Container>
    <Eyebrow variant="dark">{'// package.json > dependencies'}</Eyebrow>
    <h2>The dependencies.</h2>
    <div class="lead+package grid">
      <p>(updated lead — same copy is fine; "Five senior engineers" → "Six senior engineers")</p>
      <PackageBlock />  {/* updated to real handles */}
    </div>
    <TeamCarousel />    {/* NEW: replaces the 5-col MemberCard grid */}
    {/* "147 conference talks combined" footer line REMOVED entirely */}
  </Container>
</Section>
```

### Real team (replaces `team/data.ts` + `package-block.tsx` content)

| Real name | Role | Image | npm scope |
|---|---|---|---|
| David Leuliette | Native Engineer | `/david.png` | `@useffect/david` |
| Pablo Giraud-Carrier | Architect | `/pablo.png` | `@useffect/pablo` |
| Matthys Ducrocq | Native Engineer | `/matthys.png` | `@useffect/matthys` |
| Ludwig Vantours | Strategist | `/ludwig.png` | `@useffect/ludwig` |
| Jérémy Magrin | Designer | `/jeremy.png` | `@useffect/jeremy` |
| Gabriel Hofman | Analyst | `/gabriel.png` | `@useffect/gabriel` |
| Robots | Automation | _none_ (initials fallback) | `@useffect/robots` (in package block) |

The package.json block lists 6 humans + the Robots easter egg as a 7th dependency with a comment like `// the bench`.

The "147 conference talks combined · 11.4M npm downloads / mo · 14 shipped apps last 24 mo" footer line is dropped entirely (fabricated, can't be defended).

### Files removed (no longer needed)

- `apps/web/src/features/team/components/member-card.tsx`
- `apps/web/src/features/team/components/portrait-svg.tsx`

The static SVG silhouette grid is fully replaced by the carousel.

## TeamCarousel component (new)

`apps/web/src/features/team/components/team-carousel.client.tsx` — owns the carousel state machine, input drivers, and the opt-in camera affordance.

This is the single client island for the section. It composes:
- The 3D ring `<Carousel>` (ported from `carousel.tsx`, recolored)
- The hand-tracking hook (ported from `use-hand-tracking.ts`, unchanged behavior)
- A canvas overlay for landmark visualization (recolored cyan → accent)
- Wheel + touch input drivers (no behavior change)
- An "Enable camera" CTA + status indicator

### Behavior

**Initial state:** `mode='wheel-touch'`. No `<video>` element, no permission prompt, no MediaPipe loaded. Wheel + touch drive the carousel via the existing `Engine` state machine (tracking → inertia → spring snap). The "Enable camera" button is visible at the bottom of the section.

**On "Enable camera" click:** `mode='camera-loading'` → instantiate the `useHandTracking` hook (it requests permission). If permission granted: `mode='camera-active'`, video + overlay become visible, hand-tracking drives the carousel in addition to wheel/touch. If denied or error: `mode='camera-denied'`, fall back silently to wheel/touch with an unobtrusive note.

Camera is **off by default** — `useHandTracking` is only mounted when `mode === 'camera-loading'` or `'camera-active'`. This means MediaPipe WASM + model only load if the user opts in. Important for landing-page bundle/cost.

### Visual treatment (cyan → accent green)

All cyan classes from `carousel.tsx` recolor to:
- `border-cyan-300/80` → `border-accent`
- `border-cyan-400/20` → `border-dark-line`
- `text-cyan-100/90` → `text-bg`
- `text-cyan-300/70` → `text-dark-muted`
- `text-cyan-300/60` → `text-dark-muted`
- `text-cyan-50` → `text-bg`
- `bg-cyan-300` → `bg-accent`
- `shadow-[0_0_60px_rgba(34,211,238,0.4)]` → `shadow-[0_0_60px_rgba(0,200,83,0.4)]`
- `bg-gradient` cyan stops → use `--color-dark` / `--color-dark-2`
- Canvas overlay stroke/fill `rgba(34,211,238,*)` → `rgba(0,200,83,*)`
- "ID://001" timecode color cyan → accent

Portrait card gradient (`linear-gradient(135deg, rgba(8,47,73,0.6) 0%, rgba(15,23,42,0.8) 100%)`) becomes a dark-on-dark accent-tinted gradient using the design tokens.

### Section sizing (embedded vs full-viewport)

The original page lived at `h-screen w-screen`. As an embedded section, the carousel container is `aspect-[16/10] min-h-[500px] max-h-[80vh] w-full`. Relative-positioned (not absolute-inset-0). The Container wraps it.

### Input ownership

- Wheel + touch listeners attach to the carousel container ref (not `<main>` or the whole document), so they don't capture page scroll outside the section.
- Hand-tracking continues to drive the engine via callback when `mode === 'camera-active'` and the fingertip is inside the hitbox.
- `preventDefault` on wheel inside the section means in-section vertical scroll is intercepted — the user can still scroll the rest of the page outside the carousel.

### Robots fallback

The `Robots` item has no `image` prop. The Portrait component already handles this (initials + role caption). With recolored aesthetic, the initials become accent-tinted on the dark gradient.

## File structure deltas

```
apps/web/
├── app/                           DELETED (legacy)
├── public/
│   ├── david.png · pablo.png · matthys.png · ludwig.png · jeremy.png · gabriel.png   (already present)
│   └── .gitkeep
├── src/
│   ├── app/
│   │   ├── layout.tsx             conflict markers resolved (keep my version)
│   │   ├── globals.css            unchanged (already correct)
│   │   ├── page.tsx               unchanged
│   │   ├── page.test.tsx          unchanged
│   │   ├── carousel.tsx           MOVED → features/team/components/carousel.client.tsx
│   │   └── use-hand-tracking.ts   MOVED → features/team/hooks/use-hand-tracking.client.ts
│   ├── components/ui/code-block.tsx        modify: pass data-variant
│   ├── app/globals.css                     modify: add 4-line dark-variant token overrides
│   └── features/team/
│       ├── data.ts                         REWRITE: real team
│       ├── hooks/use-hand-tracking.client.ts   NEW (moved)
│       └── components/
│           ├── team.tsx                    REWRITE: drops the 5-col grid + footer stats
│           ├── package-block.tsx           REWRITE: real handles
│           ├── carousel.client.tsx         NEW (moved + recolored)
│           ├── team-carousel.client.tsx    NEW: orchestrates state + camera opt-in
│           ├── member-card.tsx             DELETED
│           └── portrait-svg.tsx            DELETED
```

## Dependencies

No new packages — `@mediapipe/tasks-vision@^0.10.35` is already in `apps/web/package.json` from the team's commits.

## Constraints

- **No commits or pushes by Claude.** The user reviews and commits. The fix loop ends in `bun run lint/typecheck/test:ci/build` green; no `git add`/`commit`/`push`.
- **Bun only.** No npm/pnpm/yarn.
- **Strict TS.** No `any`, no `@ts-ignore`.
- **Tailwind utilities first.** The carousel's color recolor is utility-class changes; inline `style={...}` only where the original had it (perspective, transforms, gradients with dynamic interpolation).
- **TeamCarousel is the ONLY new client island** in the team feature. Everything else stays server.
- **No regression on the 10 existing tests.** Page-level smoke test continues to assert the Team section heading.
- **Camera privacy:** MediaPipe must not load and `getUserMedia` must not be called before the user clicks "Enable camera." Verifiable: with the page just loaded, DevTools Network shouldn't show requests to the CDN model URL.
- **Accessibility:** the "Enable camera" button is a real `<button>` with focus ring. The carousel has keyboard arrow-left/arrow-right navigation through items (additive to the existing wheel/touch). Each card has a labeled portrait area.

## Out of scope (this iteration)

- Hero headline/tagline updates the team made on their `feat: hero headline and tagline` commit — we keep my Hero verbatim. (If you want their copy, that's a separate task.)
- Real bios / per-engineer cards beyond the carousel (e.g., a click-through to a profile)
- og.png / favicon assets
- Real social/legal URLs in footer
- Visual regression / Playwright

## Manual steps after merge (user)

- Review the full diff: `git status`, `git diff HEAD`. There will be a LOT of deletions (legacy `app/` dir) + additions (the carousel feature) + edits (team section + globals.css + code-block.tsx + layout.tsx conflict resolution).
- Commit. Suggested message: `feat: real team + camera carousel in team section`.
- Push to `main` — Vercel auto-deploys.
- First visit: confirm carousel loads + wheel/swipe works. Click "Enable camera" → camera prompt → hand-tracking activates.
