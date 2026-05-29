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
      {
        num: '94.2% → 99.7%',
        highlight: '99.7%',
        label: 'crash-free, 14 days post-ship',
      },
      {
        num: '−3.4×',
        highlight: '3.4×',
        label: 'cold start on mid-tier Android',
      },
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
      {
        num: '4.1s → 1.2s',
        highlight: '1.2s',
        label: 'time to first feed frame, p75',
      },
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
      {
        num: '0.68 → 0.74',
        highlight: '0.74',
        label: 'on New Arch, Fabric on',
      },
      {
        num: '0 regr.',
        highlight: 'regr.',
        label: 'on-call incidents through cutover',
      },
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
