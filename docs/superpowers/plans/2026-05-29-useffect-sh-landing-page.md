# useffect.sh Landing Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the `// mounting...` teaser at `useffect.sh` with the full 8-section landing page from `design/useffect.sh.html`, implemented as state-of-the-art Next.js 16 (App Router, RSC by default) with Tailwind v4 design tokens, clean feature-sliced organization, and only 4 client islands.

**Architecture:** All work in `apps/web`. New `src/` layout: `src/app/` for routes, `src/components/ui/` for design-system primitives, `src/features/<name>/` for each landing section (co-located components + data + hooks). Server components by default; client islands only where state or scroll/resize listeners demand. Tailwind v4 `@theme inline` lifts the design's CSS variables to first-class utility tokens; ~95% of styling is utilities, 3 small custom CSS blocks remain.

**Tech Stack:** Bun 1.3.x · Turborepo 2.x · Next.js 16 · TypeScript 5.9 strict · Tailwind v4 · Biome 2.x · Vitest + Testing Library + jsdom.

**Spec:** `docs/superpowers/specs/2026-05-29-useffect-sh-landing-page-design.md`
**Design source of truth:** `design/useffect.sh.html` (1,693 lines). Implementers READ this file directly to translate styles and copy faithfully.

---

## CRITICAL EXECUTION CONSTRAINTS

- **NEVER run any state-changing git command.** No `git add`, `git commit`, `git push`, `git checkout -b`, `git stash`, `git restore`, etc. The user reviews and commits everything. Tasks end in verification, never in commits. The Handoff section at the bottom of this plan lists the user-run git steps; do not execute them.
- **Bun only.** No `npm`, `pnpm`, `yarn` invocations or references anywhere.
- **Strict TypeScript.** No `any`. No `@ts-ignore`. No `@ts-expect-error`. No non-null `!` assertions on values the type system can't prove safe.
- **Tailwind utility-first.** Apart from the 3 custom CSS blocks in `globals.css` (Task 2) and the inline `style={{background: ...}}` exception on team portraits (Task 15), no other custom CSS, no CSS modules, no inline styles.
- **Pin nothing by hand.** Let `bun add` resolve. Do not edit `bun.lock`.
- **Faithful 1:1 copy.** All AI-generated content from `design/useffect.sh.html` (including profanity, invented personas, "Q3 slots", fabricated metrics) ships verbatim. Do not soften, edit, or genericize. The design HTML is the single source of truth for copy.
- **Work directly in `main`'s working tree** — do not create branches or worktrees.
- **No new dependencies** beyond what this plan explicitly installs (none are needed).

---

## File Structure Reference

This is the target end-state. Tasks reference these paths.

```
apps/web/
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── globals.css
│   │   ├── page.tsx
│   │   └── page.test.tsx
│   ├── components/
│   │   ├── section.tsx
│   │   ├── console-egg.client.tsx
│   │   └── ui/
│   │       ├── button.tsx
│   │       ├── container.tsx
│   │       ├── logo.tsx
│   │       ├── eyebrow.tsx
│   │       ├── comment.tsx
│   │       ├── status-pill.tsx
│   │       ├── code-block.tsx
│   │       └── cursor.tsx
│   ├── features/
│   │   ├── nav/
│   │   │   ├── components/{nav.tsx, mobile-menu.client.tsx}
│   │   │   └── hooks/use-nav-scroll-state.client.ts
│   │   ├── hero/components/{hero.tsx, hero-headline.tsx, hero-terminal.tsx, hero-belt.tsx}
│   │   ├── services/{components/{services.tsx, door.tsx}, data.ts}
│   │   ├── effect/{components/{effect.tsx, effect-toggle.client.tsx}, data.ts}
│   │   ├── missions/{components/{missions.tsx, mission-card.tsx}, data.ts}
│   │   ├── team/{components/{team.tsx, package-block.tsx, member-card.tsx, portrait-svg.tsx}, data.ts}
│   │   ├── process/{components/{process.tsx, lifecycle-step.tsx}, data.ts}
│   │   ├── closer/components/closer.tsx
│   │   └── footer/{components/{footer.tsx, easter-line.tsx, footer-column.tsx}, data.ts}
│   └── lib/cn.ts
└── (tsconfig.json + vitest.config.ts updated for src/ paths)
```

---

## Task 1: Move `app/` → `src/app/` and update path config

**Files:**
- Move: `apps/web/app/` → `apps/web/src/app/` (4 files: `layout.tsx`, `page.tsx`, `globals.css`, `page.test.tsx`)
- Modify: `apps/web/tsconfig.json`
- Modify: `apps/web/vitest.config.ts`

- [ ] **Step 1: Move existing app files into src/**

Run from repo root:
```bash
mkdir -p apps/web/src && git mv apps/web/app apps/web/src/app
```
(Yes, `git mv` is allowed — it modifies the working tree without committing. We are NOT running `git commit`.)

Expected: `apps/web/src/app/` now contains `layout.tsx`, `page.tsx`, `globals.css`, `page.test.tsx`. `apps/web/app/` no longer exists.

- [ ] **Step 2: Update `apps/web/tsconfig.json` paths**

Read the existing file. Change the `paths` entry from `"@/*": ["./*"]` to `"@/*": ["./src/*"]`. Final content:

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "lib": ["dom", "dom.iterable", "esnext"],
    "jsx": "preserve",
    "allowJs": true,
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

- [ ] **Step 3: Update `apps/web/vitest.config.ts` alias**

Change the `'@'` alias from `resolve(__dirname, '.')` to `resolve(__dirname, 'src')`. Final content:

```ts
import { resolve } from 'node:path'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
})
```

- [ ] **Step 4: Verify the full quality gate stays green after the move**

Run from repo root:
```bash
bun run lint && bun run typecheck && bun run test:ci && bun run build
```
Expected: all four pass. Next 16 auto-detects `src/app/` with no extra config. If `tsc` complains about `next-env.d.ts`, run `bun run build` first to regenerate it, then re-run `typecheck`.

---

## Task 2: Tailwind v4 `@theme` tokens + custom CSS blocks

**Files:**
- Modify: `apps/web/src/app/globals.css`
- Modify: `apps/web/src/app/layout.tsx`

- [ ] **Step 1: Replace `apps/web/src/app/globals.css` entirely**

```css
@import 'tailwindcss';

/* ---------- Design tokens (from design/useffect.sh.html :root) ---------- */
@theme inline {
  --color-bg: #FAFAF7;
  --color-bg-2: #F2F0E9;
  --color-ink: #0E0E0C;
  --color-ink-2: #1A1A17;
  --color-muted: #6B6B66;
  --color-muted-2: #9A9A93;
  --color-line: #E6E4DD;
  --color-line-strong: #D6D3C9;
  --color-accent: #00C853;
  --color-accent-ink: #003D19;
  --color-dark: #0B0B0A;
  --color-dark-2: #131311;
  --color-dark-line: #232320;
  --color-dark-muted: #8A8A82;
  --color-warn: #E5484D;

  --font-sans: var(--font-geist-sans);
  --font-mono: var(--font-geist-mono);

  --animate-blink: blink 1.05s steps(1) infinite;
  --animate-pulse-dot: pulse-dot 2.4s ease-in-out infinite;
}

/* ---------- Custom block #1: keyframes referenced by @theme animations ---------- */
@keyframes blink {
  50% { opacity: 0; }
}
@keyframes pulse-dot {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.55; }
}

/* ---------- Custom block #2: terminal syntax token colors ---------- */
/* Used inside <CodeBlock> — colored spans for code highlighting. */
.tok-c  { color: var(--color-muted); }            /* comment */
.tok-k  { color: var(--color-ink); font-weight: 500; }   /* keyword */
.tok-fn { color: var(--color-ink); font-weight: 600; }   /* function name */
.tok-p  { color: var(--color-muted-2); }          /* punctuation */
.tok-s  { color: var(--color-accent-ink); }       /* string */
.tok-us { color: var(--color-accent); font-weight: 600; }/* the literal "us" highlight */

/* ---------- Custom block #3: hero "strike" effect on the word FUCK ---------- */
/* Crosses out the inner .word with an angled line. */
.strike {
  position: relative;
  display: inline-block;
}
.strike .word {
  color: var(--color-muted);
}
.strike::after {
  content: '';
  position: absolute;
  left: -4%;
  right: -4%;
  top: 52%;
  height: 0.08em;
  background: currentColor;
  transform: rotate(-3deg);
}

/* ---------- Reduced motion ---------- */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.001ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.001ms !important;
    scroll-behavior: auto !important;
  }
}
```

- [ ] **Step 2: Update `layout.tsx` — tokens, metadata, skip-link**

Read `apps/web/src/app/layout.tsx`. Three changes:

a) Replace body className `bg-white text-neutral-950` with `bg-bg text-ink` so the body uses the new design tokens.

b) Update the `title` (and the OpenGraph/Twitter `title` references) to match the design's `<title>`: `useffect.sh — React Native Expert on Demand`. Description, URL, images, `metadataBase` unchanged.

```tsx
const title = 'useffect.sh — React Native Expert on Demand'
const description =
  'A senior React Native collective. Series A/B startups only.'
// ... rest of metadata identical
```

c) Add a skip-link as the first child of `<body>`, before `{children}`. It is visually hidden until focused — keyboard users tab to it and skip straight to `#main`. Uses Tailwind's `sr-only` + `focus:not-sr-only` pattern.

Final body of `layout.tsx` after this task (do NOT add `<ConsoleEgg />` yet — Task 7 imports and mounts it):

```tsx
<body
  className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased bg-bg text-ink`}
>
  <a
    href="#main"
    className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:bg-ink focus:px-4 focus:py-2 focus:font-mono focus:text-[13px] focus:text-bg"
  >
    Skip to content
  </a>
  {children}
  <Analytics />
  <SpeedInsights />
</body>
```

The skip-link's `#main` target is added by Task 8 (the `<main id="main">` wrapper inside `page.tsx`); the link is harmless until then.

- [ ] **Step 3: Verify gate**

Run:
```bash
bun run lint && bun run typecheck && bun run build
```
Expected: pass. The build verifies Tailwind v4 picks up `@theme` tokens (utilities like `bg-bg`, `text-ink` must resolve — if not, `next build` fails on the layout change).

Note: the existing smoke test still asserts `// mounting...` which is currently still rendered — it will pass. We replace the homepage in Task 8.

---

## Task 3: `lib/cn.ts` class-merge helper

**Files:**
- Create: `apps/web/src/lib/cn.ts`

- [ ] **Step 1: Create `apps/web/src/lib/cn.ts`**

```ts
/**
 * Joins truthy class name fragments.
 * Tiny, dependency-free. Sufficient for our utility-first styling.
 * No tailwind-merge — we don't have conflicting Tailwind classes
 * coming from multiple sources (no third-party UI lib).
 */
export function cn(
  ...parts: Array<string | false | null | undefined>
): string {
  return parts.filter(Boolean).join(' ')
}
```

- [ ] **Step 2: Verify typecheck**

Run:
```bash
(cd apps/web && bun run typecheck)
```
Expected: pass.

---

## Task 4: UI primitives batch (small, no-state components)

**Files:**
- Create: `apps/web/src/components/ui/container.tsx`
- Create: `apps/web/src/components/ui/eyebrow.tsx`
- Create: `apps/web/src/components/ui/comment.tsx`
- Create: `apps/web/src/components/ui/cursor.tsx`
- Create: `apps/web/src/components/ui/logo.tsx`
- Create: `apps/web/src/components/ui/status-pill.tsx`
- Create: `apps/web/src/components/section.tsx`

These are all server components (no `'use client'`). Each has one clear responsibility.

- [ ] **Step 1: Create `container.tsx`**

```tsx
import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

interface ContainerProps {
  children: ReactNode
  className?: string
}

export function Container({ children, className }: ContainerProps) {
  return (
    <div
      className={cn(
        'mx-auto w-full max-w-[1280px] px-[clamp(20px,4vw,56px)]',
        className,
      )}
    >
      {children}
    </div>
  )
}
```

- [ ] **Step 2: Create `eyebrow.tsx`**

The "// foo" mono label with optional accent dot (used in section heads and nav status). Lighter dark variant for the dark Team section.

```tsx
import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

interface EyebrowProps {
  children: ReactNode
  dot?: boolean
  variant?: 'light' | 'dark'
  className?: string
}

export function Eyebrow({
  children,
  dot = true,
  variant = 'light',
  className,
}: EyebrowProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 font-mono text-[12px] tracking-[0.02em]',
        variant === 'dark' ? 'text-dark-muted' : 'text-muted',
        className,
      )}
    >
      {dot && (
        <span
          aria-hidden
          className="inline-block size-[6px] rounded-full bg-accent shadow-[0_0_0_3px_rgba(0,200,83,0.12)]"
        />
      )}
      {children}
    </span>
  )
}
```

- [ ] **Step 3: Create `comment.tsx`**

```tsx
import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

interface CommentProps {
  children: ReactNode
  variant?: 'light' | 'dark'
  className?: string
}

export function Comment({
  children,
  variant = 'light',
  className,
}: CommentProps) {
  return (
    <span
      className={cn(
        'font-mono text-[13px]',
        variant === 'dark' ? 'text-dark-muted' : 'text-muted',
        className,
      )}
    >
      {children}
    </span>
  )
}
```

- [ ] **Step 4: Create `cursor.tsx`**

Pure CSS blinking cursor (no JS). Accent green by default, ink variant for the headline.

```tsx
import { cn } from '@/lib/cn'

interface CursorProps {
  variant?: 'accent' | 'ink'
  className?: string
}

export function Cursor({ variant = 'accent', className }: CursorProps) {
  return (
    <span
      aria-hidden
      className={cn(
        'inline-block h-[1em] w-[0.55em] align-[-0.12em] ml-[0.08em] animate-blink',
        variant === 'ink' ? 'bg-ink' : 'bg-accent',
        className,
      )}
    />
  )
}
```

- [ ] **Step 5: Create `logo.tsx`**

The `~/u<s>ffect.sh` wordmark, used in nav and footer. The `s` is the accent, `.sh` is muted.

```tsx
import { cn } from '@/lib/cn'

interface LogoProps {
  className?: string
}

export function Logo({ className }: LogoProps) {
  return (
    <span
      className={cn(
        'inline-flex items-baseline font-mono text-[15px] font-semibold tracking-[-0.01em]',
        className,
      )}
      aria-label="useffect.sh"
    >
      <span className="mr-[6px] text-muted">~/</span>
      <span>u</span>
      <span className="text-accent font-semibold">s</span>
      <span>ffect</span>
      <span className="text-muted">.sh</span>
    </span>
  )
}
```

- [ ] **Step 6: Create `status-pill.tsx`**

The "2 slots · Q3" pill with the pulsing dot. Dot uses `animate-pulse-dot` (defined in `@theme`).

```tsx
import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

interface StatusPillProps {
  children: ReactNode
  className?: string
}

export function StatusPill({ children, className }: StatusPillProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 border border-line px-[10px] py-[6px] font-mono text-[12px] text-muted',
        className,
      )}
    >
      <span
        aria-hidden
        className="inline-block size-[6px] rounded-full bg-accent shadow-[0_0_0_3px_rgba(0,200,83,0.15)] animate-pulse-dot"
      />
      {children}
    </span>
  )
}
```

- [ ] **Step 7: Create `section.tsx`**

A shared `<section>` wrapper used by most landing sections. Optional `dark` variant for the Team section (swaps background + text + borders). Default border-top rule.

```tsx
import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

interface SectionProps {
  id?: string
  children: ReactNode
  variant?: 'light' | 'dark'
  className?: string
  as?: 'section' | 'header' | 'footer' | 'aside'
}

export function Section({
  id,
  children,
  variant = 'light',
  className,
  as: As = 'section',
}: SectionProps) {
  return (
    <As
      id={id}
      className={cn(
        'relative border-t',
        variant === 'dark'
          ? 'bg-dark text-bg border-dark-line'
          : 'border-line',
        className,
      )}
    >
      {children}
    </As>
  )
}
```

- [ ] **Step 8: Verify typecheck**

Run:
```bash
(cd apps/web && bun run typecheck)
```
Expected: pass. None of these are imported yet, but `tsc` checks them.

---

## Task 5: Button primitive

**Files:**
- Create: `apps/web/src/components/ui/button.tsx`

The design's `.btn` with variants: default (ink bg), `ghost`, `lg`, `xl`, `invert` (for dark sections). Renders as `<a>` when `href` is provided, `<button>` otherwise. Arrow translates 3px on hover.

- [ ] **Step 1: Create `button.tsx`**

```tsx
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/cn'

type Variant = 'default' | 'ghost' | 'invert'
type Size = 'md' | 'lg' | 'xl'

interface CommonProps {
  variant?: Variant
  size?: Size
  withArrow?: boolean
  children: ReactNode
  className?: string
}

type ButtonAsAnchor = CommonProps & AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }
type ButtonAsButton = CommonProps & ButtonHTMLAttributes<HTMLButtonElement> & { href?: undefined }

export type ButtonProps = ButtonAsAnchor | ButtonAsButton

const base =
  'group inline-flex items-center gap-[10px] font-mono text-[13px] font-medium leading-none whitespace-nowrap border transition-[transform,background,color,border-color] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg'

const variants: Record<Variant, string> = {
  default:
    'bg-ink text-bg border-ink hover:bg-accent hover:text-dark hover:border-accent',
  ghost:
    'bg-transparent text-ink border-line-strong hover:border-ink',
  invert:
    'bg-bg text-ink border-bg hover:bg-accent hover:text-dark hover:border-accent',
}

const sizes: Record<Size, string> = {
  md: 'px-4 py-3 text-[13px]',
  lg: 'px-[22px] py-[18px] text-[14px]',
  xl: 'px-[26px] py-[22px] text-[15px]',
}

export function Button(props: ButtonProps) {
  const {
    variant = 'default',
    size = 'md',
    withArrow = true,
    children,
    className,
    ...rest
  } = props

  const cls = cn(base, variants[variant], sizes[size], className)
  const inner = (
    <>
      {children}
      {withArrow && (
        <span
          aria-hidden
          className="inline-block transition-transform duration-[250ms] group-hover:translate-x-[3px]"
        >
          →
        </span>
      )}
    </>
  )

  if ('href' in rest && rest.href !== undefined) {
    return (
      <a {...rest} className={cls}>
        {inner}
      </a>
    )
  }
  return (
    <button type="button" {...rest} className={cls}>
      {inner}
    </button>
  )
}
```

- [ ] **Step 2: Verify typecheck**

Run:
```bash
(cd apps/web && bun run typecheck)
```
Expected: pass.

---

## Task 6: CodeBlock primitive (terminal chrome + token spans)

**Files:**
- Create: `apps/web/src/components/ui/code-block.tsx`

A reusable terminal-styled code block with traffic-light dots, a title bar, and an arbitrary code children slot. Used by the hero's `us.ts` snippet (Task 8) and the team's `package.json` block (Task 15 — though Team uses its own `package-block` wrapper for the JSON-specific styling, both share this base).

- [ ] **Step 1: Create `code-block.tsx`**

```tsx
import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

interface CodeBlockProps {
  title: ReactNode
  /** Right-side status, e.g. "● live" */
  status?: ReactNode
  children: ReactNode
  variant?: 'light' | 'dark'
  className?: string
  /** aria-label for the wrapper */
  label?: string
}

export function CodeBlock({
  title,
  status,
  children,
  variant = 'light',
  className,
  label,
}: CodeBlockProps) {
  const isDark = variant === 'dark'
  return (
    <div
      aria-label={label}
      className={cn(
        'overflow-hidden border',
        isDark
          ? 'bg-dark-2 text-bg border-dark-line'
          : 'bg-bg-2 border-line',
        className,
      )}
    >
      <header
        className={cn(
          'flex items-center justify-between gap-3 border-b px-3 py-2 font-mono text-[12px]',
          isDark ? 'border-dark-line text-dark-muted' : 'border-line text-muted',
        )}
      >
        <div className="flex items-center gap-[14px]">
          <div className="flex items-center gap-[6px]" aria-hidden>
            <span className="inline-block size-[10px] rounded-full bg-[#FF5F57]" />
            <span className="inline-block size-[10px] rounded-full bg-[#FEBC2E]" />
            <span className="inline-block size-[10px] rounded-full bg-[#28C840]" />
          </div>
          <span>{title}</span>
        </div>
        {status && <span>{status}</span>}
      </header>
      <pre
        className={cn(
          'overflow-x-auto px-4 py-3 font-mono text-[13px] leading-[1.7]',
          isDark ? 'text-bg' : 'text-ink',
        )}
      >
        <code>{children}</code>
      </pre>
    </div>
  )
}
```

- [ ] **Step 2: Verify typecheck**

Run:
```bash
(cd apps/web && bun run typecheck)
```
Expected: pass.

---

## Task 7: ConsoleEgg client island + mount in layout

**Files:**
- Create: `apps/web/src/components/console-egg.client.tsx`
- Modify: `apps/web/src/app/layout.tsx`

- [ ] **Step 1: Create `console-egg.client.tsx`**

The easter-egg console.log from `design/useffect.sh.html` lines 1685–1689, re-implemented as a one-shot effect.

```tsx
'use client'

import { useEffect } from 'react'

const GREEN = 'color:#00C853; font-family: Geist Mono, monospace; font-size:13px;'
const MUTED = 'color:#9A9A93; font-family: Geist Mono, monospace; font-size:12px;'

export function ConsoleEgg() {
  useEffect(() => {
    // biome-ignore lint/suspicious/noConsole: intentional easter egg
    console.log("%c// useffect.sh — assembled when your code doesn't.", GREEN)
    // biome-ignore lint/suspicious/noConsole: intentional easter egg
    console.log("%c// You're inspecting. We like you. careers@useffect.sh", MUTED)
  }, [])

  return null
}
```

Note: If Biome's `noConsole` rule isn't enabled in our config, the `biome-ignore` comments are harmless. If it IS enabled and these still flag, change the suppression directive to whatever the linter expects (verify with `bun run lint`).

- [ ] **Step 2: Mount it in `layout.tsx`**

Add the import and render `<ConsoleEgg />` inside `<body>`, after `<SpeedInsights />`.

```tsx
import { ConsoleEgg } from '@/components/console-egg.client'
// ...

<body className={...}>
  {children}
  <Analytics />
  <SpeedInsights />
  <ConsoleEgg />
</body>
```

- [ ] **Step 3: Verify gate**

Run:
```bash
bun run lint && bun run typecheck && bun run build
```
Expected: pass.

---

## Task 8: Hero feature (replaces the teaser homepage)

**Files:**
- Create: `apps/web/src/features/hero/components/hero.tsx`
- Create: `apps/web/src/features/hero/components/hero-headline.tsx`
- Create: `apps/web/src/features/hero/components/hero-terminal.tsx`
- Create: `apps/web/src/features/hero/components/hero-belt.tsx`
- Modify: `apps/web/src/app/page.tsx`
- Modify: `apps/web/src/app/page.test.tsx`

Reference: `design/useffect.sh.html` lines 1020–1090 for hero markup and copy. Reference lines 200–340 (hero CSS) for exact styling — translate to Tailwind utilities. All four components are server components.

- [ ] **Step 1: Create `hero-headline.tsx`**

Three lines: `WE UNFUCK`, `THE FUCK`, `CODE` + ink-variant cursor. The middle line wraps `FUCK` in `.strike > .word` for the strike-through (CSS lives in `globals.css` Task 2).

```tsx
import { Cursor } from '@/components/ui/cursor'

export function HeroHeadline() {
  return (
    <h1 className="font-sans text-[clamp(56px,9vw,128px)] font-medium leading-[0.96] tracking-[-0.03em] text-ink">
      <span className="block">
        WE <span className="text-accent">UN</span>FUCK
      </span>
      <span className="block">
        THE{' '}
        <span className="strike">
          <span className="word">FUCK</span>
        </span>
      </span>
      <span className="block">
        CODE
        <Cursor variant="ink" />
      </span>
    </h1>
  )
}
```

- [ ] **Step 2: Create `hero-terminal.tsx`**

Wraps `<CodeBlock>` and renders the `us.ts` snippet. The exact code text is from `design/useffect.sh.html` line 1062 (a single packed line of `<span>` tokens). Re-format as readable JSX line-by-line. Use the syntax-token classes (`.tok-c`, `.tok-k`, `.tok-fn`, `.tok-p`, `.tok-s`, `.tok-us`) — they are defined in `globals.css` Task 2.

```tsx
import { CodeBlock } from '@/components/ui/code-block'
import { Cursor } from '@/components/ui/cursor'

export function HeroTerminal() {
  return (
    <CodeBlock
      label="useEffect code block"
      title={
        <>
          ~/app/<b>src/effects/us.ts</b>
        </>
      }
      status={<span className="text-accent">● live</span>}
    >
      <span className="block">
        <span className="tok-c">{'// when your code mounts us, the effect runs.'}</span>
      </span>
      <span className="block">
        <span className="tok-k">import</span> <span className="tok-p">{'{'}</span>{' '}
        useEffect <span className="tok-p">{'}'}</span> <span className="tok-k">from</span>{' '}
        <span className="tok-s">"react"</span>
        <span className="tok-p">;</span>
      </span>
      <span className="block">
        <span className="tok-k">import</span> <span className="tok-p">{'{'}</span>{' '}
        <span className="tok-us">us</span> <span className="tok-p">{'}'}</span>{' '}
        <span className="tok-k">from</span> <span className="tok-s">"useffect.sh"</span>
        <span className="tok-p">;</span>
      </span>
      <span className="block">&nbsp;</span>
      <span className="block">
        <span className="tok-k">export function</span>{' '}
        <span className="tok-fn">App</span>
        <span className="tok-p">()</span> <span className="tok-p">{'{'}</span>
      </span>
      <span className="block pl-4">
        <span className="tok-fn">useEffect</span>
        <span className="tok-p">(()</span> <span className="tok-k">=&gt;</span>{' '}
        <span className="tok-p">{'{'}</span>
      </span>
      <span className="block pl-8">
        <span className="tok-c">{'// mounting elite squad…'}</span>
      </span>
      <span className="block pl-8">
        <span className="tok-k">const</span> ship <span className="tok-p">=</span>{' '}
        <span className="tok-us">us</span>
        <span className="tok-p">.</span>
        <span className="tok-fn">unfuck</span>
        <span className="tok-p">(</span>yourCode<span className="tok-p">);</span>
      </span>
      <span className="block pl-8">
        <span className="tok-k">return</span> <span className="tok-p">()</span>{' '}
        <span className="tok-k">=&gt;</span> ship<span className="tok-p">.</span>
        <span className="tok-fn">cleanly</span>
        <span className="tok-p">();</span>{' '}
        <span className="tok-c">{'// no debt, full docs'}</span>
      </span>
      <span className="block pl-4">
        <span className="tok-p">{'},'}</span>{' '}
        <span className="tok-p">[</span>
        <span className="tok-us">us</span>
        <span className="tok-p">]);</span>
      </span>
      <span className="block">
        <span className="tok-p">{'}'}</span>
        <Cursor />
      </span>
    </CodeBlock>
  )
}
```

- [ ] **Step 3: Create `hero-belt.tsx`**

The 4-cell stats strip from `design/useffect.sh.html` lines 1071–1088.

```tsx
const cells = [
  { label: '// crash-free median', value: '99.7% across 14 shipped apps', accent: '99.7%' },
  { label: '// time to first prod ship', value: '9 days · median' },
  { label: '// rate', value: '$240–320 / hr · senior only' },
  { label: '// stack', value: 'RN 0.74+ · Expo SDK 51 · New Arch' },
] as const

export function HeroBelt() {
  return (
    <div className="grid grid-cols-1 gap-6 border-t border-line pt-8 sm:grid-cols-2 lg:grid-cols-4">
      {cells.map((c) => (
        <div key={c.label} className="flex flex-col gap-2">
          <span className="font-mono text-[12px] text-muted">{c.label}</span>
          <span className="font-mono text-[14px] text-ink">
            {c.accent ? (
              <>
                <span className="text-accent">{c.accent}</span>
                {c.value.replace(c.accent, '')}
              </>
            ) : (
              c.value
            )}
          </span>
        </div>
      ))}
    </div>
  )
}
```

- [ ] **Step 4: Create `hero.tsx`**

The full hero shell — meta strip + headline + sub copy + actions + terminal + belt. Reference `design/useffect.sh.html` lines 1020–1090 for exact structure.

```tsx
import { Container } from '@/components/ui/container'
import { Button } from '@/components/ui/button'
import { Eyebrow } from '@/components/ui/eyebrow'
import { Comment } from '@/components/ui/comment'
import { HeroHeadline } from './hero-headline'
import { HeroTerminal } from './hero-terminal'
import { HeroBelt } from './hero-belt'

export function Hero() {
  return (
    <section className="border-b border-line py-[88px] pb-[120px]">
      <Container>
        <div className="grid grid-cols-1 gap-[56px]">
          {/* meta strip */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Eyebrow>React Native Expert on Demand</Eyebrow>
              <Comment>// v4.2.0 · stable</Comment>
            </div>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-1 font-mono text-[13px] text-muted">
              <span>
                <b className="text-ink">5</b> engineers
              </span>
              <span>
                <b className="text-ink">11.4M</b> downloads / mo on shipped OSS
              </span>
              <span>
                <b className="text-ink">Series A/B</b> only
              </span>
            </div>
          </div>

          <HeroHeadline />

          <div className="mt-4 grid grid-cols-1 gap-8 lg:grid-cols-2 lg:items-start">
            <div className="flex flex-col gap-8">
              <p className="text-[18px] leading-[1.5] text-ink">
                <b>The React Native team you wish you had.</b> A senior collective parachuted into
                apps that are on fire — or apps that need to be built right the first time.
                Series&nbsp;A/B startups only.
              </p>
              <div className="flex flex-wrap items-center gap-4">
                <Button href="#contact" size="lg">
                  Trigger the effect
                </Button>
                <Button href="#work" size="lg" variant="ghost">
                  See renders
                </Button>
                <Comment>// avg. response &lt; 6h, Mon–Fri</Comment>
              </div>
            </div>

            <div className="flex flex-col gap-[14px]">
              <HeroTerminal />
              <div className="flex items-center justify-between">
                <Comment>// We assemble when your code doesn't.</Comment>
                <Comment>
                  [ deps: <span className="text-accent font-semibold">us</span> ]
                </Comment>
              </div>
            </div>
          </div>

          <HeroBelt />
        </div>
      </Container>
    </section>
  )
}
```

- [ ] **Step 5: Update `page.tsx` to render Hero**

Replace the teaser. Page is now a clean composition root.

```tsx
import { Hero } from '@/features/hero/components/hero'

export default function Home() {
  return (
    <main id="main">
      <Hero />
    </main>
  )
}
```

- [ ] **Step 6: Update `page.test.tsx` so the smoke test asserts the new hero**

Replace the file entirely:

```tsx
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import Home from './page'

describe('Home', () => {
  it('renders the main landmark', () => {
    render(<Home />)
    expect(screen.getByRole('main')).toBeInTheDocument()
  })

  it('renders the hero headline', () => {
    render(<Home />)
    // The headline spans multiple text nodes — assert the distinctive accent word.
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/UNFUCK/)
  })
})
```

- [ ] **Step 7: Verify gate**

Run:
```bash
bun run lint && bun run typecheck && bun run test:ci && bun run build
```
Expected: all pass. Optionally `(cd apps/web && timeout 20 bun run dev) || true` and open localhost:3000 to confirm the hero renders.

---

## Task 9: Nav feature (server shell, no scroll state yet)

**Files:**
- Create: `apps/web/src/features/nav/components/nav.tsx`
- Modify: `apps/web/src/app/page.tsx`

Reference: `design/useffect.sh.html` lines 999–1015. Sticky positioning. The scrolled border state is added in Task 10.

- [ ] **Step 1: Create `nav.tsx`**

```tsx
import { Container } from '@/components/ui/container'
import { Button } from '@/components/ui/button'
import { Logo } from '@/components/ui/logo'
import { StatusPill } from '@/components/ui/status-pill'

export function Nav() {
  return (
    <header
      id="nav"
      className="sticky top-0 z-50 bg-bg/80 backdrop-blur-md backdrop-saturate-150 border-b border-transparent data-[scrolled=true]:border-line transition-colors duration-200"
    >
      <Container>
        <div className="flex h-16 items-center justify-between gap-4">
          <a href="#" className="shrink-0">
            <Logo />
          </a>
          <nav className="hidden items-center gap-7 font-mono text-[13px] md:flex">
            <a href="#work" className="text-muted hover:text-ink transition-colors">Work</a>
            <a href="#services" className="text-muted hover:text-ink transition-colors">Services</a>
            <a href="#team" className="text-muted hover:text-ink transition-colors">Team</a>
            <a href="#writing" className="text-muted hover:text-ink transition-colors">Writing</a>
          </nav>
          <div className="flex items-center gap-[18px]">
            <StatusPill className="hidden sm:inline-flex">2 slots · Q3</StatusPill>
            <Button href="#contact">Trigger the effect</Button>
          </div>
        </div>
      </Container>
    </header>
  )
}
```

- [ ] **Step 2: Add `<Nav />` to `page.tsx` (above `<Hero />`, outside main)**

```tsx
import { Hero } from '@/features/hero/components/hero'
import { Nav } from '@/features/nav/components/nav'

export default function Home() {
  return (
    <>
      <Nav />
      <main id="main">
        <Hero />
      </main>
    </>
  )
}
```

- [ ] **Step 3: Verify gate**

```bash
bun run lint && bun run typecheck && bun run test:ci && bun run build
```
Expected: pass.

---

## Task 10: Nav scroll-state hook + convert nav to client component

**Files:**
- Create: `apps/web/src/features/nav/hooks/use-nav-scroll-state.client.ts`
- Modify: `apps/web/src/features/nav/components/nav.tsx`

The `<Nav>` shell itself becomes the client component — its markup is small and self-contained, so wrapping it in a separate client island would be a hack with no benefit. The hook handles the scroll listener; `nav.tsx` consumes it and reflects state as a data attribute on the `<header>`.

- [ ] **Step 1: Create the hook**

`apps/web/src/features/nav/hooks/use-nav-scroll-state.client.ts`:

```ts
'use client'

import { useEffect, useState } from 'react'

const THRESHOLD_PX = 8

/** Returns true once the page has scrolled past the threshold. */
export function useNavScrollState(): boolean {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > THRESHOLD_PX)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return scrolled
}
```

- [ ] **Step 2: Convert `nav.tsx` to a client component that uses the hook**

Replace `apps/web/src/features/nav/components/nav.tsx` with:

```tsx
'use client'

import { Container } from '@/components/ui/container'
import { Button } from '@/components/ui/button'
import { Logo } from '@/components/ui/logo'
import { StatusPill } from '@/components/ui/status-pill'
import { useNavScrollState } from '../hooks/use-nav-scroll-state.client'

export function Nav() {
  const scrolled = useNavScrollState()
  return (
    <header
      id="nav"
      data-scrolled={scrolled || undefined}
      className="sticky top-0 z-50 bg-bg/80 backdrop-blur-md backdrop-saturate-150 border-b border-transparent data-[scrolled]:border-line transition-colors duration-200"
    >
      <Container>
        <div className="flex h-16 items-center justify-between gap-4">
          <a href="#" className="shrink-0">
            <Logo />
          </a>
          <nav className="hidden items-center gap-7 font-mono text-[13px] md:flex">
            <a href="#work" className="text-muted hover:text-ink transition-colors">Work</a>
            <a href="#services" className="text-muted hover:text-ink transition-colors">Services</a>
            <a href="#team" className="text-muted hover:text-ink transition-colors">Team</a>
            <a href="#writing" className="text-muted hover:text-ink transition-colors">Writing</a>
          </nav>
          <div className="flex items-center gap-[18px]">
            <StatusPill className="hidden sm:inline-flex">2 slots · Q3</StatusPill>
            <Button href="#contact">Trigger the effect</Button>
          </div>
        </div>
      </Container>
    </header>
  )
}
```

The Tailwind selector `data-[scrolled]:border-line` applies when the attribute is present (we set it to `undefined` when false so React omits it). This keeps the markup clean.

- [ ] **Step 3: Verify gate**

```bash
bun run lint && bun run typecheck && bun run test:ci && bun run build
```
Expected: pass. Manually verify in dev that the nav gets a bottom border on scroll.

---

## Task 11: Services feature (Two Doors)

**Files:**
- Create: `apps/web/src/features/services/data.ts`
- Create: `apps/web/src/features/services/components/door.tsx`
- Create: `apps/web/src/features/services/components/services.tsx`
- Modify: `apps/web/src/app/page.tsx`

Reference: `design/useffect.sh.html` lines 1096–1143.

- [ ] **Step 1: Create `services/data.ts`**

```ts
export interface DoorItem {
  idx: string
  label: string
  meta: string
}

export interface Door {
  tag: string
  glyph: string
  title: string
  quote: string
  items: DoorItem[]
  footPrice: string
  ctaHref: string
  ctaLabel: string
}

export const doors: readonly Door[] = [
  {
    tag: 'rescue.ts',
    glyph: '!',
    title: 'Rescue.',
    quote: '"We unfuck the fucked code."',
    items: [
      { idx: '01', label: 'Crashes & ANRs in production', meta: 'P0' },
      { idx: '02', label: 'Cold start & runtime performance', meta: 'P0' },
      { idx: '03', label: 'New Architecture migration (Fabric · TM)', meta: 'P1' },
      { idx: '04', label: 'Bundle size & OTA hygiene', meta: 'P1' },
      { idx: '05', label: 'Native modules & bridging hell', meta: 'P1' },
      { idx: '06', label: 'Release pipeline & EAS', meta: 'P2' },
    ],
    footPrice: '// engages in 5 business days · 4–10 wk scope',
    ctaHref: '#contact',
    ctaLabel: 'Trigger rescue',
  },
  {
    tag: 'build.ts',
    glyph: '+',
    title: 'Build.',
    quote: '"We build the world a better app."',
    items: [
      { idx: '01', label: 'MVP & V1 from zero', meta: '8–14 wk' },
      { idx: '02', label: 'Full rebuilds (legacy → Expo + RN)', meta: '10–20 wk' },
      { idx: '03', label: 'Design system & component library', meta: '4–8 wk' },
      { idx: '04', label: 'Native features (BLE · camera · ML)', meta: 'on scope' },
      { idx: '05', label: 'App Store & Play submission', meta: 'included' },
      { idx: '06', label: 'Handoff to your internal team', meta: 'included' },
    ],
    footPrice: '// kickoff in 2 weeks · fixed-scope phases',
    ctaHref: '#contact',
    ctaLabel: 'Trigger build',
  },
] as const
```

- [ ] **Step 2: Create `door.tsx`**

```tsx
import type { Door } from '../data'
import { Button } from '@/components/ui/button'

interface DoorProps {
  door: Door
}

export function Door({ door }: DoorProps) {
  return (
    <article className="flex flex-col gap-6 border border-line bg-bg-2 p-8">
      <span className="inline-flex items-center gap-2 font-mono text-[12px] text-muted">
        <span className="inline-flex size-4 items-center justify-center border border-line-strong text-ink">
          {door.glyph}
        </span>
        {door.tag}
      </span>
      <h3 className="font-sans text-[44px] font-medium leading-none tracking-[-0.02em] text-ink">
        {door.title}
      </h3>
      <p className="font-mono text-[14px] text-muted">{door.quote}</p>
      <ul className="flex flex-col">
        {door.items.map((item) => (
          <li
            key={item.idx}
            className="grid grid-cols-[40px_1fr_auto] items-center gap-3 border-t border-line py-3 font-mono text-[13px]"
          >
            <span className="text-muted">{item.idx}</span>
            <span className="text-ink">{item.label}</span>
            <span className="text-muted">{item.meta}</span>
          </li>
        ))}
      </ul>
      <div className="flex flex-wrap items-center justify-between gap-4 border-t border-line pt-6">
        <span className="font-mono text-[12px] text-muted">{door.footPrice}</span>
        <Button href={door.ctaHref}>{door.ctaLabel}</Button>
      </div>
    </article>
  )
}
```

- [ ] **Step 3: Create `services.tsx`**

```tsx
import { Container } from '@/components/ui/container'
import { Section } from '@/components/section'
import { Eyebrow } from '@/components/ui/eyebrow'
import { Door } from './door'
import { doors } from '../data'

export function Services() {
  return (
    <Section id="services" className="py-[120px]">
      <Container>
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_1fr]">
          <div>
            <Eyebrow>// services.ts</Eyebrow>
            <h2 className="mt-6 font-sans text-[56px] font-medium leading-[1.05] tracking-[-0.025em] text-ink">
              Two doors.<br />Pick the one on fire.
            </h2>
          </div>
          <p className="self-end text-[16px] leading-[1.55] text-muted">
            We don't do retainers, sprints-as-a-service, or "audits" that end in a PDF.
            We do two things, and we do them at the level you can't hire full-time for.
          </p>
        </div>
        <div className="mt-16 grid grid-cols-1 gap-8 lg:grid-cols-2">
          {doors.map((door) => (
            <Door key={door.tag} door={door} />
          ))}
        </div>
      </Container>
    </Section>
  )
}
```

- [ ] **Step 4: Add `<Services />` to `page.tsx`**

```tsx
import { Hero } from '@/features/hero/components/hero'
import { Nav } from '@/features/nav/components/nav'
import { Services } from '@/features/services/components/services'

export default function Home() {
  return (
    <>
      <Nav />
      <main id="main">
        <Hero />
        <Services />
      </main>
    </>
  )
}
```

- [ ] **Step 5: Verify gate**

```bash
bun run lint && bun run typecheck && bun run test:ci && bun run build
```
Expected: pass.

---

## Task 12: Effect feature (static — default `after` state, no interactivity yet)

**Files:**
- Create: `apps/web/src/features/effect/data.ts`
- Create: `apps/web/src/features/effect/components/effect.tsx`
- Modify: `apps/web/src/app/page.tsx`

Reference: `design/useffect.sh.html` lines 1150–1222. We render everything as a static "after" view. Task 13 adds interactivity.

- [ ] **Step 1: Create `effect/data.ts`**

```ts
export interface MetricRow {
  name: string
  small: string
  before: { value: string; unit: string }
  after: { value: string; unit: string }
  delta: string
}

export const metrics: readonly MetricRow[] = [
  {
    name: 'Crash-free sessions',
    small: 'iOS + Android, 30-day',
    before: { value: '94.2', unit: '%' },
    after: { value: '99.7', unit: '%' },
    delta: '+5.5pt',
  },
  {
    name: 'Cold start (p75)',
    small: 'device median, release build',
    before: { value: '4.1', unit: 's' },
    after: { value: '1.2', unit: 's' },
    delta: '−71%',
  },
  {
    name: 'App size',
    small: 'download size, iOS',
    before: { value: '180', unit: 'MB' },
    after: { value: '62', unit: 'MB' },
    delta: '−66%',
  },
  {
    name: 'Store rating',
    small: '30-day rolling, both stores',
    before: { value: '3.2', unit: '★' },
    after: { value: '4.7', unit: '★' },
    delta: '+1.5',
  },
  {
    name: 'CI build time',
    small: 'EAS · clean cache',
    before: { value: '24', unit: 'min' },
    after: { value: '6', unit: 'min' },
    delta: '−75%',
  },
  {
    name: 'JS bundle',
    small: 'after Hermes + treeshake',
    before: { value: '8.4', unit: 'MB' },
    after: { value: '2.1', unit: 'MB' },
    delta: '−75%',
  },
] as const
```

- [ ] **Step 2: Create `effect.tsx` (static version)**

```tsx
import { Container } from '@/components/ui/container'
import { Section } from '@/components/section'
import { Eyebrow } from '@/components/ui/eyebrow'
import { metrics } from '../data'

export function Effect() {
  return (
    <Section id="effect" className="py-[120px]">
      <Container>
        <div className="flex flex-wrap items-start justify-between gap-8">
          <div className="max-w-[640px]">
            <Eyebrow>// before vs. after</Eyebrow>
            <h2 className="mt-6 font-sans text-[56px] font-medium leading-[1.05] tracking-[-0.025em] text-ink">
              The <span className="text-accent">us</span> effect.
            </h2>
            <p className="mt-[18px] max-w-[520px] text-[16px] leading-[1.5] text-muted">
              Every engagement leaves a measurable trace. Same app, same users, same metrics
              — before we mount, and after we unmount. Median across the last 8 rescues.
            </p>
          </div>
          {/* Static placeholder for the toggle. Task 13 replaces this with an interactive component. */}
          <div
            className="inline-flex border border-line font-mono text-[12px]"
            role="tablist"
            aria-label="before vs after"
          >
            <button
              type="button"
              className="px-4 py-2 text-muted"
              role="tab"
              aria-selected="false"
            >
              before
            </button>
            <button
              type="button"
              className="px-4 py-2 bg-ink text-bg"
              role="tab"
              aria-selected="true"
            >
              after
            </button>
          </div>
        </div>

        <div className="mt-16 border-t border-line">
          <div className="grid grid-cols-[1.4fr_1fr_1fr_1fr] gap-4 border-b border-line py-3 font-mono text-[12px] text-muted">
            <span>// metric</span>
            <span>before</span>
            <span>after</span>
            <span className="text-right">delta</span>
          </div>
          {metrics.map((m) => (
            <div
              key={m.name}
              className="grid grid-cols-[1.4fr_1fr_1fr_1fr] items-baseline gap-4 border-b border-line py-5"
            >
              <div className="flex flex-col">
                <span className="text-[15px] text-ink">{m.name}</span>
                <small className="font-mono text-[12px] text-muted">{m.small}</small>
              </div>
              <div className="font-sans text-[28px] text-muted-2">
                {m.before.value}
                <span className="ml-1 text-[14px]">{m.before.unit}</span>
              </div>
              <div className="font-sans text-[28px] text-ink">
                {m.after.value}
                <span className="ml-1 text-[14px]">{m.after.unit}</span>
              </div>
              <div className="text-right font-mono text-[14px] text-accent">{m.delta}</div>
            </div>
          ))}
        </div>

        <div className="mt-8 flex flex-wrap justify-between gap-4 font-mono text-[12px] text-muted">
          <span>// numbers are real, app names redacted under NDA. detailed reports on request.</span>
          <span className="inline-flex items-center gap-2">
            <span aria-hidden className="inline-block size-2 bg-accent" />
            after = post-unmount, ≥30 days in production
          </span>
        </div>
      </Container>
    </Section>
  )
}
```

- [ ] **Step 3: Add `<Effect />` to `page.tsx`**

```tsx
import { Hero } from '@/features/hero/components/hero'
import { Nav } from '@/features/nav/components/nav'
import { Services } from '@/features/services/components/services'
import { Effect } from '@/features/effect/components/effect'

export default function Home() {
  return (
    <>
      <Nav />
      <main id="main">
        <Hero />
        <Services />
        <Effect />
      </main>
    </>
  )
}
```

- [ ] **Step 4: Verify gate**

```bash
bun run lint && bun run typecheck && bun run test:ci && bun run build
```
Expected: pass.

---

## Task 13: Effect toggle client island (TDD)

**Files:**
- Create: `apps/web/src/features/effect/components/effect-toggle.client.tsx`
- Create: `apps/web/src/features/effect/components/effect-toggle.test.tsx`
- Modify: `apps/web/src/features/effect/components/effect.tsx`

Replace the static toggle with a real interactive one. TDD genuinely applies: behavior is testable.

- [ ] **Step 1: Write the failing test `effect-toggle.test.tsx`**

```tsx
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { EffectToggle } from './effect-toggle.client'

describe('EffectToggle', () => {
  it("defaults to 'after'", () => {
    render(<EffectToggle />)
    expect(screen.getByRole('tab', { name: 'after' })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByRole('tab', { name: 'before' })).toHaveAttribute('aria-selected', 'false')
  })

  it("flips to 'before' on click", () => {
    render(<EffectToggle />)
    fireEvent.click(screen.getByRole('tab', { name: 'before' }))
    expect(screen.getByRole('tab', { name: 'before' })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByRole('tab', { name: 'after' })).toHaveAttribute('aria-selected', 'false')
  })

  it('navigates with arrow keys', () => {
    render(<EffectToggle />)
    const before = screen.getByRole('tab', { name: 'before' })
    const after = screen.getByRole('tab', { name: 'after' })

    after.focus()
    fireEvent.keyDown(after, { key: 'ArrowLeft' })
    expect(before).toHaveAttribute('aria-selected', 'true')

    fireEvent.keyDown(before, { key: 'ArrowRight' })
    expect(after).toHaveAttribute('aria-selected', 'true')
  })
})
```

- [ ] **Step 2: Run the test — expect failure (component not yet implemented)**

```bash
(cd apps/web && bun x vitest run src/features/effect/components/effect-toggle.test.tsx)
```
Expected: FAIL — `Cannot find module ./effect-toggle.client`.

- [ ] **Step 3: Implement `effect-toggle.client.tsx`**

```tsx
'use client'

import { useState, useRef, type KeyboardEvent } from 'react'
import { cn } from '@/lib/cn'

type State = 'before' | 'after'

interface EffectToggleProps {
  /** Called when the state changes — lets a parent reflect it elsewhere. */
  onChange?: (state: State) => void
}

const STATES: readonly State[] = ['before', 'after'] as const

export function EffectToggle({ onChange }: EffectToggleProps) {
  const [state, setState] = useState<State>('after')
  const tabsRef = useRef<Record<State, HTMLButtonElement | null>>({
    before: null,
    after: null,
  })

  const setAndNotify = (next: State) => {
    setState(next)
    onChange?.(next)
  }

  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return
    e.preventDefault()
    const idx = STATES.indexOf(state)
    const nextIdx = e.key === 'ArrowRight'
      ? (idx + 1) % STATES.length
      : (idx - 1 + STATES.length) % STATES.length
    const next = STATES[nextIdx] as State
    setAndNotify(next)
    tabsRef.current[next]?.focus()
  }

  return (
    <div
      className="inline-flex border border-line font-mono text-[12px]"
      role="tablist"
      aria-label="before vs after"
    >
      {STATES.map((s) => {
        const selected = state === s
        return (
          <button
            key={s}
            ref={(el) => { tabsRef.current[s] = el }}
            type="button"
            role="tab"
            aria-selected={selected}
            tabIndex={selected ? 0 : -1}
            onClick={() => setAndNotify(s)}
            onKeyDown={onKeyDown}
            className={cn(
              'px-4 py-2 transition-colors',
              selected ? 'bg-ink text-bg' : 'text-muted hover:text-ink',
            )}
          >
            {s}
          </button>
        )
      })}
    </div>
  )
}
```

- [ ] **Step 4: Run the test — expect pass**

```bash
(cd apps/web && bun x vitest run src/features/effect/components/effect-toggle.test.tsx)
```
Expected: PASS — 3 tests pass.

- [ ] **Step 5: Replace the static toggle in `effect.tsx` with the interactive one**

The current Effect section also needs to show/hide the `before` and `after` columns based on state, plus drive a label on the data rows. The cleanest split: lift state into a thin client wrapper that wraps the Effect section content, OR pass state down via a small client component for the metrics table too.

We'll go with: convert `effect.tsx` to a client component that owns state and renders both the toggle and the metrics table. This is the simplest correct architecture for this section. The static markup we wrote in Task 12 becomes the body, with `data-state={state}` on the wrapper driving column visibility.

Replace `apps/web/src/features/effect/components/effect.tsx`:

```tsx
'use client'

import { useState } from 'react'
import { Container } from '@/components/ui/container'
import { Section } from '@/components/section'
import { Eyebrow } from '@/components/ui/eyebrow'
import { metrics } from '../data'
import { EffectToggle } from './effect-toggle.client'
import { cn } from '@/lib/cn'

type State = 'before' | 'after'

export function Effect() {
  const [state, setState] = useState<State>('after')
  const isAfter = state === 'after'

  return (
    <Section id="effect" className="py-[120px]">
      <Container>
        <div className="flex flex-wrap items-start justify-between gap-8">
          <div className="max-w-[640px]">
            <Eyebrow>// before vs. after</Eyebrow>
            <h2 className="mt-6 font-sans text-[56px] font-medium leading-[1.05] tracking-[-0.025em] text-ink">
              The <span className="text-accent">us</span> effect.
            </h2>
            <p className="mt-[18px] max-w-[520px] text-[16px] leading-[1.5] text-muted">
              Every engagement leaves a measurable trace. Same app, same users, same metrics
              — before we mount, and after we unmount. Median across the last 8 rescues.
            </p>
          </div>
          <EffectToggle onChange={setState} />
        </div>

        <div className="mt-16 border-t border-line">
          <div className="grid grid-cols-[1.4fr_1fr_1fr_1fr] gap-4 border-b border-line py-3 font-mono text-[12px] text-muted">
            <span>// metric</span>
            <span>before</span>
            <span>after</span>
            <span className="text-right">delta</span>
          </div>
          {metrics.map((m) => (
            <div
              key={m.name}
              className="grid grid-cols-[1.4fr_1fr_1fr_1fr] items-baseline gap-4 border-b border-line py-5"
            >
              <div className="flex flex-col">
                <span className="text-[15px] text-ink">{m.name}</span>
                <small className="font-mono text-[12px] text-muted">{m.small}</small>
              </div>
              <div className={cn(
                'font-sans text-[28px] transition-colors',
                isAfter ? 'text-muted-2' : 'text-ink',
              )}>
                {m.before.value}
                <span className="ml-1 text-[14px]">{m.before.unit}</span>
              </div>
              <div className={cn(
                'font-sans text-[28px] transition-colors',
                isAfter ? 'text-ink' : 'text-muted-2',
              )}>
                {m.after.value}
                <span className="ml-1 text-[14px]">{m.after.unit}</span>
              </div>
              <div className="text-right font-mono text-[14px] text-accent">{m.delta}</div>
            </div>
          ))}
        </div>

        <div className="mt-8 flex flex-wrap justify-between gap-4 font-mono text-[12px] text-muted">
          <span>// numbers are real, app names redacted under NDA. detailed reports on request.</span>
          <span className="inline-flex items-center gap-2">
            <span aria-hidden className="inline-block size-2 bg-accent" />
            after = post-unmount, ≥30 days in production
          </span>
        </div>
      </Container>
    </Section>
  )
}
```

- [ ] **Step 6: Verify gate**

```bash
bun run lint && bun run typecheck && bun run test:ci && bun run build
```
Expected: all pass. Test count goes up by 3.

---

## Task 14: Missions feature (Recent renders)

**Files:**
- Create: `apps/web/src/features/missions/data.ts`
- Create: `apps/web/src/features/missions/components/mission-card.tsx`
- Create: `apps/web/src/features/missions/components/missions.tsx`
- Modify: `apps/web/src/app/page.tsx`

Reference: `design/useffect.sh.html` lines 1228–1361. Six case studies.

- [ ] **Step 1: Create `missions/data.ts`**

```ts
export interface MissionResult {
  num: string
  /** The accent-highlighted part of the number (substring of `num`). Optional. */
  highlight?: string
  label: string
}

export interface Mission {
  code: string
  duration: string
  client: string
  clientSmall: string
  crit: string
  brief: string
  results: readonly [MissionResult, MissionResult]
}

export const missions: readonly Mission[] = [
  {
    code: 'M-014 / reanimate',
    duration: '2025 · 7 weeks · 2 engineers',
    client: 'Series B neobank',
    clientSmall: '4.2M MAU · Brazil + MX',
    crit: 'P0 · IN-PROD CRISIS',
    brief:
      'Apple flagged the app for excessive crashes 72h before earnings. JSC heap fragmenting under transaction lists. We migrated to Hermes, rewrote the list virtualization, and shipped under deadline.',
    results: [
      { num: '94.2% → 99.7%', highlight: '99.7%', label: 'crash-free, 14 days post-ship' },
      { num: '−3.4×', highlight: '3.4×', label: 'cold start on mid-tier Android' },
    ],
  },
  {
    code: 'M-011 / coldstart-zero',
    duration: '2025 · 5 weeks · 1 engineer',
    client: 'Vertical-video social',
    clientSmall: 'Series A · 880K DAU',
    crit: 'P0 · RETENTION CLIFF',
    brief:
      'D1 retention falling 9 points behind benchmark. Splash → first feed frame was 4.1s. Lazy-loaded the entire pre-feed graph, pushed media warmup off-thread, killed three SDKs that were blocking startup.',
    results: [
      { num: '4.1s → 1.2s', highlight: '1.2s', label: 'time to first feed frame, p75' },
      { num: '+11pt', highlight: '11pt', label: 'D1 retention, 30 days post' },
    ],
  },
  {
    code: 'M-009 / bundle-diet',
    duration: '2024 · 4 weeks · 1 engineer',
    client: 'DTC retail app',
    clientSmall: 'Series B · 1.6M MAU',
    crit: 'P1 · APP STORE OVER-LIMIT',
    brief:
      'App at 180MB, blowing past App Store cellular download threshold. Audited every native dep, killed 7 unused frameworks, switched to App Thinning + dynamic assets.',
    results: [
      { num: '180MB → 62MB', highlight: '62MB', label: 'download size, iOS' },
      { num: '+18%', highlight: '18%', label: 'install completion rate' },
    ],
  },
  {
    code: 'M-007 / fabric-flip',
    duration: '2024 · 9 weeks · 2 engineers',
    client: 'Telehealth platform',
    clientSmall: 'Series A · HIPAA-scoped',
    crit: 'P1 · STUCK ON 0.68',
    brief:
      '18 months on RN 0.68, blocked by three legacy native modules. Migrated to New Architecture, rewrote modules as Turbo Modules, kept the team shipping features the entire time.',
    results: [
      { num: '0.68 → 0.74', highlight: '0.74', label: 'on New Arch, Fabric on' },
      { num: '0 regr.', highlight: 'regr.', label: 'on-call incidents through cutover' },
    ],
  },
  {
    code: 'M-005 / ground-zero',
    duration: '2024 · 13 weeks · 3 engineers',
    client: 'Logistics ops tool',
    clientSmall: 'Seed → A · field-ops, offline-heavy',
    crit: 'BUILD · ZERO TO STORE',
    brief:
      'Built V1 from empty repo to both stores. Offline-first sync with conflict resolution, BLE printer integration, role-based offline auth.',
    results: [
      { num: '13 wk', highlight: '13 wk', label: 'empty repo → App Store' },
      { num: '4.8★', highlight: '4.8★', label: 'launch month, both stores' },
    ],
  },
  {
    code: 'M-003 / ci-resurrect',
    duration: '2024 · 3 weeks · 1 engineer',
    client: 'B2B scheduling SaaS',
    clientSmall: 'Series B · 60-eng org',
    crit: 'P2 · DEV VELOCITY',
    brief:
      'Release pipeline taking 24min per build, flaky 1-in-3. Rewrote EAS config, cached the right things, parallelized Maestro flows. Internal team owns it now.',
    results: [
      { num: '24 → 6 min', highlight: '6 min', label: 'release build time' },
      { num: '0%', highlight: '0%', label: 'flake rate, 90 days post-handoff' },
    ],
  },
] as const
```

- [ ] **Step 2: Create `mission-card.tsx`**

```tsx
import type { Mission, MissionResult } from '../data'

interface MissionCardProps {
  mission: Mission
}

function NumberWithHighlight({ num, highlight }: MissionResult) {
  if (!highlight) {
    return <span className="text-ink">{num}</span>
  }
  const parts = num.split(highlight)
  return (
    <span className="text-muted">
      {parts[0]}
      <span className="text-accent">{highlight}</span>
      {parts[1]}
    </span>
  )
}

export function MissionCard({ mission }: MissionCardProps) {
  return (
    <article className="group relative flex flex-col gap-5 border border-line bg-bg p-8 transition-colors hover:bg-bg-2">
      <header className="flex flex-wrap items-center justify-between gap-2 font-mono text-[12px] text-muted">
        <span className="text-ink">{mission.code}</span>
        <span>{mission.duration}</span>
      </header>
      <div className="font-sans text-[20px] text-ink">
        {mission.client}
        <small className="ml-2 font-mono text-[12px] font-normal text-muted">
          {mission.clientSmall}
        </small>
      </div>
      <div>
        <span className="inline-block bg-ink px-2 py-1 font-mono text-[11px] text-bg">
          {mission.crit}
        </span>
        <p className="mt-3 text-[15px] leading-[1.55] text-ink">{mission.brief}</p>
      </div>
      <dl className="grid grid-cols-2 gap-4 border-t border-line pt-5">
        {mission.results.map((r, i) => (
          <div key={i} className="flex flex-col gap-1">
            <dt className="font-sans text-[20px]">
              <NumberWithHighlight {...r} />
            </dt>
            <dd className="font-mono text-[11px] text-muted">{r.label}</dd>
          </div>
        ))}
      </dl>
      <span
        aria-hidden
        className="absolute right-6 bottom-6 font-mono text-[12px] text-muted opacity-0 transition-opacity group-hover:opacity-100"
      >
        read mission →
      </span>
    </article>
  )
}
```

- [ ] **Step 3: Create `missions.tsx`**

```tsx
import { Container } from '@/components/ui/container'
import { Section } from '@/components/section'
import { Eyebrow } from '@/components/ui/eyebrow'
import { MissionCard } from './mission-card'
import { missions } from '../data'

export function Missions() {
  return (
    <Section id="work" className="py-[120px]">
      <Container>
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_1fr]">
          <div>
            <Eyebrow>// renders.log</Eyebrow>
            <h2 className="mt-6 font-sans text-[56px] font-medium leading-[1.05] tracking-[-0.025em] text-ink">
              Recent renders.
            </h2>
          </div>
          <p className="self-end text-[16px] leading-[1.55] text-muted">
            Six representative missions from the last 18 months. Critical starting situation,
            the intervention, the resolution in numbers.
          </p>
        </div>
        <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-2">
          {missions.map((m) => (
            <MissionCard key={m.code} mission={m} />
          ))}
        </div>
      </Container>
    </Section>
  )
}
```

- [ ] **Step 4: Add `<Missions />` to `page.tsx`**

```tsx
import { Hero } from '@/features/hero/components/hero'
import { Nav } from '@/features/nav/components/nav'
import { Services } from '@/features/services/components/services'
import { Effect } from '@/features/effect/components/effect'
import { Missions } from '@/features/missions/components/missions'

export default function Home() {
  return (
    <>
      <Nav />
      <main id="main">
        <Hero />
        <Services />
        <Effect />
        <Missions />
      </main>
    </>
  )
}
```

- [ ] **Step 5: Verify gate**

```bash
bun run lint && bun run typecheck && bun run test:ci && bun run build
```
Expected: pass.

---

## Task 15: Team feature (dark)

**Files:**
- Create: `apps/web/src/features/team/data.ts`
- Create: `apps/web/src/features/team/components/portrait-svg.tsx`
- Create: `apps/web/src/features/team/components/member-card.tsx`
- Create: `apps/web/src/features/team/components/package-block.tsx`
- Create: `apps/web/src/features/team/components/team.tsx`
- Modify: `apps/web/src/app/page.tsx`

Reference: `design/useffect.sh.html` lines 1368–1404 + the JS member data at lines 1564–1635 (which we lift into `data.ts`) + portrait SVG at lines 1645–1672 (we render it as a server component).

- [ ] **Step 1: Create `team/data.ts`**

```ts
export interface MemberLib {
  tag: 'npm' | 'rfc' | 'talk' | 'post' | 'oss'
  value: string
}

export interface Member {
  initials: string
  name: string
  where: string
  spec: string
  role: string
  libs: readonly MemberLib[]
  /** HSL gradient seed for the portrait background. */
  hue: readonly [number, number, number]
}

export const members: readonly Member[] = [
  {
    initials: 'MO',
    name: 'Mira Okafor',
    where: 'Lisbon · ex-Shopify Mobile',
    spec: '// specialty: native modules & turbo modules',
    role: '01 / @useffect/mira',
    libs: [
      { tag: 'npm', value: 'react-native-mmkv-async' },
      { tag: 'npm', value: 'rn-turbo-haptics' },
      { tag: 'rfc', value: 'RN-0042 · Spec gen' },
      { tag: 'talk', value: 'App.js Conf · "Bridging the abyss"' },
    ],
    hue: [42, 38, 56],
  },
  {
    initials: 'TB',
    name: 'Tomáš Beran',
    where: 'Berlin · ex-Klarna Performance',
    spec: '// specialty: perf & New Architecture',
    role: '02 / @useffect/tomas',
    libs: [
      { tag: 'npm', value: 'rn-fabric-profiler' },
      { tag: 'npm', value: 'hermes-snapshot-cli' },
      { tag: 'talk', value: 'React Conf · "Cold start was a lie"' },
      { tag: 'post', value: '0.74 migration field notes' },
    ],
    hue: [216, 24, 64],
  },
  {
    initials: 'SH',
    name: 'Sora Hayashi',
    where: 'Tokyo · ex-LINE Animations',
    spec: '// specialty: animations & gestures',
    role: '03 / @useffect/sora',
    libs: [
      { tag: 'npm', value: 'reanimated-recipes' },
      { tag: 'npm', value: 'rn-gesture-conductor' },
      { tag: 'talk', value: 'Chain React · "60fps or refund"' },
      { tag: 'oss', value: 'reanimated · core team' },
    ],
    hue: [12, 32, 60],
  },
  {
    initials: 'LM',
    name: 'Léo Marchand',
    where: 'Paris · ex-Doctolib DX',
    spec: '// specialty: build pipelines & release',
    role: '04 / @useffect/leo',
    libs: [
      { tag: 'npm', value: 'eas-warmup' },
      { tag: 'npm', value: 'expo-canary-channel' },
      { tag: 'talk', value: 'App.js · "The EAS we deserve"' },
      { tag: 'oss', value: 'expo-router · contributor' },
    ],
    hue: [160, 14, 56],
  },
  {
    initials: 'AK',
    name: 'Ana Krieger',
    where: 'São Paulo · ex-Nubank Mobile',
    spec: '// specialty: offline-first & data sync',
    role: '05 / @useffect/ana',
    libs: [
      { tag: 'npm', value: 'watermelon-sync-kit' },
      { tag: 'npm', value: 'rn-conflict-graph' },
      { tag: 'talk', value: 'React Native EU · "Offline isn\'t a state"' },
      { tag: 'oss', value: 'WatermelonDB · maintainer' },
    ],
    hue: [280, 18, 52],
  },
] as const
```

- [ ] **Step 2: Create `portrait-svg.tsx`**

Server-renders the silhouette SVG with grain filter. The `seed` prop makes each filter unique to avoid id collisions.

```tsx
interface PortraitSvgProps {
  seed: number
}

export function PortraitSvg({ seed }: PortraitSvgProps) {
  const grainId = `grain-${seed}`
  const bwId = `bw-${seed}`
  return (
    <svg
      viewBox="0 0 120 160"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden
      className="absolute inset-0 size-full"
    >
      <defs>
        <filter id={grainId}>
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={seed + 3} />
          <feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.18 0" />
        </filter>
        <linearGradient id={bwId} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="rgba(255,255,255,0.06)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0.6)" />
        </linearGradient>
      </defs>
      <g fill="rgba(20,20,18,0.55)">
        <path d="M0 160 Q0 110 22 95 Q40 86 60 86 Q80 86 98 95 Q120 110 120 160 Z" />
        <ellipse cx={60} cy={58} rx={22} ry={26} />
        <rect x={50} y={78} width={20} height={12} />
      </g>
      <ellipse cx={60} cy={50} rx={20} ry={22} fill="rgba(255,255,255,0.04)" />
      <rect width={120} height={160} fill="white" filter={`url(#${grainId})`} opacity={0.7} />
      <rect width={120} height={160} fill={`url(#${bwId})`} />
    </svg>
  )
}
```

- [ ] **Step 3: Create `member-card.tsx`**

The single allowed inline `style={{ background }}` exception lives here (per-member HSL gradient).

```tsx
import type { Member } from '../data'
import { PortraitSvg } from './portrait-svg'

interface MemberCardProps {
  member: Member
  index: number
}

export function MemberCard({ member, index }: MemberCardProps) {
  const [h, s, l] = member.hue
  const grad = `linear-gradient(180deg, hsl(${h} ${s}% ${Math.min(l + 18, 80)}%) 0%, hsl(${h} ${s}% ${Math.max(l - 22, 12)}%) 100%)`

  return (
    <article className="flex flex-col gap-4">
      <div
        className="relative aspect-[3/4] overflow-hidden"
        style={{ background: grad }}
      >
        <PortraitSvg seed={index} />
        <span className="absolute left-3 top-3 font-mono text-[11px] text-bg">
          {member.role}
        </span>
        <span className="absolute right-3 bottom-3 flex items-center gap-2 font-mono text-[10px] text-bg/80">
          <span>ISO 6400</span>
          <span className="text-warn">● rec</span>
        </span>
      </div>
      <div className="flex flex-col gap-2">
        <div className="font-sans text-[18px] text-bg">
          {member.name}
          <small className="ml-2 font-mono text-[12px] font-normal text-dark-muted">
            {member.where}
          </small>
        </div>
        <div className="font-mono text-[12px] text-dark-muted">{member.spec}</div>
        <ul className="flex flex-col gap-1 font-mono text-[12px]">
          {member.libs.map((lib, i) => (
            <li key={i} className="flex items-center gap-2 text-dark-muted">
              <span className="inline-block min-w-10 border border-dark-line px-1.5 text-bg">
                {lib.tag}
              </span>
              <span>{lib.value}</span>
            </li>
          ))}
        </ul>
      </div>
    </article>
  )
}
```

- [ ] **Step 4: Create `package-block.tsx`**

The `your-app/package.json` pseudo-snippet. Uses `<CodeBlock variant="dark">`.

```tsx
import { CodeBlock } from '@/components/ui/code-block'

export function PackageBlock() {
  return (
    <CodeBlock
      variant="dark"
      title={<>~/your-app/package.json</>}
      status="// 5 deps · 0 vulnerabilities"
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
        <span className="tok-p">"</span>
        <span className="tok-k">@useffect/mira</span>
        <span className="tok-p">"</span>
        <span className="tok-p">: "</span>
        <span className="tok-s">^7.3.0</span>
        <span className="tok-p">",</span>{' '}
        <span className="tok-c">{'// native modules & turbo modules'}</span>
      </span>
      <span className="block pl-4">
        <span className="tok-p">"</span>
        <span className="tok-k">@useffect/tomas</span>
        <span className="tok-p">"</span>
        <span className="tok-p">: "</span>
        <span className="tok-s">^6.1.4</span>
        <span className="tok-p">",</span>{' '}
        <span className="tok-c">{'// perf & New Architecture'}</span>
      </span>
      <span className="block pl-4">
        <span className="tok-p">"</span>
        <span className="tok-k">@useffect/sora</span>
        <span className="tok-p">"</span>
        <span className="tok-p">: "</span>
        <span className="tok-s">^5.8.2</span>
        <span className="tok-p">",</span>{' '}
        <span className="tok-c">{'// animations & gestures'}</span>
      </span>
      <span className="block pl-4">
        <span className="tok-p">"</span>
        <span className="tok-k">@useffect/leo</span>
        <span className="tok-p">"</span>
        <span className="tok-p">: "</span>
        <span className="tok-s">^8.0.1</span>
        <span className="tok-p">",</span>{' '}
        <span className="tok-c">{'// build pipelines & release'}</span>
      </span>
      <span className="block pl-4">
        <span className="tok-p">"</span>
        <span className="tok-k">@useffect/ana</span>
        <span className="tok-p">"</span>
        <span className="tok-p">: "</span>
        <span className="tok-s">^4.9.0</span>
        <span className="tok-p">"</span>{'  '}
        <span className="tok-c">{'// offline-first & data sync'}</span>
      </span>
      <span className="block">
        <span className="tok-p">{'}'}</span>
      </span>
    </CodeBlock>
  )
}
```

- [ ] **Step 5: Create `team.tsx`**

```tsx
import { Container } from '@/components/ui/container'
import { Section } from '@/components/section'
import { Eyebrow } from '@/components/ui/eyebrow'
import { PackageBlock } from './package-block'
import { MemberCard } from './member-card'
import { members } from '../data'

export function Team() {
  return (
    <Section id="team" variant="dark" className="py-[120px]">
      <Container>
        <Eyebrow variant="dark">// package.json &gt; dependencies</Eyebrow>
        <h2 className="mt-6 font-sans text-[56px] font-medium leading-[1.05] tracking-[-0.025em] text-bg">
          The <em className="not-italic text-accent">dependencies.</em>
        </h2>

        <div className="mt-12 grid grid-cols-1 gap-12 lg:grid-cols-[1fr_1fr]">
          <p className="text-[16px] leading-[1.55] text-dark-muted">
            Five senior engineers who mount as one. Every member ships native modules to npm,
            speaks at conferences, and has shipped React Native at scale.{' '}
            <b className="text-bg">No juniors. No subcontractors. No bench.</b> The squad that
            lands on your project is the squad on this page.
          </p>
          <PackageBlock />
        </div>

        <div className="mt-20 grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {members.map((m, i) => (
            <MemberCard key={m.initials} member={m} index={i} />
          ))}
        </div>

        <div className="mt-16 flex flex-wrap justify-between gap-4 font-mono text-[12px] text-dark-muted">
          <span>// roster is the work. one team in, same team out.</span>
          <span className="flex flex-wrap gap-x-6 gap-y-1">
            <span><b className="text-bg">147</b> conference talks combined</span>
            <span><b className="text-bg">11.4M</b> npm downloads / mo</span>
            <span><b className="text-bg">14</b> shipped apps last 24 mo</span>
          </span>
        </div>
      </Container>
    </Section>
  )
}
```

- [ ] **Step 6: Add `<Team />` to `page.tsx`**

```tsx
import { Hero } from '@/features/hero/components/hero'
import { Nav } from '@/features/nav/components/nav'
import { Services } from '@/features/services/components/services'
import { Effect } from '@/features/effect/components/effect'
import { Missions } from '@/features/missions/components/missions'
import { Team } from '@/features/team/components/team'

export default function Home() {
  return (
    <>
      <Nav />
      <main id="main">
        <Hero />
        <Services />
        <Effect />
        <Missions />
        <Team />
      </main>
    </>
  )
}
```

- [ ] **Step 7: Verify gate**

```bash
bun run lint && bun run typecheck && bun run test:ci && bun run build
```
Expected: pass.

---

## Task 16: Process feature

**Files:**
- Create: `apps/web/src/features/process/data.ts`
- Create: `apps/web/src/features/process/components/lifecycle-step.tsx`
- Create: `apps/web/src/features/process/components/process.tsx`
- Modify: `apps/web/src/app/page.tsx`

Reference: `design/useffect.sh.html` lines 1410–1459. Three lifecycle steps.

- [ ] **Step 1: Create `process/data.ts`**

```ts
export interface LifecycleStep {
  phase: string
  week: string
  title: string
  body: string
  bullets: readonly string[]
}

export const steps: readonly LifecycleStep[] = [
  {
    phase: '01 / componentDidMount',
    week: 'week 0',
    title: 'Mount',
    body: 'We sit with your code for 5 days. Profile it, fork it, break it, read the on-call docs. You get a written diagnosis with the three things that actually matter — not a 40-page audit.',
    bullets: [
      'Repo + crash report ingest',
      'Live profiling on prod builds',
      'Written diagnosis (max 3 pages)',
      'Fixed-scope SOW, signed in week 1',
    ],
  },
  {
    phase: '02 / render',
    week: 'weeks 1–N',
    title: 'Ship',
    body: 'We ship to your repo, in your branches, in your standups. Weekly demo on Friday. Numbers update on a shared dashboard. No dark rooms. No "almost done."',
    bullets: [
      'PRs in your repo, your review process',
      'Weekly demo + written progress note',
      'Live metrics dashboard (the us effect)',
      'Pair sessions with your engineers',
    ],
  },
  {
    phase: '03 / componentWillUnmount',
    week: 'last 2 weeks',
    title: 'Unmount',
    body: 'The hardest part of consulting is leaving cleanly. We write the runbooks, record the loom walkthroughs, train your on-call. If we did our job, you forget our names within a quarter.',
    bullets: [
      'Runbooks + architecture decision records',
      'Loom walkthroughs for each system',
      '30-day on-call shadowing, then dark',
      '90-day return ticket, no charge',
    ],
  },
] as const
```

- [ ] **Step 2: Create `lifecycle-step.tsx`**

```tsx
import type { LifecycleStep as Step } from '../data'

interface Props {
  step: Step
}

export function LifecycleStep({ step }: Props) {
  return (
    <article className="flex flex-col gap-5 border-t border-line pt-8">
      <div className="flex items-center justify-between font-mono text-[12px]">
        <span className="text-muted">{step.phase}</span>
        <b className="text-ink">{step.week}</b>
      </div>
      <h3 className="font-sans text-[48px] font-medium leading-none tracking-[-0.02em] text-ink">
        {step.title}
        <span className="text-accent">.</span>
      </h3>
      <p className="text-[15px] leading-[1.55] text-ink">{step.body}</p>
      <ul className="flex flex-col gap-2 font-mono text-[13px] text-muted">
        {step.bullets.map((b) => (
          <li key={b} className="flex gap-3">
            <span aria-hidden className="text-accent">›</span>
            <span>{b}</span>
          </li>
        ))}
      </ul>
    </article>
  )
}
```

- [ ] **Step 3: Create `process.tsx`**

```tsx
import { Container } from '@/components/ui/container'
import { Section } from '@/components/section'
import { Eyebrow } from '@/components/ui/eyebrow'
import { LifecycleStep } from './lifecycle-step'
import { steps } from '../data'

export function Process() {
  return (
    <Section id="process" className="py-[120px]">
      <Container>
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_1fr]">
          <div>
            <Eyebrow>// lifecycle.ts</Eyebrow>
            <h2 className="mt-6 font-sans text-[56px] font-medium leading-[1.05] tracking-[-0.025em] text-ink">
              Mount. Ship.<br />Unmount.
            </h2>
          </div>
          <p className="self-end text-[16px] leading-[1.55] text-muted">
            The whole engagement is a React lifecycle. We come in clean, do the work,
            and leave your team stronger than we found it — full docs, zero debt, the bus
            factor goes up when we go.
          </p>
        </div>
        <div className="mt-16 grid grid-cols-1 gap-12 lg:grid-cols-3">
          {steps.map((s) => (
            <LifecycleStep key={s.phase} step={s} />
          ))}
        </div>
      </Container>
    </Section>
  )
}
```

- [ ] **Step 4: Add `<Process />` to `page.tsx`**

Add the import and place `<Process />` after `<Team />`. Final `page.tsx`:

```tsx
import { Hero } from '@/features/hero/components/hero'
import { Nav } from '@/features/nav/components/nav'
import { Services } from '@/features/services/components/services'
import { Effect } from '@/features/effect/components/effect'
import { Missions } from '@/features/missions/components/missions'
import { Team } from '@/features/team/components/team'
import { Process } from '@/features/process/components/process'

export default function Home() {
  return (
    <>
      <Nav />
      <main id="main">
        <Hero />
        <Services />
        <Effect />
        <Missions />
        <Team />
        <Process />
      </main>
    </>
  )
}
```

- [ ] **Step 5: Verify gate**

```bash
bun run lint && bun run typecheck && bun run test:ci && bun run build
```
Expected: pass.

---

## Task 17: Closer feature (final CTA)

**Files:**
- Create: `apps/web/src/features/closer/components/closer.tsx`
- Modify: `apps/web/src/app/page.tsx`

Reference: `design/useffect.sh.html` lines 1466–1476.

- [ ] **Step 1: Create `closer.tsx`**

```tsx
import { Container } from '@/components/ui/container'
import { Section } from '@/components/section'
import { Eyebrow } from '@/components/ui/eyebrow'
import { Button } from '@/components/ui/button'

export function Closer() {
  return (
    <Section id="contact" className="py-[160px] text-center">
      <Container>
        <div className="flex flex-col items-center gap-8">
          <Eyebrow>// return ()</Eyebrow>
          <h2 className="font-sans text-[clamp(48px,7vw,96px)] font-medium leading-[1.05] tracking-[-0.025em] text-ink">
            Your app, with the <em className="not-italic text-accent">us</em> effect.
          </h2>
          <p className="max-w-[640px] text-[16px] leading-[1.55] text-muted">
            Two slots open for Q3. If your app is on fire — or you're staring at an empty repo and a board
            deadline — talk to us this week.
          </p>
          <div className="flex flex-col items-center gap-4">
            <Button href="mailto:hello@useffect.sh" size="xl">
              Trigger the effect
            </Button>
            <span className="font-mono text-[12px] text-muted">
              hello@useffect.sh · avg. response &lt; 6h
            </span>
          </div>
        </div>
      </Container>
    </Section>
  )
}
```

- [ ] **Step 2: Add `<Closer />` to `page.tsx`**

Add the import and place `<Closer />` after `<Process />`.

```tsx
import { Closer } from '@/features/closer/components/closer'
// ...
<main id="main">
  <Hero />
  <Services />
  <Effect />
  <Missions />
  <Team />
  <Process />
  <Closer />
</main>
```

- [ ] **Step 3: Verify gate**

```bash
bun run lint && bun run typecheck && bun run test:ci && bun run build
```
Expected: pass.

---

## Task 18: Footer feature

**Files:**
- Create: `apps/web/src/features/footer/data.ts`
- Create: `apps/web/src/features/footer/components/footer-column.tsx`
- Create: `apps/web/src/features/footer/components/easter-line.tsx`
- Create: `apps/web/src/features/footer/components/footer.tsx`
- Modify: `apps/web/src/app/page.tsx`

Reference: `design/useffect.sh.html` lines 1482–1539.

- [ ] **Step 1: Create `footer/data.ts`**

```ts
export interface FooterLink {
  label: string
  href: string
}

export interface FooterColumn {
  heading: string
  links: readonly FooterLink[]
}

export const columns: readonly FooterColumn[] = [
  {
    heading: '// product',
    links: [
      { label: 'Rescue', href: '#services' },
      { label: 'Build', href: '#services' },
      { label: 'The us effect', href: '#effect' },
      { label: 'Renders', href: '#work' },
    ],
  },
  {
    heading: '// company',
    links: [
      { label: 'Team', href: '#team' },
      { label: 'Writing', href: '#writing' },
      { label: 'Process', href: '#process' },
      { label: 'Contact', href: 'mailto:hello@useffect.sh' },
    ],
  },
  {
    heading: '// social',
    links: [
      { label: 'github.com/useffect', href: '#' },
      { label: '@useffect on X', href: '#' },
      { label: '@useffect.sh on bsky', href: '#' },
      { label: 'YouTube · talks', href: '#' },
    ],
  },
  {
    heading: '// legal',
    links: [
      { label: 'NDA template', href: '#' },
      { label: 'MSA template', href: '#' },
      { label: 'Privacy', href: '#' },
      { label: 'Imprint', href: '#' },
    ],
  },
] as const
```

- [ ] **Step 2: Create `footer-column.tsx`**

```tsx
import type { FooterColumn as Col } from '../data'

interface Props {
  column: Col
}

export function FooterColumn({ column }: Props) {
  return (
    <div className="flex flex-col gap-3">
      <h4 className="font-mono text-[12px] text-muted">{column.heading}</h4>
      <ul className="flex flex-col gap-2 font-mono text-[13px]">
        {column.links.map((link) => (
          <li key={link.label}>
            <a href={link.href} className="text-ink hover:text-accent transition-colors">
              {link.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}
```

- [ ] **Step 3: Create `easter-line.tsx`**

```tsx
export function EasterLine() {
  return (
    <div className="flex items-center gap-3 border-b border-line py-6 font-mono text-[13px] text-muted">
      <span className="text-accent">$</span>
      <span>
        {'// You\'re inspecting. We like you. '}
        <b className="text-ink">careers@useffect.sh</b>
        {' · we read every email.'}
      </span>
    </div>
  )
}
```

- [ ] **Step 4: Create `footer.tsx`**

```tsx
import { Container } from '@/components/ui/container'
import { Logo } from '@/components/ui/logo'
import { EasterLine } from './easter-line'
import { FooterColumn } from './footer-column'
import { columns } from '../data'

export function Footer() {
  return (
    <footer className="border-t border-line bg-bg pt-12 pb-10">
      <Container>
        <EasterLine />

        <div className="mt-10 grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-5">
          <div className="flex flex-col gap-4 lg:col-span-1">
            <a href="#" className="self-start">
              <Logo />
            </a>
            <p className="font-mono text-[13px] text-muted leading-[1.55]">
              A senior React Native collective. We mount, we ship, we unmount cleanly.
              The us effect is the trace we leave behind.
            </p>
          </div>
          {columns.map((c) => (
            <FooterColumn key={c.heading} column={c} />
          ))}
        </div>

        <div className="mt-12 flex flex-wrap justify-between gap-4 border-t border-line pt-6 font-mono text-[12px] text-muted">
          <span>© 2026 useffect collective · Berlin · Paris · Lisbon · São Paulo</span>
          <span>
            v4.2.0 · last deploy 3 days ago ·{' '}
            <span className="text-accent">●</span> all systems operational
          </span>
        </div>
      </Container>
    </footer>
  )
}
```

- [ ] **Step 5: Add `<Footer />` to `page.tsx`**

```tsx
import { Footer } from '@/features/footer/components/footer'
// ...
return (
  <>
    <Nav />
    <main id="main">
      {/* sections */}
    </main>
    <Footer />
  </>
)
```

- [ ] **Step 6: Verify gate**

```bash
bun run lint && bun run typecheck && bun run test:ci && bun run build
```
Expected: pass.

---

## Task 19: Mobile menu client island (TDD)

**Files:**
- Create: `apps/web/src/features/nav/components/mobile-menu.client.tsx`
- Create: `apps/web/src/features/nav/components/mobile-menu.test.tsx`
- Modify: `apps/web/src/features/nav/components/nav.tsx`

At <880px (we'll use `md` breakpoint, Tailwind default 768px, close to design's 880px — the discrepancy is acceptable given Tailwind conventions). The mobile menu uses a semantic `<dialog>` opened with `showModal()`.

- [ ] **Step 1: Write the failing test `mobile-menu.test.tsx`**

```tsx
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, beforeAll } from 'vitest'
import { MobileMenu } from './mobile-menu.client'

// jsdom does not implement HTMLDialogElement; stub the methods we use.
beforeAll(() => {
  if (typeof HTMLDialogElement === 'undefined') return
  if (!HTMLDialogElement.prototype.showModal) {
    HTMLDialogElement.prototype.showModal = function () {
      this.setAttribute('open', '')
    }
  }
  if (!HTMLDialogElement.prototype.close) {
    HTMLDialogElement.prototype.close = function () {
      this.removeAttribute('open')
    }
  }
})

describe('MobileMenu', () => {
  it('opens when the hamburger is clicked', () => {
    render(<MobileMenu />)
    const dialog = screen.getByRole('dialog', { hidden: true })
    expect(dialog).not.toHaveAttribute('open')
    fireEvent.click(screen.getByRole('button', { name: /open menu/i }))
    expect(dialog).toHaveAttribute('open')
  })

  it('closes when Escape is pressed', () => {
    render(<MobileMenu />)
    fireEvent.click(screen.getByRole('button', { name: /open menu/i }))
    const dialog = screen.getByRole('dialog', { hidden: true })
    expect(dialog).toHaveAttribute('open')
    fireEvent.keyDown(dialog, { key: 'Escape' })
    expect(dialog).not.toHaveAttribute('open')
  })

  it('closes when an anchor inside is clicked', () => {
    render(<MobileMenu />)
    fireEvent.click(screen.getByRole('button', { name: /open menu/i }))
    const dialog = screen.getByRole('dialog', { hidden: true })
    expect(dialog).toHaveAttribute('open')
    fireEvent.click(screen.getByRole('link', { name: 'Work' }))
    expect(dialog).not.toHaveAttribute('open')
  })
})
```

- [ ] **Step 2: Run the test — expect failure**

```bash
(cd apps/web && bun x vitest run src/features/nav/components/mobile-menu.test.tsx)
```
Expected: FAIL — `Cannot find module ./mobile-menu.client`.

- [ ] **Step 3: Implement `mobile-menu.client.tsx`**

```tsx
'use client'

import { useEffect, useRef, type KeyboardEvent, type MouseEvent } from 'react'

const LINKS: ReadonlyArray<{ label: string; href: string }> = [
  { label: 'Work', href: '#work' },
  { label: 'Services', href: '#services' },
  { label: 'Team', href: '#team' },
  { label: 'Writing', href: '#writing' },
  { label: 'Contact', href: '#contact' },
] as const

export function MobileMenu() {
  const ref = useRef<HTMLDialogElement>(null)

  const open = () => ref.current?.showModal()
  const close = () => ref.current?.close()

  // Lock body scroll while open.
  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    const onToggle = () => {
      document.body.style.overflow = dialog.open ? 'hidden' : ''
    }
    dialog.addEventListener('toggle', onToggle)
    return () => {
      dialog.removeEventListener('toggle', onToggle)
      document.body.style.overflow = ''
    }
  }, [])

  const onAnchorClick = (e: MouseEvent<HTMLAnchorElement>) => {
    // Native anchor behavior still happens; we just close the menu.
    void e
    close()
  }

  const onKeyDown = (e: KeyboardEvent<HTMLDialogElement>) => {
    if (e.key === 'Escape') close()
  }

  return (
    <>
      <button
        type="button"
        onClick={open}
        aria-label="Open menu"
        className="inline-flex flex-col items-end justify-center gap-1.5 p-2 md:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      >
        <span aria-hidden className="block h-px w-6 bg-ink" />
        <span aria-hidden className="block h-px w-4 bg-ink" />
      </button>

      <dialog
        ref={ref}
        onKeyDown={onKeyDown}
        className="m-0 size-full max-h-none max-w-none bg-bg p-0 text-ink backdrop:bg-ink/40 open:flex open:flex-col"
        aria-label="Site navigation"
      >
        <div className="flex items-center justify-end px-6 py-5">
          <button
            type="button"
            onClick={close}
            aria-label="Close menu"
            className="font-mono text-[14px] text-muted hover:text-ink"
          >
            close ✕
          </button>
        </div>
        <nav className="flex flex-1 flex-col gap-6 px-6 pb-12 font-mono text-[20px]">
          {LINKS.map((l) => (
            <a key={l.href} href={l.href} onClick={onAnchorClick} className="text-ink hover:text-accent">
              {l.label}
            </a>
          ))}
        </nav>
      </dialog>
    </>
  )
}
```

- [ ] **Step 4: Run the test — expect pass**

```bash
(cd apps/web && bun x vitest run src/features/nav/components/mobile-menu.test.tsx)
```
Expected: PASS — 3 tests pass.

- [ ] **Step 5: Mount `<MobileMenu />` inside `nav.tsx`**

Add the import and render the menu after the CTA button. The button itself only shows on `<md` via `md:hidden`.

```tsx
'use client'

import { Container } from '@/components/ui/container'
import { Button } from '@/components/ui/button'
import { Logo } from '@/components/ui/logo'
import { StatusPill } from '@/components/ui/status-pill'
import { useNavScrollState } from '../hooks/use-nav-scroll-state.client'
import { MobileMenu } from './mobile-menu.client'

export function Nav() {
  const scrolled = useNavScrollState()
  return (
    <header
      id="nav"
      data-scrolled={scrolled || undefined}
      className="sticky top-0 z-50 bg-bg/80 backdrop-blur-md backdrop-saturate-150 border-b border-transparent data-[scrolled]:border-line transition-colors duration-200"
    >
      <Container>
        <div className="flex h-16 items-center justify-between gap-4">
          <a href="#" className="shrink-0">
            <Logo />
          </a>
          <nav className="hidden items-center gap-7 font-mono text-[13px] md:flex">
            <a href="#work" className="text-muted hover:text-ink transition-colors">Work</a>
            <a href="#services" className="text-muted hover:text-ink transition-colors">Services</a>
            <a href="#team" className="text-muted hover:text-ink transition-colors">Team</a>
            <a href="#writing" className="text-muted hover:text-ink transition-colors">Writing</a>
          </nav>
          <div className="flex items-center gap-[18px]">
            <StatusPill className="hidden sm:inline-flex">2 slots · Q3</StatusPill>
            <Button href="#contact" className="hidden sm:inline-flex">Trigger the effect</Button>
            <MobileMenu />
          </div>
        </div>
      </Container>
    </header>
  )
}
```

- [ ] **Step 6: Verify gate**

```bash
bun run lint && bun run typecheck && bun run test:ci && bun run build
```
Expected: all pass. Test count goes up by 3 more.

---

## Task 20: Final page smoke test + full validation

**Files:**
- Modify: `apps/web/src/app/page.test.tsx`

- [ ] **Step 1: Expand the page smoke test to assert all section landmarks**

Replace `page.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import Home from './page'

describe('Home', () => {
  it('renders the main landmark', () => {
    render(<Home />)
    expect(screen.getByRole('main')).toBeInTheDocument()
  })

  it('renders the hero headline', () => {
    render(<Home />)
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/UNFUCK/)
  })

  it('renders every section heading', () => {
    render(<Home />)
    // section H2s
    expect(screen.getByText(/Pick the one on fire/i)).toBeInTheDocument()
    expect(screen.getByText(/effect\./i)).toBeInTheDocument()
    expect(screen.getByText(/Recent renders\./i)).toBeInTheDocument()
    expect(screen.getByText(/dependencies/i)).toBeInTheDocument()
    expect(screen.getByText(/Unmount\./i)).toBeInTheDocument()
    expect(screen.getByText(/with the/i)).toBeInTheDocument()
  })

  it('renders the footer with the copyright', () => {
    render(<Home />)
    expect(screen.getByText(/© 2026 useffect collective/)).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run the full gate**

```bash
bun run lint && bun run typecheck && bun run test:ci && bun run build
```
Expected: all pass. Test totals: Home (4) + EffectToggle (3) + MobileMenu (3) = 10 tests across 3 files.

- [ ] **Step 3: Smoke-check the dev server**

```bash
(cd apps/web && timeout 25 bun run dev) || true
```
Expected: Next prints `Ready` / `Local: http://localhost:3000`. Optional manual: open localhost:3000 and confirm visually:
- Hero headline renders with the strike-through and animated cursor.
- Nav gets a bottom border once scrolled.
- The before/after toggle in the us-effect section visually swaps emphasis.
- The dark team section renders with 5 portrait cards.
- The mobile menu opens on <md viewports (use devtools responsive mode).

- [ ] **Step 4: Confirm structure**

```bash
bun x tree -L 5 -a -I 'node_modules|.git|.next|.turbo' apps/web/src 2>/dev/null || find apps/web/src -maxdepth 5 -type f -not -path '*/node_modules/*'
```
Expected: structure matches the File Structure Reference at the top of this plan.

---

## Handoff to the user (you run these — Claude does none of them)

When every task above verifies, **the user** performs these:

### 1. Review and commit

Review the full diff (`git status`, `git diff HEAD`), then commit and push. Suggested message — pick one or write your own:

```bash
git add .
git commit -m "feat: render()"
git push origin main
```

Other on-brand subject options:
- `feat: useEffect(() => render(), [us])`
- `feat: the dependencies, mounted`
- `feat: ship the landing`

The bootstrap-era `// mounting...` becomes the actual landing on push.

### 2. Vercel deploy

Vercel auto-deploys from push to `main` (already wired). Verify the live `useffect.sh` matches the mockup. No dashboard action needed unless something looks off.

### 3. Optional follow-ups (NOT in this iteration)

- `og.png` and favicon assets (already referenced in metadata).
- A "/missions/[slug]" route layer when you want individual case-study pages.
- Real contact form when you outgrow `mailto:`.
- Replace AI-generated copy with real content (currently faithful 1:1 placeholder per the spec decision).
