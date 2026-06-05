export interface DoorItem {
  idx: string
  /** Item meta — for rescue these stay code-style ("P0", "P1") in both
   *  locales; for build they are translated (`8–14 wk` ↔ `8–14 sem`). */
  meta?: string
}

export interface Door {
  /** Identifier — also the messages.services.doors.* namespace. */
  id: 'rescue' | 'build'
  /** Tag stays code-style (`rescue.ts`, `build.ts`). */
  tag: string
  glyph: string
  ctaHref: string
  items: DoorItem[]
}

// Rescue items keep code-style meta (P0/P1/P2). Build items pull the meta
// from messages.services.doors.build.metas so durations translate ("8–14 wk"
// → "8–14 sem").
export const doors: readonly Door[] = [
  {
    id: 'rescue',
    tag: 'rescue.ts',
    glyph: '!',
    ctaHref: '#contact',
    items: [
      { idx: '01', meta: 'P0' },
      { idx: '02', meta: 'P0' },
      { idx: '03', meta: 'P1' },
      { idx: '04', meta: 'P1' },
      { idx: '05', meta: 'P1' },
      { idx: '06', meta: 'P2' },
    ],
  },
  {
    id: 'build',
    tag: 'build.ts',
    glyph: '+',
    ctaHref: '#contact',
    // meta is null here; resolved by the component via messages.
    items: [
      { idx: '01' },
      { idx: '02' },
      { idx: '03' },
      { idx: '04' },
      { idx: '05' },
      { idx: '06' },
    ],
  },
] as const
