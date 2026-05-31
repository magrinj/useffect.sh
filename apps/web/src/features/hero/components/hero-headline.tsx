import { Cursor } from '@/components/ui/cursor'

export function HeroHeadline() {
  return (
    <h1 className="font-sans text-[clamp(56px,9vw,128px)] font-medium leading-[0.96] tracking-[-0.03em] text-ink">
      <span className="block">
        WE <span className="text-accent">UN</span>FUCK
      </span>
      <span className="block">
        THE{' '}
        <span className="strike">
          <span className="word">
            FUCK
            {/* RGB-split copies for the glitch easter egg — hidden from a11y so
                the heading still reads a single "FUCK". */}
            <span className="glitch-layer glitch-r" aria-hidden="true">
              FUCK
            </span>
            <span className="glitch-layer glitch-b" aria-hidden="true">
              FUCK
            </span>
          </span>
        </span>
      </span>
      <span className="block">
        CODE
        <Cursor variant="ink" />
      </span>
    </h1>
  )
}
