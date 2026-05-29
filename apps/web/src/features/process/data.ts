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
