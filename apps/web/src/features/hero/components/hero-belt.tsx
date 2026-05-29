type Cell = { label: string; value: string; accent?: string }

const cells: Cell[] = [
  {
    label: '// crash-free median',
    value: '99.7% across 14 shipped apps',
    accent: '99.7%',
  },
  { label: '// time to first prod ship', value: '9 days · median' },
  { label: '// rate', value: '$240–320 / hr · senior only' },
  { label: '// stack', value: 'RN 0.74+ · Expo SDK 51 · New Arch' },
]

export function HeroBelt() {
  return (
    <div className="grid grid-cols-1 gap-6 border-t border-line pt-8 sm:grid-cols-2 lg:grid-cols-4">
      {cells.map((c) => (
        <div key={c.label} className="flex flex-col gap-2">
          <span className="font-mono text-[12px] text-muted">{c.label}</span>
          <span className="font-mono text-[14px] text-ink">
            {c.accent ? (
              <>
                <span className="text-accent">{c.accent}</span>
                {c.value.replace(c.accent, '')}
              </>
            ) : (
              c.value
            )}
          </span>
        </div>
      ))}
    </div>
  )
}
