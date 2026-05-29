'use client'

import Image from 'next/image'

export type CarouselItem = {
  id: string
  name: string
  role: string
  image?: string
}

type Props = {
  items: CarouselItem[]
  position: number
}

// Cards sit on a ring around the Y axis. The radius needs to be at least
// W / (2 * sin(pi/N)) to avoid overlap; clamp() keeps things responsive.
const CARD_WIDTH = 'clamp(180px, 55vw, 280px)'
const CARD_HEIGHT = 'clamp(280px, 55vh, 400px)'
const RING_RADIUS = 'clamp(320px, 90vw, 560px)'
// The whole ring is tilted backward so the camera looks slightly down on it
// — back cards naturally read as higher than front cards in the viewport.
const RING_TILT_DEG = -2

export function Carousel({ items, position }: Props) {
  const N = items.length
  const itemAngle = 360 / N
  const activeIndex = ((Math.round(position) % N) + N) % N

  return (
    <div
      className="pointer-events-none absolute inset-0 flex items-center justify-center"
      style={{ perspective: '1500px' }}
    >
      <div
        className="relative"
        style={{
          width: CARD_WIDTH,
          height: CARD_HEIGHT,
          transformStyle: 'preserve-3d',
          transform: `rotateX(${RING_TILT_DEG}deg) rotateY(${-position * itemAngle}deg)`,
        }}
      >
        {items.map((item, i) => {
          // Angle of card i relative to the camera, normalized to (-180, 180].
          let angle = ((i - position) * itemAngle) % 360
          if (angle > 180) angle -= 360
          if (angle <= -180) angle += 360
          const angleRad = (angle * Math.PI) / 180
          const absAngle = Math.abs(angle)
          // Soft fog: full opacity at the front, near-zero at the back, with
          // a faint visible sliver around 90° (edge-on cards).
          const opacity = Math.max(0, (Math.cos(angleRad) + 0.35) / 1.35)
          const zIndex = Math.max(0, 1000 - Math.round(absAngle))

          // Cards sit flat on the ring at the same vertical level — the
          // overall ring tilt above lifts the back ones into view.
          return (
            <div
              key={item.id}
              className="absolute inset-0"
              style={{
                transformStyle: 'preserve-3d',
                transform: `rotateY(${i * itemAngle}deg) translateZ(${RING_RADIUS})`,
                opacity,
                zIndex,
              }}
            >
              <Portrait item={item} active={i === activeIndex} />
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
      className={`relative h-full w-full overflow-hidden rounded-lg border backdrop-blur-sm transition-colors ${
        active
          ? 'border-cyan-300/80 shadow-[0_0_60px_rgba(34,211,238,0.4)]'
          : 'border-cyan-400/20'
      }`}
      style={{
        background:
          'linear-gradient(135deg, rgba(8,47,73,0.6) 0%, rgba(15,23,42,0.8) 100%)',
      }}
    >
      {item.image ? (
        <Image
          src={item.image}
          alt={item.name}
          fill
          sizes="280px"
          priority={active}
          className="object-cover"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center">
          <span
            className="font-mono font-light tracking-wider text-cyan-100/90"
            style={{ fontSize: 'clamp(40px, 12vmin, 72px)' }}
          >
            {initials}
          </span>
        </div>
      )}

      {!item.image && (
        <div className="absolute inset-x-0 bottom-0 border-t border-cyan-300/30 bg-black/40 p-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-cyan-300/70">
            {item.role}
          </p>
          <p className="mt-1 font-mono text-sm text-cyan-50">{item.name}</p>
        </div>
      )}

      <div className="absolute left-2 top-2 font-mono text-[10px] text-cyan-300/60">
        ID://{item.id}
      </div>
      <div className="absolute right-2 top-2 h-2 w-2 animate-pulse rounded-full bg-cyan-300" />
    </div>
  )
}
