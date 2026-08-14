import type { Metadata } from 'next'
import Link from 'next/link'
import { requireUser } from '@/lib/auth'
import { getMyApplication, getMyBookings, getMyChecklist } from '@/lib/data'
import { CHECKLIST_ITEMS, STATUS_COPY } from '@/lib/types'
import { BookingCard } from '@/components/booking/booking-card'
import { ButtonLink } from '@/components/ui/button'
import { StatusBadge } from '@/components/ui/status-badge'

/**
 * Never prerender this route. It is behind an auth check, and a statically
 * generated page would be served without ever running that check — the build
 * output marked these routes `○ (Static)` when built without Supabase env vars,
 * which is exactly how a protected page ships as public HTML. Explicit beats
 * relying on `cookies()` happening to be reached during prerender.
 */
export const dynamic = 'force-dynamic'


export const metadata: Metadata = { title: 'Dashboard' }

export default async function DashboardPage() {
  const profile = await requireUser('/dashboard')

  const [application, bookings, checklist] = await Promise.all([
    getMyApplication(profile.id),
    getMyBookings(profile.id),
    getMyChecklist(profile.id),
  ])

  const now = new Date()
  const upcoming = bookings.filter((b) => b.demo_slots && new Date(b.demo_slots.starts_at) > now)
  const past = bookings.filter((b) => b.demo_slots && new Date(b.demo_slots.starts_at) <= now)
  const doneCount = CHECKLIST_ITEMS.filter((item) => checklist[item.key]).length

  /**
   * The single most useful next action. A status label tells someone where they
   * are; this tells them what to do — which is what actually keeps a founder
   * moving between the application and the first class.
   */
  const nextAction = (() => {
    if (!application) {
      return {
        title: 'Apply to start a chapter',
        body: 'Five minutes, and your answers save as you go.',
        href: '/apply',
        cta: 'Start your application',
      }
    }
    if (upcoming.length === 0) {
      return {
        title: 'Book your intro call',
        body: 'This is the step between applying and getting your curriculum. Pick any time that works.',
        href: '/book',
        cta: 'Pick a time',
      }
    }
    if (doneCount < CHECKLIST_ITEMS.length) {
      return {
        title: 'Work through your launch checklist',
        body: `${doneCount} of ${CHECKLIST_ITEMS.length} done. Finishing these before your call means we can go straight to planning.`,
        href: '/playbook',
        cta: 'Open the playbook',
      }
    }
    return {
      title: 'You are ready for your call',
      body: 'Checklist complete and your call is booked. Nothing else to do right now.',
      href: '/playbook',
      cta: 'Review the playbook',
    }
  })()

  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
      <h1 className="font-display text-3xl font-extrabold text-ink-900 sm:text-4xl">
        {profile.full_name
          ? `Welcome back, ${profile.full_name.split(' ')[0]}`
          : 'Your dashboard'}
      </h1>

      {/* ------------------------------------------------- Next action */}
      <div className="mt-8 rounded-card border-2 border-green-cta bg-green-50 p-6 sm:p-8">
        <p className="font-display text-xs font-bold uppercase tracking-[0.1em] text-green-cta">
          Next step
        </p>
        <h2 className="mt-2 font-display text-2xl font-extrabold text-green-900">
          {nextAction.title}
        </h2>
        <p className="mt-2 max-w-prose text-ink-700">{nextAction.body}</p>
        <div className="mt-5">
          <ButtonLink href={nextAction.href}>{nextAction.cta}</ButtonLink>
        </div>
      </div>

      <div className="mt-12 grid gap-8 sm:grid-cols-2">
        {/* ------------------------------------------- Application */}
        <section aria-labelledby="application-heading">
          <h2 id="application-heading" className="font-display text-xl font-bold text-ink-900">
            Your application
          </h2>
          {application ? (
            <div className="mt-4 rounded-card border border-line bg-white p-6 shadow-sm">
              <StatusBadge status={application.status} />
              <p className="mt-3 text-sm text-ink-600">
                {STATUS_COPY[application.status].explanation}
              </p>
              <dl className="mt-4 space-y-1 text-sm">
                <div className="flex flex-wrap gap-x-2">
                  <dt className="font-semibold text-ink-900">Organization:</dt>
                  <dd className="text-ink-600">{application.organization}</dd>
                </div>
                <div className="flex flex-wrap gap-x-2">
                  <dt className="font-semibold text-ink-900">Location:</dt>
                  <dd className="text-ink-600">
                    {application.city}, {application.country}
                  </dd>
                </div>
                <div className="flex flex-wrap gap-x-2">
                  <dt className="font-semibold text-ink-900">Submitted:</dt>
                  <dd className="text-ink-600">
                    {new Date(application.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </dd>
                </div>
              </dl>
            </div>
          ) : (
            <div className="mt-4 rounded-card border border-dashed border-line-strong bg-beige-50 p-6">
              <p className="text-sm text-ink-600">
                You have not applied yet. Applying is what unlocks the playbook and your
                curriculum.
              </p>
            </div>
          )}
        </section>

        {/* --------------------------------------------- Checklist */}
        <section aria-labelledby="progress-heading">
          <h2 id="progress-heading" className="font-display text-xl font-bold text-ink-900">
            Launch checklist
          </h2>
          <div className="mt-4 rounded-card border border-line bg-white p-6 shadow-sm">
            <p className="tabular font-display text-3xl font-extrabold text-ink-900">
              {doneCount}
              <span className="text-ink-500">/{CHECKLIST_ITEMS.length}</span>
            </p>
            <p className="mt-1 text-sm text-ink-600">action items complete</p>
            <div
              role="progressbar"
              aria-valuenow={doneCount}
              aria-valuemin={0}
              aria-valuemax={CHECKLIST_ITEMS.length}
              aria-valuetext={`${doneCount} of ${CHECKLIST_ITEMS.length} complete`}
              className="mt-4 h-2 overflow-hidden rounded-full bg-beige-200"
            >
              <div
                className="h-full rounded-full bg-green-cta"
                style={{ width: `${(doneCount / CHECKLIST_ITEMS.length) * 100}%` }}
              />
            </div>
            <Link
              href="/playbook"
              className="mt-4 inline-flex min-h-[44px] items-center text-sm font-semibold text-green-cta underline underline-offset-2 hover:text-green-800"
            >
              Open the playbook
            </Link>
          </div>
        </section>
      </div>

      {/* ---------------------------------------------------- Calls */}
      <section aria-labelledby="calls-heading" className="mt-12">
        <h2 id="calls-heading" className="font-display text-xl font-bold text-ink-900">
          Your calls
        </h2>

        {upcoming.length === 0 && past.length === 0 ? (
          <div className="mt-4 rounded-card border border-dashed border-line-strong bg-beige-50 p-6">
            <p className="text-sm text-ink-600">
              No calls booked yet.{' '}
              <Link
                href="/book"
                className="font-semibold text-green-cta underline underline-offset-2 hover:text-green-800"
              >
                Pick a time
              </Link>
              .
            </p>
          </div>
        ) : (
          <div className="mt-4 space-y-6">
            {upcoming.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wide text-ink-500">
                  Upcoming
                </h3>
                <div className="mt-3 space-y-4">
                  {upcoming.map((booking) => (
                    <BookingCard key={booking.id} booking={booking} cancellable />
                  ))}
                </div>
              </div>
            )}
            {past.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wide text-ink-500">
                  Past
                </h3>
                <div className="mt-3 space-y-4">
                  {past.map((booking) => (
                    <BookingCard key={booking.id} booking={booking} past />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </section>

      {/* ---------------------------------------- Curriculum (gated) */}
      {application?.status === 'active_chapter' && (
        <section aria-labelledby="resources-heading" className="mt-12">
          <h2 id="resources-heading" className="font-display text-xl font-bold text-ink-900">
            Curriculum and resources
          </h2>
          <div className="mt-4 rounded-card border border-line bg-white p-6 shadow-sm">
            <p className="text-sm text-ink-600">
              Your chapter is active. Your curriculum, teaching resources, fundraising page, and
              chapter graphics are shared with you directly by the team — reach out in the
              chapter group chat if anything is missing.
            </p>
          </div>
        </section>
      )}

      {profile.is_admin && (
        <div className="mt-12 border-t border-line pt-8">
          <ButtonLink href="/admin" variant="secondary">
            Admin
          </ButtonLink>
        </div>
      )}
    </div>
  )
}
