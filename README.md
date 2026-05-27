# useffect.sh

> The React Native team you wish you had.

A senior React Native collective. Series A/B startups only.

The name reads three ways: `useEffect` (the hook), and _us effect_ / _use effect_ — the team effect.

---

## Structure

```
apps/
  web/        Next.js — useffect.sh
packages/     (shared code, coming soon)
```

## Development

```bash
bun install
bun dev
```

## Stack

Turborepo · Bun · Next.js 16 · TypeScript · Tailwind v4 · Biome · Vitest

## Deploy

`apps/web` auto-deploys to [useffect.sh](https://useffect.sh) via Vercel on push to `main`.

Vercel is configured with **Root Directory = `apps/web`** (native Turborepo detection) — there is intentionally no `vercel.json`.
