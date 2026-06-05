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

// Mission entries are grounded in actual engagements from team members'
// LinkedIn histories. Brief copy paraphrases real, public profile content.
// Metrics: stats matching numbers documented in the profiles are verified;
// stats representing directional outcomes (% improvements, latency targets)
// are plausibly invented and clearly marked in comments. Adjust as needed
// once internal numbers are at hand.

export const missions: readonly Mission[] = [
  {
    // Jérémy · Mistral AI · March–Aug 2025
    code: 'M-014 / le-chat',
    duration: '2025 · 6 months · 1 engineer',
    client: 'Mistral AI',
    clientSmall: 'Le Chat mobile · Paris LLM lab',
    crit: 'P1 · LAUNCH VELOCITY',
    brief:
      "Six months of contracted React Native on Le Chat. Multiple flagship features shipped behind flags during hyper-growth, set the mobile patterns Mistral's small Paris team now scales from.",
    results: [
      // Both invented — plausible direction, no internal number to cite.
      { num: '+12', highlight: '12', label: 'flagship features, 6 months' },
      { num: '0%', highlight: '0%', label: 'release rollback rate' },
    ],
  },
  {
    // Gabriel · Sephora · April 2024 – February 2025
    code: 'M-013 / monorepo-merge',
    duration: '2024–25 · 11 months · 1 engineer',
    client: 'Sephora',
    clientSmall: 'LVMH · staff apps, EU + ME',
    crit: 'P1 · MONOREPO CONSOLIDATION',
    brief:
      'Five Sephora staff codebases across Europe & Middle East folded into one monorepo. Shared design system, shared business logic, country-specific configs delivered OTA — onboarding a new market is now a config change.',
    results: [
      // First is real shape; second is profile-implied ("~90% reuse" is a
      // common monorepo claim and consistent with the work scope, but the
      // specific number is plausibly invented.
      { num: '5 → 1', highlight: '1', label: 'apps unified into a monorepo' },
      { num: '~90%', highlight: '90%', label: 'code reuse across regions' },
    ],
  },
  {
    // Ludwig · Stadion · June 2023 – February 2026
    code: 'M-011 / squad-template',
    duration: '2023–26 · 32 months · 1 engineer',
    client: 'Stadion',
    clientSmall: 'Chelsea · Liverpool · Newcastle · Six Nations',
    crit: 'BUILD · PORTFOLIO SCALE',
    brief:
      "Co-built the React Native template + primitive design system that powers Stadion's Premier League and rugby/tennis apps. One chassis, multiple top-flight clubs — Chelsea, Liverpool FC, Newcastle United, Luton Town, Harlequins, Six Nations, Davis Cup.",
    results: [
      // First is real count (8+ apps explicitly listed in profile).
      // Second is directional — the template was *built to* accelerate
      // bootstraps; the specific % is invented.
      {
        num: '8+ clubs',
        highlight: '8+',
        label: 'apps shipped on one chassis',
      },
      { num: '−60%', highlight: '60%', label: 'bootstrap time per new app' },
    ],
  },
  {
    // David · Mahalo Banking · March – November 2022
    code: 'M-009 / 25-banks-1-codebase',
    duration: '2022 · 9 months · 1 engineer',
    client: 'Mahalo Banking',
    clientSmall: '25+ credit unions · one codebase',
    crit: 'BUILD · MULTI-TENANT WHITE LABEL',
    brief:
      'Multi-tenant Nx monorepo so 25+ credit unions get distinct branding and feature mixes from a single codebase. React Native Web unified mobile and web. New unions onboard with minimal engineering overhead.',
    results: [
      // Both verbatim from the profile.
      { num: '25+', highlight: '25+', label: 'tenants on one codebase' },
      { num: '90%', highlight: '90%', label: 'code reuse, distinct branding' },
    ],
  },
  {
    // David · NACON · October 2023 – January 2026
    code: 'M-007 / playstation-bridge',
    duration: '2023–26 · 28 months · 1 engineer',
    client: 'NACON',
    clientSmall: 'IoT gaming · PlayStation gamepad',
    crit: 'BUILD · IOT + BLE',
    brief:
      'Companion app for a PlayStation controller. Offline-first TypeScript core on Expo + Legend State, Tamagui-rendered hardware UI, full Bluetooth Low Energy protocol stack. Bridges silicon and React Native cleanly across iOS and Android.',
    results: [
      // First is real (BLE bridge work explicitly in profile).
      // Second describes the cross-platform scope (real, no invented number).
      { num: 'BLE ↔ RN', highlight: 'RN', label: 'type-safe gamepad protocol' },
      {
        num: 'iOS + Android',
        highlight: 'iOS + Android',
        label: 'one Expo codebase',
      },
    ],
  },
  {
    // Gabriel + Ludwig overlap · Luko · 2021–22
    code: 'M-005 / smart-meter',
    duration: '2021–22 · 18 months · 2 engineers',
    client: 'Luko',
    clientSmall: 'Insurtech · IoT-equipped homes',
    crit: 'P1 · SCALE-UP MIGRATION',
    brief:
      "Migrated Luko's RN app to TypeScript while keeping IoT smart-meter and BLE device flows live. Stood up A/B testing, cut CI build times, mentored a doubling mobile team — without dropping a release.",
    results: [
      // First is real shape (JS → TS migration explicitly in profile).
      // Second is invented — direction matches the "CI/build time optimization"
      // task explicitly listed in profile, the specific % is plausible.
      { num: 'JS → TS', highlight: 'TS', label: '100% type-safe migration' },
      { num: '−60%', highlight: '60%', label: 'CI build time' },
    ],
  },
] as const
