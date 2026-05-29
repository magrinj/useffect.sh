'use client'

export type CarouselItem = {
  id: string
  name: string
  role: string
}

type Props = {
  items: CarouselItem[]
  index: number
}

export function Carousel({ items, index }: Props) {
  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center [perspective:1400px]">
      <div className="relative h-[420px] w-full max-w-6xl [transform-style:preserve-3d]">
        {items.map((item, i) => {
          const offset = i - index
          const abs = Math.abs(offset)
          const translateX = offset * 280
          const translateZ = -abs * 220
          const rotateY = offset * -22
          const opacity = abs > 3 ? 0 : 1 - abs * 0.18
          const zIndex = 100 - abs

          return (
            <div
              key={item.id}
              className="absolute left-1/2 top-1/2 h-[400px] w-[280px] -translate-x-1/2 -translate-y-1/2 transition-all duration-500 ease-out"
              style={{
                transform: `translate3d(calc(-50% + ${translateX}px), -50%, ${translateZ}px) rotateY(${rotateY}deg)`,
                opacity,
                zIndex,
              }}
            >
              <Portrait item={item} active={offset === 0} />
            </div>
          )
        })}
      </div>
    </div>
  )
}

function Portrait({ item, active }: { item: CarouselItem; active: boolean }) {
  const initials = item.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <div
      className={`relative h-full w-full overflow-hidden rounded-lg border backdrop-blur-sm transition-all ${
        active
          ? 'border-cyan-300/80 shadow-[0_0_60px_rgba(34,211,238,0.4)]'
          : 'border-cyan-400/20'
      }`}
      style={{
        background:
          'linear-gradient(135deg, rgba(8,47,73,0.6) 0%, rgba(15,23,42,0.8) 100%)',
      }}
    >
      <div className="flex h-full w-full items-center justify-center">
        <span className="font-mono text-7xl font-light tracking-wider text-cyan-100/90">
          {initials}
        </span>
      </div>

      <div className="absolute inset-x-0 bottom-0 border-t border-cyan-300/30 bg-black/40 p-4">
        <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-cyan-300/70">
          {item.role}
        </p>
        <p className="mt-1 font-mono text-sm text-cyan-50">{item.name}</p>
      </div>

      <div className="absolute left-2 top-2 font-mono text-[10px] text-cyan-300/60">
        ID://{item.id}
      </div>
      <div className="absolute right-2 top-2 h-2 w-2 animate-pulse rounded-full bg-cyan-300" />
    </div>
  )
}
