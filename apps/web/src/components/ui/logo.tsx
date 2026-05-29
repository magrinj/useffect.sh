import { cn } from '@/lib/cn'

interface LogoProps {
  className?: string
}

export function Logo({ className }: LogoProps) {
  return (
    <span
      className={cn(
        'inline-flex items-baseline font-mono text-[15px] font-semibold tracking-[-0.01em]',
        className,
      )}
      role="img"
      aria-label="useffect.sh"
    >
      <span className="mr-[6px] text-muted">~/</span>
      <span>us</span>
      <span className="text-accent font-semibold">e</span>
      <span>ffect</span>
      <span className="text-muted">.sh</span>
    </span>
  )
}
