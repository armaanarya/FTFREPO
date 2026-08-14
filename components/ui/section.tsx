import { cn } from '@/lib/utils'

/**
 * Page section with consistent vertical rhythm and an optional warm background.
 * Alternating white / beige is what gives the page its structure — there are no
 * decorative dividers anywhere in this design.
 */
export function Section({
  id,
  tone = 'white',
  className,
  children,
}: {
  id?: string
  tone?: 'white' | 'beige' | 'green'
  className?: string
  children: React.ReactNode
}) {
  return (
    <section
      id={id}
      className={cn(
        'px-4 py-16 sm:px-6 sm:py-20 lg:py-24',
        tone === 'beige' && 'bg-beige-50',
        tone === 'green' && 'bg-green-800 text-white',
        className,
      )}
    >
      <div className="mx-auto max-w-content">{children}</div>
    </section>
  )
}

export function SectionHeading({
  eyebrow,
  title,
  lede,
  id,
  inverted,
}: {
  eyebrow?: string
  title: string
  lede?: string
  id?: string
  inverted?: boolean
}) {
  return (
    <div className="max-w-prose">
      {eyebrow && (
        <p
          className={cn(
            'font-display text-xs font-bold uppercase tracking-[0.1em]',
            inverted ? 'text-green-100' : 'text-green-cta',
          )}
        >
          {eyebrow}
        </p>
      )}
      <h2
        id={id}
        className={cn(
          'mt-2 font-display text-3xl font-extrabold sm:text-4xl',
          inverted && 'text-white',
        )}
      >
        {title}
      </h2>
      {lede && (
        <p className={cn('mt-4 text-lg', inverted ? 'text-green-100' : 'text-ink-600')}>{lede}</p>
      )}
    </div>
  )
}
