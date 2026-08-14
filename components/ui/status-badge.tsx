import type { ApplicationStatus } from '@/lib/types'
import { STATUS_COPY } from '@/lib/types'
import { cn } from '@/lib/utils'

/**
 * Application status.
 *
 * Colour is never the only signal — each status carries its own text label and
 * a distinct icon shape, so the badge still reads correctly in greyscale, in
 * forced-colours mode, or to someone who cannot distinguish the hues.
 */
const STYLES: Record<ApplicationStatus, string> = {
  new: 'bg-[color:var(--status-new-surface)] text-ink-700 border-line-strong',
  demo_scheduled:
    'bg-[color:var(--status-scheduled-surface)] text-[color:var(--status-scheduled)] border-[color:var(--status-scheduled)]',
  onboarded:
    'bg-[color:var(--status-onboarded-surface)] text-[color:var(--status-onboarded)] border-[color:var(--status-onboarded)]',
  active_chapter: 'bg-[color:var(--status-active-surface)] text-green-cta border-green-cta',
}

function Icon({ status }: { status: ApplicationStatus }) {
  const common = { width: 14, height: 14, viewBox: '0 0 16 16', 'aria-hidden': true } as const
  switch (status) {
    case 'new': // inbox tray
      return (
        <svg {...common} fill="none" stroke="currentColor" strokeWidth="1.6">
          <path d="M2 9.5h3l1 2h4l1-2h3M2 9.5L3.8 3.5h8.4L14 9.5v3H2v-3z" strokeLinejoin="round" />
        </svg>
      )
    case 'demo_scheduled': // calendar
      return (
        <svg {...common} fill="none" stroke="currentColor" strokeWidth="1.6">
          <rect x="2.5" y="3.5" width="11" height="10" rx="1.5" />
          <path d="M2.5 6.5h11M5.5 2v3M10.5 2v3" strokeLinecap="round" />
        </svg>
      )
    case 'onboarded': // checklist
      return (
        <svg {...common} fill="none" stroke="currentColor" strokeWidth="1.6">
          <path d="M2 4.5l1.5 1.5L6 3.5M2 11l1.5 1.5L6 10M8 5h6M8 11.5h6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )
    case 'active_chapter': // filled check
      return (
        <svg {...common} fill="none" stroke="currentColor" strokeWidth="1.8">
          <circle cx="8" cy="8" r="6.2" />
          <path d="M5.3 8.2l2 2 3.4-4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )
  }
}

export function StatusBadge({
  status,
  className,
}: {
  status: ApplicationStatus
  className?: string
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-chip border px-2.5 py-1 text-xs font-semibold',
        STYLES[status],
        className,
      )}
    >
      <Icon status={status} />
      {STATUS_COPY[status].label}
    </span>
  )
}
