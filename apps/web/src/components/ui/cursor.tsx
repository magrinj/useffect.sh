import { cn } from '@/lib/cn'

interface CursorProps {
  variant?: 'accent' | 'ink'
  className?: string
}

export function Cursor({ variant = 'accent', className }: CursorProps) {
  return (
    <span
      aria-hidden
      className={cn(
        'inline-block h-[1em] w-[0.55em] align-[-0.12em] ml-[0.08em] animate-blink',
        variant === 'ink' ? 'bg-ink' : 'bg-accent',
        className,
      )}
    />
  )
}
