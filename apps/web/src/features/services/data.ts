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
      {
        idx: '03',
        label: 'New Architecture migration (Fabric · TM)',
        meta: 'P1',
      },
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
      {
        idx: '02',
        label: 'Full rebuilds (legacy → Expo + RN)',
        meta: '10–20 wk',
      },
      { idx: '03', label: 'Design system & component library', meta: '4–8 wk' },
      {
        idx: '04',
        label: 'Native features (BLE · camera · ML)',
        meta: 'on scope',
      },
      { idx: '05', label: 'App Store & Play submission', meta: 'included' },
      { idx: '06', label: 'Handoff to your internal team', meta: 'included' },
    ],
    footPrice: '// kickoff in 2 weeks · fixed-scope phases',
    ctaHref: '#contact',
    ctaLabel: 'Trigger build',
  },
] as const
