import { ButtonLink } from '@/components/ui/button'
import { SIGNUP_FORM_URL } from '@/lib/program'
import { LEADERSHIP } from '@/lib/people'
import { cn } from '@/lib/utils'

/**
 * Sign-up form CTA.
 *
 * Two states, driven entirely by `SIGNUP_FORM_URL` in lib/program.ts:
 *
 *   URL set  → a normal outbound link to the Google Form
 *   null     → the same button, disabled and labelled "opening soon", with a
 *              working alternative (email) directly underneath
 *
 * The disabled state is deliberate rather than hiding the button. Rendering a
 * live-looking control that goes nowhere strands a visitor who clicks it, and
 * hiding it entirely would mean the layout shifts the day the URL is added.
 * This way the page is final now and one constant flips it on.
 */
export function SignUpFormButton({
  size = 'lg',
  variant = 'secondary',
  className,
  showFallback = true,
}: {
  size?: 'md' | 'lg'
  variant?: 'primary' | 'secondary'
  className?: string
  showFallback?: boolean
}) {
  if (SIGNUP_FORM_URL) {
    return (
      <div className={cn(className)}>
        <ButtonLink
          href={SIGNUP_FORM_URL}
          size={size}
          variant={variant}
          target="_blank"
          rel="noopener noreferrer"
        >
          Sign up
          <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path
              d="M6 3h7v7M13 3L3.5 12.5"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span className="sr-only">(opens the sign-up form in a new tab)</span>
        </ButtonLink>
      </div>
    )
  }

  return (
    <div className={cn(className)}>
      {/* aria-disabled rather than the `disabled` attribute: the control stays
          reachable by keyboard and screen reader so its state is discoverable,
          instead of being silently skipped in the tab order. */}
      <span
        role="link"
        aria-disabled="true"
        tabIndex={0}
        className={cn(
          'inline-flex cursor-not-allowed items-center justify-center gap-2 rounded-ctl',
          'border border-line-strong bg-beige-100 font-semibold text-ink-500',
          size === 'lg' ? 'min-h-[52px] px-7 text-base' : 'min-h-[44px] px-5 text-[15px]',
        )}
      >
        Sign up
        <span className="rounded-chip bg-white px-2 py-0.5 text-xs font-bold uppercase tracking-wide text-ink-500">
          Opening soon
        </span>
      </span>

      {showFallback && (
        <p className="mt-3 max-w-prose text-sm text-ink-600">
          Our sign-up form is not open yet. In the meantime, book a call or email{' '}
          {LEADERSHIP.map((person, index) => (
            <span key={person.email}>
              <a
                href={`mailto:${person.email}`}
                className="font-semibold text-green-cta underline underline-offset-2 hover:text-green-800"
              >
                {person.email}
              </a>
              {index < LEADERSHIP.length - 1 ? ' or ' : ''}
            </span>
          ))}
          .
        </p>
      )}
    </div>
  )
}
