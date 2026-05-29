# Design — useffect.sh monorepo bootstrap (web-only)

**Date:** 2026-05-28
**Status:** Approved (design) — pending spec review
**Author:** Jérémy Magrin (with Claude Code)

## Goal

Stand up the foundation for `useffect.sh` — a senior React Native collective's
site and future mobile app. This first iteration scaffolds **only the web app**,
but the repo is a proper monorepo from day one so `apps/mobile` can be added
later without restructuring.

**Success condition:** pushing to `main` auto-deploys `apps/web` to
`useffect.sh` via Vercel. Every PR gets a preview URL. CI gates every push.

## Brand

The name `useffect.sh` (single-e, intentional) reads three ways at once:

- **useEffect** — the React hook (technical wink)
- **us effect** / **use effect** — the *team effect*, the collective impact a
  senior crew has on a product

Single-e is the brand, not a typo. The canonical domain is **`useffect.sh`**.

- **Tagline (hero):** "The React Native team you wish you had."
- **Subtagline:** "A senior React Native collective. Series A/B startups only."
- **Visual vibe:** Stripe/Resend swiss minimalism — white, thin borders,
  generous spacing, Geist Sans + Geist Mono.
- **Tone:** direct, technical, peer-to-peer.

Iteration 1 ships a minimal teaser only — no marketing copy beyond the brief.

## Target structure

```
useffect-sh/
├── apps/
│   └── web/                    Next.js 15 app (only app for now)
├── packages/
│   └── .gitkeep                empty, ready for shared code later
├── .github/
│   ├── workflows/ci.yml
│   └── CODEOWNERS
├── .nvmrc
├── .gitignore
├── biome.json
├── tsconfig.base.json
├── turbo.json
├── package.json                workspaces root
├── bun.lock
└── README.md
```

No root `vercel.json` (see Decisions).

## Stack

| Concern            | Choice                                                       |
| ------------------ | ------------------------------------------------------------ |
| Monorepo           | Turborepo 2.x (`tasks` key, not legacy `pipeline`)           |
| Package mgr/runtime| Bun (local 1.3.14) — `bun install`/`bun run`/`bun x`. No npm/pnpm/yarn anywhere |
| Framework (web)    | Next.js 15 App Router + TypeScript strict                    |
| Styling            | Tailwind CSS v4 (GA, `tailwindcss@latest` + `@tailwindcss/postcss`) |
| Lint/Format        | Biome 2.x (no ESLint anywhere)                               |
| Testing            | Vitest + Testing Library + jsdom                             |
| Git hooks          | Husky + lint-staged                                          |
| Analytics          | @vercel/analytics + @vercel/speed-insights                   |
| Node (build env)   | 22 (active LTS)                                              |

All deps pinned to **latest stable, verified against the registry at
implementation time** (knowledge cutoff predates build date).

## Decisions (deviations from the original brief)

These four points diverge from the brief; they were confirmed during
brainstorming.

1. **No root `vercel.json`.** Deploy uses **Root Directory = `apps/web`** in the
   Vercel dashboard (Vercel's native Turborepo pattern). With that setting a
   root `vercel.json` containing `cd apps/web` is wrong and ignored. Vercel
   auto-detects Next.js + Turborepo, installs from the repo root, and runs the
   build. The brief's task #8 (`vercel.json`) is therefore dropped; the exact
   dashboard settings are documented in the final summary / README deploy notes
   instead.

2. **Node 22, not 20.** Node 20 LTS reached end-of-maintenance in April 2026 —
   EOL as of the build date. Local is already Node 22 (active LTS) and Vercel
   supports it. So `.nvmrc` → `22`, `engines.node` → `>=22`, CI `setup-node` →
   `22`.

3. **Tailwind v4 stable, not `@next`.** Tailwind v4 has been GA since early
   2025. Install `tailwindcss@latest` (v4.x) + `@tailwindcss/postcss`.

4. **Single-e everywhere.** Package scope `@useffect/web`; all copy, metadata,
   and DNS use `useffect.sh`.

Everything else matches the brief verbatim.

## Components

### Root workspace
- `package.json`: `private: true`, `workspaces: ["apps/*", "packages/*"]`,
  `packageManager: "bun@<latest>"`, `engines: { node: ">=22", bun: ">=1.1.0" }`.
- Root scripts (all delegate to turbo except formatting):
  - `dev` → `turbo run dev`
  - `build` → `turbo run build`
  - `lint` → `turbo run lint`
  - `lint:fix` → `biome check --write .`
  - `format` → `biome format --write .`
  - `typecheck` → `turbo run typecheck`
  - `test` → `turbo run test`
  - `test:ci` → `turbo run test:ci`
  - `prepare` → `husky` (hook install)
- Root dev deps: `turbo`, `husky`, `lint-staged`, `@biomejs/biome`.
- `lint-staged`: `*.{ts,tsx,js,jsx,json,md}` → `biome check --write --no-errors-on-unmatched`.

### turbo.json
Tasks: `build` (outputs `.next/**` excluding `.next/cache/**`, `dependsOn: ["^build"]`),
`dev` (`cache: false`, `persistent: true`), `lint`, `typecheck`, `test`,
`test:ci`.

### tsconfig.base.json
Strict mode, `noUncheckedIndexedAccess`, `noImplicitOverride`, `target` ES2022+,
`module`/`moduleResolution` bundler, `skipLibCheck`, no emit by default — meant
to be extended by apps.

### biome.json
Recommended rules on, formatter on, 2-space indent, single quotes, semicolons
as-needed, organize-imports on. Apps inherit.

### apps/web
- `package.json` — name `@useffect/web`, `private: true`. Scripts: `dev` →
  `next dev`, `build` → `next build`, `start` → `next start`, `lint` →
  `biome check .`, `typecheck` → `tsc --noEmit`, `test` → `vitest`, `test:ci`
  → `vitest run`.
- `tsconfig.json` extends `../../tsconfig.base.json`, App Router paths (`@/*`).
- `next.config.ts` — TypeScript config, Next 15 syntax.
- `postcss.config.mjs` — `@tailwindcss/postcss`.
- `app/layout.tsx`, `app/page.tsx`, `app/globals.css`.
- `public/.gitkeep`.
- Local `.gitignore` (`.next`, `.vercel`).
- Deps: `next`, `react`, `react-dom`, `@vercel/analytics`,
  `@vercel/speed-insights`, `tailwindcss`, `@tailwindcss/postcss`.
- Dev deps: `typescript`, `@types/node`, `@types/react`, `@types/react-dom`,
  `vitest`, `@vitejs/plugin-react`, `@testing-library/react`,
  `@testing-library/jest-dom`, `jsdom`.
- Scaffolded **manually** — no `create-next-app` (avoids monorepo pollution).

### Homepage — app/page.tsx (< 30 lines JSX)
Full viewport, centered, white bg. Mono text top `// mounting...`
(neutral-500), center `useffect.sh` larger + tight tracking, mono text bottom
`// soon` (neutral-400). Geist Sans + Geist Mono (built into Next 15). No
animation, no interactivity. Tailwind classes only.

### Layout & metadata — app/layout.tsx
`lang="en"`. Metadata: title `"useffect.sh — The React Native team you wish you
had."`, description `"A senior React Native collective. Series A/B startups
only."`, OpenGraph + Twitter card referencing `/og.png` (image not created),
favicon reference (not created). `<Analytics />` + `<SpeedInsights />` mounted in
body.

### Testing
Vitest with jsdom env, React plugin, `@/*` alias, setup file importing
`@testing-library/jest-dom`. One homepage smoke test (renders, asserts
`useffect.sh` present).

### CI — .github/workflows/ci.yml
Trigger: push to `main` + PRs to `main`. Single job `quality` on
`ubuntu-latest`:
1. `actions/checkout@v4`
2. `oven-sh/setup-bun@v2` (`bun-version: latest`)
3. `actions/setup-node@v4` (`node-version: 22`)
4. `actions/cache@v4` for `.turbo/`, key on `bun.lock` + `turbo`
5. `bun install --frozen-lockfile`
6. `bun run lint`
7. `bun run typecheck`
8. `bun run test:ci`
9. `bun run build`

Fail fast — all steps must pass.

### CODEOWNERS
`* @magrinj`

### README.md
Brief's content, single-e, with a deploy note documenting the Root Directory =
`apps/web` Vercel setup.

### .gitignore (root)
`node_modules`, `.next`, `.turbo`, `.vercel`, `.env*.local`, `*.log`,
`.DS_Store`, coverage dirs, `dist`. Does **not** ignore `bun.lock`.

## Constraints

- Exact latest stable versions, verified against the registry at build time.
- Strict TypeScript — no `any`, no `@ts-ignore`.
- Tailwind classes only — no inline styles, no CSS modules.
- No libs beyond the listed set (no shadcn, framer-motion, icon libs).
- Zero npm/pnpm/yarn references anywhere — Bun only.
- `packages/` stays empty (just `.gitkeep`).
- **No commits or pushes by Claude** — the user reviews everything and runs all
  git commands. Claude only creates/edits files and provides the exact commands.

## Validation checklist

- [ ] `bun install` succeeds from root, produces `bun.lock`
- [ ] `bun dev` starts web app on localhost:3000
- [ ] `bun run lint` passes, zero warnings
- [ ] `bun run typecheck` passes
- [ ] `bun run test:ci` passes (1 web test)
- [ ] `bun run build` succeeds for web
- [ ] Pre-commit hook runs biome on staged files
- [ ] `ci.yml` is valid YAML
- [ ] Folder structure matches target

## Out of scope (future iterations)

- `apps/mobile` (React Native / Expo)
- Real landing content, sections, marketing copy
- Shared design system in `packages/`
- `og.png` and favicon assets
- Any backend / API / forms

## Manual steps (user, after merge)

Detailed in the final summary. Headline items:
- Vercel: import `magrinj/useffect.sh`, set **Root Directory = `apps/web`**,
  add domains `useffect.sh` + `www.useffect.sh`.
- Registrar DNS: A `@` → `76.76.21.21`, CNAME `www` → `cname.vercel-dns.com`
  (confirm exact records against what the Vercel dashboard displays).
- Git: commit + push as `feat: bootstrap monorepo with web app and CI` (user
  runs this).
