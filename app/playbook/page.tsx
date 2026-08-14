import type { Metadata } from 'next'
import { requireUser } from '@/lib/auth'
import { getContent, getMyApplication, getMyBookings, getMyChecklist } from '@/lib/data'
import { CONTENT_KEYS } from '@/lib/types'
import { LAUNCH_AGENDA, WHAT_WE_PROVIDE } from '@/lib/playbook'
import { Checklist } from '@/components/playbook/checklist'
import { ButtonLink } from '@/components/ui/button'

/**
 * Never prerender this route. It is behind an auth check, and a statically
 * generated page would be served without ever running that check — the build
 * output marked these routes `○ (Static)` when built without Supabase env vars,
 * which is exactly how a protected page ships as public HTML. Explicit beats
 * relying on `cookies()` happening to be reached during prerender.
 */
export const dynamic = 'force-dynamic'


export const metadata: Metadata = { title: 'Chapter launch playbook' }

export default async function PlaybookPage() {
  const profile = await requireUser('/playbook')

  const [application, bookings, checklist, followUp] = await Promise.all([
    getMyApplication(profile.id),
    getMyBookings(profile.id),
    getMyChecklist(profile.id),
    getContent(CONTENT_KEYS.playbookFollowUp),
  ])

  // Unlocked by applying OR booking — either action shows real intent.
  const unlocked = Boolean(application) || bookings.length > 0

  if (!unlocked) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 sm:px-6">
        <h1 className="font-display text-3xl font-extrabold text-ink-900">
          The launch playbook unlocks after you apply
        </h1>
        <p className="mt-4 text-lg text-ink-600">
          This page walks through exactly what happens in your launch meeting and what we will
          ask you to decide. It opens as soon as you have submitted an application or booked an
          intro call — whichever you do first.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <ButtonLink href="/apply" size="lg">
            Start a chapter
          </ButtonLink>
          <ButtonLink href="/book" variant="secondary" size="lg">
            Book a demo
          </ButtonLink>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
      <h1 className="font-display text-3xl font-extrabold text-ink-900 sm:text-4xl">
        Chapter launch playbook
      </h1>
      <p className="mt-4 max-w-prose text-lg text-ink-600">
        Everything your launch meeting covers, and the four things we will ask you to decide
        before it. Read this beforehand and the call goes much faster.
      </p>

      {/* ------------------------------------------------------- Agenda */}
      <section aria-labelledby="agenda" className="mt-14">
        <h2 id="agenda" className="font-display text-2xl font-extrabold text-ink-900">
          What we will cover in your launch meeting
        </h2>
        <ol className="mt-6 grid gap-4 sm:grid-cols-2">
          {LAUNCH_AGENDA.map((item) => (
            <li key={item.n} className="rounded-card border border-line bg-white p-6 shadow-sm">
              <span
                aria-hidden="true"
                className="flex h-9 w-9 items-center justify-center rounded-chip bg-green-100 font-display text-sm font-extrabold text-green-800"
              >
                {item.n}
              </span>
              <h3 className="mt-4 font-display text-base font-bold text-ink-900">
                {item.title}
              </h3>
              <p className="mt-2 text-sm text-ink-600">{item.body}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* ---------------------------------------------------- Checklist */}
      <section aria-labelledby="checklist" className="mt-16">
        <h2 id="checklist" className="font-display text-2xl font-extrabold text-ink-900">
          Your action items
        </h2>
        <p className="mt-2 max-w-prose text-ink-600">
          Work through these before your launch meeting. Your progress saves automatically and
          follows you across devices.
        </p>
        <div className="mt-6">
          <Checklist initial={checklist} />
        </div>
      </section>

      {/* ----------------------------------------------------- Provides */}
      <section aria-labelledby="provides" className="mt-16">
        <h2 id="provides" className="font-display text-2xl font-extrabold text-ink-900">
          What Financing the Future provides
        </h2>
        <ul className="mt-6 grid gap-4 sm:grid-cols-2">
          {WHAT_WE_PROVIDE.map((item) => (
            <li
              key={item.title}
              className="flex gap-3 rounded-card border border-beige-200 bg-beige-50 p-5"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                aria-hidden="true"
                className="mt-0.5 shrink-0 text-green-cta"
              >
                <circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="1.8" />
                <path
                  d="M6 10.5l2.5 2.5L14 7.5"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <div>
                <h3 className="font-display text-base font-bold text-ink-900">{item.title}</h3>
                <p className="mt-1 text-sm text-ink-600">{item.body}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* --------------------------------------------- Follow-up block
          Admin-editable. When unset this section does not render at all —
          no "coming soon", no lorem, nothing. See docs/SPEC.md R6/AC6. */}
      {followUp && (
        <section aria-labelledby="follow-up" className="mt-16">
          <h2 id="follow-up" className="font-display text-2xl font-extrabold text-ink-900">
            After your launch meeting
          </h2>
          <div className="mt-6 whitespace-pre-line rounded-card border border-line bg-white p-6 text-ink-700 shadow-sm sm:p-8">
            {followUp}
          </div>
        </section>
      )}

      <div className="mt-16 border-t border-line pt-8">
        <ButtonLink href="/dashboard" variant="secondary">
          Back to your dashboard
        </ButtonLink>
      </div>
    </div>
  )
}
