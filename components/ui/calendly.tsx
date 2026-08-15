import { ButtonLink } from '@/components/ui/button'
import { CALENDLY_URL, SCHEDULING_NOTE } from '@/lib/program'
import { LEADERSHIP } from '@/lib/people'
import { cn } from '@/lib/utils'

/**
 * Booking call-to-action.
 *
 * Deliberately a link, not an embedded Calendly iframe: the site's CSP forbids
 * third-party frames and scripts, and an embed would also drop a tracking
 * cookie on every visitor who merely scrolled past. A link keeps the page
 * self-contained and only sends people to Calendly when they choose to go.
 *
 * The scheduling note is not optional decoration — a student whose only free
 * hour is outside the published slots will otherwise assume the program is not
 * for them and leave.
 */
export function BookACall({
  size = 'lg',
  className,
  showNote = true,
}: {
  size?: 'md' | 'lg'
  className?: string
  showNote?: boolean
}) {
  return (
    <div className={cn(className)}>
      <ButtonLink
        href={CALENDLY_URL}
        size={size}
        target="_blank"
        rel="noopener noreferrer"
      >
        Book a call
        <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path
            d="M6 3h7v7M13 3L3.5 12.5"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <span className="sr-only">(opens Calendly in a new tab)</span>
      </ButtonLink>

      {showNote && (
        <p className="mt-4 max-w-prose text-sm text-ink-600">
          {SCHEDULING_NOTE}{' '}
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
