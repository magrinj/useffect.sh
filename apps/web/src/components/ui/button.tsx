import type {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  ReactNode,
} from 'react'
import { cn } from '@/lib/cn'

type Variant = 'default' | 'ghost' | 'invert'
type Size = 'md' | 'lg' | 'xl'

interface CommonProps {
  variant?: Variant
  size?: Size
  withArrow?: boolean
  children: ReactNode
  className?: string
}

type ButtonAsAnchor = CommonProps &
  AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }
type ButtonAsButton = CommonProps &
  ButtonHTMLAttributes<HTMLButtonElement> & { href?: undefined }

export type ButtonProps = ButtonAsAnchor | ButtonAsButton

const base =
  'group inline-flex items-center gap-[10px] font-mono text-[13px] font-medium leading-none whitespace-nowrap border transition-[transform,background,color,border-color] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg'

const variants: Record<Variant, string> = {
  default:
    'bg-ink text-bg border-ink hover:bg-accent hover:text-dark hover:border-accent',
  ghost: 'bg-transparent text-ink border-line-strong hover:border-ink',
  invert:
    'bg-bg text-ink border-bg hover:bg-accent hover:text-dark hover:border-accent',
}

const sizes: Record<Size, string> = {
  md: 'px-4 py-3 text-[13px]',
  lg: 'px-[22px] py-[18px] text-[14px]',
  xl: 'px-[26px] py-[22px] text-[15px]',
}

export function Button(props: ButtonProps) {
  const {
    variant = 'default',
    size = 'md',
    withArrow = true,
    children,
    className,
    ...rest
  } = props

  const cls = cn(base, variants[variant], sizes[size], className)
  const inner = (
    <>
      {children}
      {withArrow && (
        <span
          aria-hidden
          className="inline-block transition-transform duration-[250ms] group-hover:translate-x-[3px]"
        >
          →
        </span>
      )}
    </>
  )

  if ('href' in rest && rest.href !== undefined) {
    return (
      <a {...rest} className={cls}>
        {inner}
      </a>
    )
  }
  return (
    <button
      type="button"
      {...(rest as ButtonHTMLAttributes<HTMLButtonElement>)}
      className={cls}
    >
      {inner}
    </button>
  )
}
