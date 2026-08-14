import { forwardRef } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

type Variant = 'primary' | 'secondary' | 'ghost'
type Size = 'md' | 'lg'

/**
 * All variants are at least 44px tall so every button clears the minimum touch
 * target without needing per-instance padding tweaks.
 */
const VARIANTS: Record<Variant, string> = {
  // `on-green` swaps the focus ring to white — a green ring on a green button
  // is invisible.
  primary: 'on-green bg-green-cta text-white hover:bg-green-800 border border-transparent',
  secondary: 'bg-white text-ink-900 border border-line-strong hover:bg-beige-50',
  ghost: 'bg-transparent text-green-800 border border-transparent hover:bg-green-50',
}

const SIZES: Record<Size, string> = {
  md: 'min-h-[44px] px-5 text-[15px]',
  lg: 'min-h-[52px] px-7 text-base',
}

function classes(variant: Variant, size: Size, className?: string) {
  return cn(
    'inline-flex items-center justify-center gap-2 rounded-ctl font-semibold',
    'transition-colors duration-150',
    'disabled:cursor-not-allowed disabled:opacity-55',
    VARIANTS[variant],
    SIZES[size],
    className,
  )
}

/**
 * forwardRef so callers can move focus onto a button — needed wherever an
 * inline confirmation replaces the control the user just activated, which would
 * otherwise drop focus to <body>.
 */
export const Button = forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: Size }
>(function Button({ variant = 'primary', size = 'md', className, ...props }, ref) {
  return <button ref={ref} className={classes(variant, size, className)} {...props} />
})

export function ButtonLink({
  href,
  variant = 'primary',
  size = 'md',
  className,
  ...props
}: React.ComponentProps<typeof Link> & { variant?: Variant; size?: Size }) {
  return <Link href={href} className={classes(variant, size, className)} {...props} />
}
