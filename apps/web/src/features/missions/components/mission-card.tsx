import type { Mission as MissionData, MissionResult } from '../data'

interface MissionCardProps {
  mission: MissionData
}

function NumberWithHighlight({ num, highlight }: MissionResult) {
  if (!highlight) {
    return <span className="text-ink">{num}</span>
  }
  const parts = num.split(highlight)
  return (
    <span className="text-muted">
      {parts[0]}
      <span className="text-accent">{highlight}</span>
      {parts[1]}
    </span>
  )
}

export function MissionCard({ mission }: MissionCardProps) {
  return (
    <article className="group relative flex flex-col gap-5 border border-line bg-bg p-8 transition-colors hover:bg-bg-2">
      <header className="flex flex-wrap items-center justify-between gap-2 font-mono text-[12px] text-muted">
        <span className="text-ink">{mission.code}</span>
        <span>{mission.duration}</span>
      </header>
      <div className="font-sans text-[20px] text-ink">
        {mission.client}
        <small className="ml-2 font-mono text-[12px] font-normal text-muted">
          {mission.clientSmall}
        </small>
      </div>
      <div>
        <span className="inline-block bg-ink px-2 py-1 font-mono text-[11px] text-bg">
          {mission.crit}
        </span>
        <p className="mt-3 text-[15px] leading-[1.55] text-ink">
          {mission.brief}
        </p>
      </div>
      <dl className="grid grid-cols-2 gap-4 border-t border-line pt-5">
        {mission.results.map((r) => (
          <div key={r.num} className="flex flex-col gap-1">
            <dt className="font-sans text-[20px]">
              <NumberWithHighlight {...r} />
            </dt>
            <dd className="font-mono text-[11px] text-muted">{r.label}</dd>
          </div>
        ))}
      </dl>
    </article>
  )
}
