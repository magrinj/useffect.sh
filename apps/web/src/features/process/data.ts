export interface LifecycleStep {
  /** Identifier — also messages.process.steps.* namespace key. */
  id: 'mount' | 'render' | 'unmount'
  /** Phase stays code-style (`01 / componentDidMount`, …). */
  phase: string
  /** Length of bullet list at this phase. Used by the component to iterate
   *  over translated bullet entries. */
  bulletCount: number
}

export const steps: readonly LifecycleStep[] = [
  { id: 'mount', phase: '01 / componentDidMount', bulletCount: 4 },
  { id: 'render', phase: '02 / render', bulletCount: 4 },
  { id: 'unmount', phase: '03 / componentWillUnmount', bulletCount: 4 },
] as const
