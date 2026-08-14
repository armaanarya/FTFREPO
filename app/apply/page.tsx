import type { Metadata } from 'next'
import Link from 'next/link'
import { requireUser } from '@/lib/auth'
import { getAvailableSlots, getMyApplication } from '@/lib/data'
import { STATUS_COPY } from '@/lib/types'
import { ApplicationForm } from './application-form'
import { ButtonLink } from '@/components/ui/button'

/**
 * Never prerender this route. It is behind an auth check, and a statically
 * generated page would be served without ever running that check — the build
 * output marked these routes `○ (Static)` when built without Supabase env vars,
 * which is exactly how a protected page ships as public HTML. Explicit beats
 * relying on `cookies()` happening to be reached during prerender.
 */
export const dynamic = 'force-dynamic'


export const metadata: Metadata = { title: 'Start a chapter' }

export default async function ApplyPage() {
  const profile = await requireUser('/apply')
  const existing = await getMyApplication(profile.id)
  const slots = await getAvailableSlots()

  // An existing applicant gets their status, not a blank form that would fail
  // on the unique constraint after they filled it all in again.
  if (existing) {
    const copy = STATUS_COPY[existing.status]
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <h1 className="font-display text-3xl font-extrabold text-ink-900 sm:text-4xl">
          You have already applied
        </h1>
        <div className="mt-6 rounded-card border border-line bg-beige-50 p-6">
          <p className="text-sm font-semibold uppercase tracking-wide text-ink-500">
            Current status
          </p>
          <p className="mt-1 font-display text-2xl font-bold text-ink-900">{copy.label}</p>
          <p className="mt-2 text-ink-600">{copy.explanation}</p>
        </div>
        <div className="mt-8 flex flex-wrap gap-3">
          <ButtonLink href="/dashboard">Go to your dashboard</ButtonLink>
          <ButtonLink href="/book" variant="secondary">
            Book a call
          </ButtonLink>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <h1 className="font-display text-3xl font-extrabold text-ink-900 sm:text-4xl">
        Start a chapter
      </h1>
      <p className="mt-4 max-w-prose text-lg text-ink-600">
        Four short steps. Your answers save as you go, so you can leave and come back. When you
        are done you will be able to book your intro call right away.
      </p>
      <p className="mt-3 text-sm text-ink-500">
        Not sure yet?{' '}
        <Link
          href="/playbook"
          className="font-semibold text-green-cta underline underline-offset-2 hover:text-green-800"
        >
          Read what running a chapter involves
        </Link>{' '}
        first.
      </p>

      <div className="mt-10">
        <ApplicationForm
          fullName={profile.full_name ?? ''}
          email={profile.email}
          slots={slots}
        />
      </div>
    </div>
  )
}
