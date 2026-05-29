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
