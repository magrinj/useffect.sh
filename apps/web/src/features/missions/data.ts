export interface MissionResult {
  num: string
  /** The accent-highlighted part of the number (substring of `num`). Optional. */
  highlight?: string
  /** Translation key under messages.missions.list.<id>.* — typically
   *  `r1Label` or `r2Label`. */
  labelKey: 'r1Label' | 'r2Label'
}

export interface Mission {
  /** Identifier — also messages.missions.list.* namespace key for the
   *  translatable `duration`, `clientSmall`, `crit`, `brief`, result
   *  labels. */
  id:
    | 'le-chat'
    | 'monorepo-merge'
    | 'squad-template'
    | '25-banks-1-codebase'
    | 'playstation-bridge'
    | 'smart-meter'
  /** Mission codename — stays universal (`M-014 / le-chat`). */
  code: string
  /** Client brand name — universal across locales (`Mistral AI`, `Sephora`). */
  client: string
  results: readonly [MissionResult, MissionResult]
}

// Mission entries are grounded in actual engagements from team members'
// LinkedIn histories. Numeric values + their highlighted parts stay in
// this file (universal); descriptive prose lives in messages.

export const missions: readonly Mission[] = [
  {
    id: 'le-chat',
    code: 'M-014 / le-chat',
    client: 'Mistral AI',
    results: [
      { num: '+12', highlight: '12', labelKey: 'r1Label' },
      { num: '0%', highlight: '0%', labelKey: 'r2Label' },
    ],
  },
  {
    id: 'monorepo-merge',
    code: 'M-013 / monorepo-merge',
    client: 'Sephora',
    results: [
      { num: '5 → 1', highlight: '1', labelKey: 'r1Label' },
      { num: '~90%', highlight: '90%', labelKey: 'r2Label' },
    ],
  },
  {
    id: 'squad-template',
    code: 'M-011 / squad-template',
    client: 'Stadion',
    results: [
      { num: '8+ clubs', highlight: '8+', labelKey: 'r1Label' },
      { num: '−60%', highlight: '60%', labelKey: 'r2Label' },
    ],
  },
  {
    id: '25-banks-1-codebase',
    code: 'M-009 / 25-banks-1-codebase',
    client: 'Mahalo Banking',
    results: [
      { num: '25+', highlight: '25+', labelKey: 'r1Label' },
      { num: '90%', highlight: '90%', labelKey: 'r2Label' },
    ],
  },
  {
    id: 'playstation-bridge',
    code: 'M-007 / playstation-bridge',
    client: 'NACON',
    results: [
      { num: 'BLE ↔ RN', highlight: 'RN', labelKey: 'r1Label' },
      { num: 'iOS + Android', highlight: 'iOS + Android', labelKey: 'r2Label' },
    ],
  },
  {
    id: 'smart-meter',
    code: 'M-005 / smart-meter',
    client: 'Luko',
    results: [
      { num: 'JS → TS', highlight: 'TS', labelKey: 'r1Label' },
      { num: '−60%', highlight: '60%', labelKey: 'r2Label' },
    ],
  },
] as const
