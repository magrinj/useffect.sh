'use client'

import Image from 'next/image'
import {
  forwardRef,
  memo,
  useCallback,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
} from 'react'

export type CarouselItem = {
  id: string
  name: string
  role: string
  image?: string
}

export type CarouselHandle = {
  /** Imperatively repaint the ring for the given scrub position. */
  render: (position: number) => void
}

type Props = {
  items: CarouselItem[]
  /** Index of the front-facing card (drives the accent border only). */
  activeIndex: number
  /** Card width in px, sized to fit the container (see computeCardLayout). */
  cardWidth: number
  /** Card height in px, keeps the 2:3 portrait ratio of the source images. */
  cardHeight: number
  /** Ring radius in px. */
  radius: number
  /** Top/bottom space reserved for the header & footer overlays. */
  insetTop: number
  insetBottom: number
}

// The whole ring is tilted backward so the camera looks slightly down on it
// — back cards naturally read as higher than front cards in the viewport.
const RING_TILT_DEG = -2

function cardOpacity(angleRad: number) {
  // Soft fog: full opacity at the front, fading toward the back but never
  // vanishing so the rear cards stay legible on the ring.
  return Math.max(0.22, (Math.cos(angleRad) + 0.45) / 1.45)
}

// The carousel is driven imperatively: scrubbing mutates the ring transform
// and per-card opacity/z-index directly on the DOM nodes instead of going
// through React state, so a 60fps scrub never reconciles the (image-bearing)
// card tree. React only re-renders when `activeIndex` flips (~once per card).
export const Carousel = forwardRef<CarouselHandle, Props>(function Carousel(
  { items, activeIndex, cardWidth, cardHeight, radius, insetTop, insetBottom },
  ref,
) {
  const ringRef = useRef<HTMLDivElement>(null)
  const cardRefs = useRef<(HTMLDivElement | null)[]>([])
  const N = items.length
  const itemAngle = 360 / N

  const render = useCallback(
    (position: number) => {
      const ring = ringRef.current
      if (ring) {
        ring.style.transform = `rotateX(${RING_TILT_DEG}deg) rotateY(${-position * itemAngle}deg)`
      }
      for (let i = 0; i < N; i++) {
        const el = cardRefs.current[i]
        if (!el) continue
        // Angle of card i relative to the camera, normalized to (-180, 180].
        let angle = ((i - position) * itemAngle) % 360
        if (angle > 180) angle -= 360
        if (angle <= -180) angle += 360
        el.style.opacity = String(cardOpacity((angle * Math.PI) / 180))
        el.style.zIndex = String(
          Math.max(0, 1000 - Math.round(Math.abs(angle))),
        )
      }
    },
    [N, itemAngle],
  )

  useImperativeHandle(ref, () => ({ render }), [render])

  // Paint the initial frame (and repaint if the ring geometry changes) before
  // the browser shows it, so cards never flash at position 0 / full opacity.
  useLayoutEffect(() => {
    render(0)
  }, [render])

  return (
    <div
      className="pointer-events-none absolute inset-0 flex items-center justify-center"
      style={{
        perspective: '1500px',
        paddingTop: insetTop,
        paddingBottom: insetBottom,
      }}
    >
      <div
        ref={ringRef}
        className="relative"
        style={{
          width: cardWidth,
          height: cardHeight,
          transformStyle: 'preserve-3d',
        }}
      >
        {items.map((item, i) => (
          // Each card's own transform is static (it never moves on the ring);
          // only the parent ring rotates. opacity/z-index are set imperatively.
          <div
            key={item.id}
            ref={(el) => {
              cardRefs.current[i] = el
            }}
            className="absolute inset-0"
            style={{
              transformStyle: 'preserve-3d',
              transform: `rotateY(${i * itemAngle}deg) translateZ(${radius}px)`,
            }}
          >
            <Portrait item={item} active={i === activeIndex} />
          </div>
        ))}
      </div>
    </div>
  )
})

const Portrait = memo(function Portrait({
  item,
  active,
}: {
  item: CarouselItem
  active: boolean
}) {
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
          ? 'border-accent shadow-[0_0_60px_rgba(0,200,83,0.4)]'
          : 'border-dark-line'
      }`}
      style={{
        background:
          'linear-gradient(135deg, rgba(11,11,10,0.6) 0%, rgba(19,19,17,0.85) 100%)',
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
            className="font-mono font-light tracking-wider text-bg"
            style={{ fontSize: 'clamp(40px, 12vmin, 72px)' }}
          >
            {initials}
          </span>
        </div>
      )}

      {!item.image && (
        <div className="absolute inset-x-0 bottom-0 border-t border-accent/30 bg-black/40 p-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-accent/70">
            {item.role}
          </p>
          <p className="mt-1 font-mono text-sm text-bg">{item.name}</p>
        </div>
      )}

      <div className="absolute left-2 top-2 font-mono text-[10px] text-accent/60">
        ID://{item.id}
      </div>
      <div className="absolute right-2 top-2 h-2 w-2 animate-pulse rounded-full bg-accent" />
    </div>
  )
})
