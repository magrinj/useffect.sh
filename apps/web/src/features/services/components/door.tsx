import { Button } from '@/components/ui/button'
import type { Door as DoorData } from '../data'

interface DoorProps {
  door: DoorData
}

export function Door({ door }: DoorProps) {
  return (
    <article className="flex flex-col gap-6 border border-line bg-bg-2 p-8">
      <span className="inline-flex items-center gap-2 font-mono text-[12px] text-muted">
        <span className="inline-flex size-4 items-center justify-center border border-line-strong text-ink">
          {door.glyph}
        </span>
        {door.tag}
      </span>
      <h3 className="font-sans text-[44px] font-medium leading-none tracking-[-0.02em] text-ink">
        {door.title}
      </h3>
      <p className="font-mono text-[14px] text-muted">{door.quote}</p>
      <ul className="flex flex-col">
        {door.items.map((item) => (
          <li
            key={item.idx}
            className="grid grid-cols-[40px_1fr_auto] items-center gap-3 border-t border-line py-3 font-mono text-[13px]"
          >
            <span className="text-muted">{item.idx}</span>
            <span className="text-ink">{item.label}</span>
            <span className="text-muted">{item.meta}</span>
          </li>
        ))}
      </ul>
      <div className="flex flex-wrap items-center justify-between gap-4 border-t border-line pt-6">
        <span className="font-mono text-[12px] text-muted">
          {door.footPrice}
        </span>
        <Button href={door.ctaHref}>{door.ctaLabel}</Button>
      </div>
    </article>
  )
}
