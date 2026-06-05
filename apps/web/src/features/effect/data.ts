export interface MetricRow {
  /** Identifier — also messages.effect.metrics.* namespace key for the
   *  translatable `name` and `small` fields. */
  id:
    | 'crashFree'
    | 'coldStart'
    | 'appSize'
    | 'storeRating'
    | 'ciBuild'
    | 'jsBundle'
  /** Numeric values + units stay universal (numbers + standard SI symbols). */
  before: { value: string; unit: string }
  after: { value: string; unit: string }
  delta: string
}

export const metrics: readonly MetricRow[] = [
  {
    id: 'crashFree',
    before: { value: '94.2', unit: '%' },
    after: { value: '99.7', unit: '%' },
    delta: '+5.5pt',
  },
  {
    id: 'coldStart',
    before: { value: '4.1', unit: 's' },
    after: { value: '1.2', unit: 's' },
    delta: '−71%',
  },
  {
    id: 'appSize',
    before: { value: '180', unit: 'MB' },
    after: { value: '62', unit: 'MB' },
    delta: '−66%',
  },
  {
    id: 'storeRating',
    before: { value: '3.2', unit: '★' },
    after: { value: '4.7', unit: '★' },
    delta: '+1.5',
  },
  {
    id: 'ciBuild',
    before: { value: '24', unit: 'min' },
    after: { value: '6', unit: 'min' },
    delta: '−75%',
  },
  {
    id: 'jsBundle',
    before: { value: '8.4', unit: 'MB' },
    after: { value: '2.1', unit: 'MB' },
    delta: '−75%',
  },
] as const
