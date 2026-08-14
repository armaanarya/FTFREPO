'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { RadioGroup, TextArea, TextField } from '@/components/ui/field'
import { COUNTRIES } from '@/lib/site'
import type { ApplyingAs, DemoSlot } from '@/lib/types'
import { SlotPicker } from '@/components/booking/slot-picker'
import { cn } from '@/lib/utils'

const DRAFT_KEY = 'ftf:application-draft:v1'

type Draft = {
  organization: string
  city: string
  country: string
  grade_or_role: string
  motivation: string
  applying_as: ApplyingAs
  team_details: string
}

const EMPTY: Draft = {
  organization: '',
  city: '',
  country: '',
  grade_or_role: '',
  motivation: '',
  applying_as: 'individual',
  team_details: '',
}

const STEPS = ['About you', 'Your chapter', 'Your team', 'Review'] as const

type Errors = Partial<Record<keyof Draft, string>>

export function ApplicationForm({
  fullName,
  email,
  slots,
}: {
  fullName: string
  email: string
  slots: DemoSlot[]
}) {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [draft, setDraft] = useState<Draft>(EMPTY)
  const [errors, setErrors] = useState<Errors>({})
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [restored, setRestored] = useState(false)
  const headingRef = useRef<HTMLHeadingElement>(null)

  // Restore any in-progress draft. A phone call mid-application should not cost
  // someone their answers.
  useEffect(() => {
    try {
      const saved = localStorage.getItem(DRAFT_KEY)
      if (saved) {
        const parsed = JSON.parse(saved) as Partial<Draft>
        const merged = { ...EMPTY, ...parsed }
        setDraft(merged)
        // Only announce a restore if there was something meaningful in it.
        if (Object.values(parsed).some((v) => typeof v === 'string' && v.trim())) {
          setRestored(true)
        }
      }
    } catch {
      // Corrupt or unavailable storage is not worth surfacing — start fresh.
    }
  }, [])

  useEffect(() => {
    if (submitted) return
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(draft))
    } catch {
      // Private mode / quota. The form still works, it just won't persist.
    }
  }, [draft, submitted])

  function set<K extends keyof Draft>(key: K, value: Draft[K]) {
    setDraft((d) => ({ ...d, [key]: value }))
    setErrors((e) => ({ ...e, [key]: undefined }))
  }

  function validateStep(index: number): boolean {
    const next: Errors = {}
    if (index === 0) {
      if (!draft.organization.trim()) next.organization = 'Tell us your school or organization.'
      if (!draft.city.trim()) next.city = 'Enter the city you are based in.'
      if (!draft.country.trim()) next.country = 'Select or enter your country.'
      if (!draft.grade_or_role.trim()) next.grade_or_role = 'Enter your grade or your role.'
    }
    if (index === 1) {
      if (draft.motivation.trim().length < 40) {
        next.motivation = 'Please write at least a couple of sentences — 40 characters minimum.'
      }
    }
    if (index === 2 && draft.applying_as === 'team' && !draft.team_details.trim()) {
      next.team_details = 'Tell us who else is involved.'
    }
    setErrors(next)
    return Object.keys(next).length === 0
  }

  function goTo(index: number) {
    setStep(index)
    // Move focus to the new step heading so a screen reader user is told where
    // they landed instead of silently staying on the old button.
    requestAnimationFrame(() => headingRef.current?.focus())
  }

  function next() {
    if (!validateStep(step)) return
    goTo(Math.min(step + 1, STEPS.length - 1))
  }

  async function submit() {
    for (let i = 0; i < 3; i += 1) {
      if (!validateStep(i)) {
        goTo(i)
        return
      }
    }

    setSubmitting(true)
    setSubmitError(null)
    try {
      const res = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...draft, company: '' }),
      })
      const body = (await res.json()) as { error?: string }

      if (!res.ok) {
        setSubmitError(body.error ?? 'Something went wrong. Please try again.')
        setSubmitting(false)
        return
      }

      try {
        localStorage.removeItem(DRAFT_KEY)
      } catch {
        /* nothing to clean up */
      }
      setSubmitted(true)
      router.refresh()
    } catch {
      setSubmitError('We could not reach the server. Check your connection and try again.')
      setSubmitting(false)
    }
  }

  // ------------------------------------------------------------ confirmation
  if (submitted) {
    return (
      <div>
        <div className="rounded-card border border-green-cta bg-green-50 p-6 sm:p-8">
          <div className="flex items-start gap-3">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
              className="mt-0.5 shrink-0 text-green-cta"
            >
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
              <path
                d="M8 12.5l2.5 2.5L16 9.5"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <div>
              <h2 className="font-display text-2xl font-extrabold text-green-900">
                Application received
              </h2>
              <p className="mt-2 text-ink-700">
                Thanks, {fullName || 'and welcome'}. We have your application and sent nothing
                to your inbox yet — everything lives on your dashboard.
              </p>
            </div>
          </div>
        </div>

        {/* Booking is a STEP, not a separate destination. Making the applicant
            navigate away here is where this funnel would leak. */}
        <div className="mt-10">
          <h2 className="font-display text-2xl font-extrabold text-ink-900">
            One more thing: book your intro call
          </h2>
          <p className="mt-2 max-w-prose text-ink-600">
            This is a short conversation where we walk you through the program and answer your
            questions. Pick a time now — it takes about thirty seconds.
          </p>
          <div className="mt-6">
            <SlotPicker slots={slots} onBooked={() => router.push('/dashboard')} />
          </div>
        </div>
      </div>
    )
  }

  // ------------------------------------------------------------------- form
  return (
    <div>
      {/* Step indicator. aria-current marks position; the visible state uses a
          filled/outlined shape plus a check, so it is not colour-only. */}
      <nav aria-label="Application progress">
        <ol className="flex flex-wrap gap-x-2 gap-y-3">
          {STEPS.map((label, index) => {
            const done = index < step
            const current = index === step
            return (
              <li key={label} className="flex items-center gap-2">
                <span
                  aria-current={current ? 'step' : undefined}
                  className={cn(
                    'flex items-center gap-2 rounded-chip px-3 py-1.5 text-sm font-semibold',
                    current && 'bg-green-cta text-white',
                    done && 'bg-green-100 text-green-900',
                    !current && !done && 'bg-beige-100 text-ink-500',
                  )}
                >
                  <span
                    className={cn(
                      'flex h-5 w-5 items-center justify-center rounded-full text-xs',
                      current && 'bg-white text-green-cta',
                      done && 'bg-green-cta text-white',
                      !current && !done && 'bg-white text-ink-500',
                    )}
                    aria-hidden="true"
                  >
                    {done ? '✓' : index + 1}
                  </span>
                  {label}
                  {done && <span className="sr-only"> (completed)</span>}
                </span>
              </li>
            )
          })}
        </ol>
      </nav>

      <p className="mt-4 text-sm text-ink-500" aria-live="polite">
        Step {step + 1} of {STEPS.length}
      </p>

      {restored && step === 0 && (
        <p
          role="status"
          className="mt-4 rounded-ctl border border-line-strong bg-beige-50 px-4 py-3 text-sm text-ink-700"
        >
          We restored your saved answers from last time.
        </p>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault()
          if (step === STEPS.length - 1) void submit()
          else next()
        }}
        className="mt-8"
      >
        <h2
          ref={headingRef}
          tabIndex={-1}
          className="font-display text-2xl font-extrabold text-ink-900 focus-visible:outline-none"
        >
          {STEPS[step]}
        </h2>

        <div className="mt-6 space-y-6">
          {step === 0 && (
            <>
              <div className="grid gap-6 sm:grid-cols-2">
                <TextField
                  label="Full name"
                  value={fullName}
                  readOnly
                  hint="From your Google account."
                  autoComplete="name"
                />
                <TextField
                  label="Email"
                  type="email"
                  value={email}
                  readOnly
                  hint="From your Google account. We reply here."
                  autoComplete="email"
                />
              </div>
              <TextField
                label="School or organization"
                required
                value={draft.organization}
                onChange={(e) => set('organization', e.target.value)}
                error={errors.organization}
                autoComplete="organization"
                maxLength={200}
              />
              <div className="grid gap-6 sm:grid-cols-2">
                <TextField
                  label="City"
                  required
                  value={draft.city}
                  onChange={(e) => set('city', e.target.value)}
                  error={errors.city}
                  autoComplete="address-level2"
                  maxLength={120}
                />
                <TextField
                  label="Country"
                  required
                  list="ftf-countries"
                  value={draft.country}
                  onChange={(e) => set('country', e.target.value)}
                  error={errors.country}
                  hint="We run chapters in four countries today, but we are open to more."
                  autoComplete="country-name"
                  maxLength={80}
                />
                <datalist id="ftf-countries">
                  {COUNTRIES.map((c) => (
                    <option key={c} value={c} />
                  ))}
                </datalist>
              </div>
              <TextField
                label="Grade or role"
                required
                value={draft.grade_or_role}
                onChange={(e) => set('grade_or_role', e.target.value)}
                error={errors.grade_or_role}
                hint="For example: 10th grade, or Faculty advisor."
                maxLength={80}
              />
            </>
          )}

          {step === 1 && (
            <TextArea
              label="Why do you want to start a chapter?"
              required
              value={draft.motivation}
              onChange={(e) => set('motivation', e.target.value)}
              error={errors.motivation}
              hint="Tell us what drew you to this and who you want to reach. A few sentences is plenty."
              maxLength={2000}
            />
          )}

          {step === 2 && (
            <>
              <RadioGroup
                label="Are you applying on your own or with a team?"
                required
                name="applying_as"
                value={draft.applying_as}
                onChange={(v) => set('applying_as', v)}
                options={[
                  {
                    value: 'individual',
                    label: 'On my own',
                    description: 'Plenty of chapters start with one person. This is completely fine.',
                  },
                  {
                    value: 'team',
                    label: 'With a team',
                    description: 'You already have others who want to help run it.',
                  },
                ]}
              />
              {draft.applying_as === 'team' && (
                <TextArea
                  label="Who else is involved?"
                  required
                  value={draft.team_details}
                  onChange={(e) => set('team_details', e.target.value)}
                  error={errors.team_details}
                  hint="Names and what each person would take on, as far as you have worked it out."
                  maxLength={1000}
                />
              )}
            </>
          )}

          {step === 3 && (
            <div className="rounded-card border border-line bg-beige-50 p-6">
              <h3 className="font-display text-base font-bold text-ink-900">
                Check this over before you send it
              </h3>
              <dl className="mt-4 space-y-3 text-sm">
                {[
                  ['Name', fullName],
                  ['Email', email],
                  ['School or organization', draft.organization],
                  ['City', draft.city],
                  ['Country', draft.country],
                  ['Grade or role', draft.grade_or_role],
                  [
                    'Applying',
                    draft.applying_as === 'team' ? 'With a team' : 'On my own',
                  ],
                  ...(draft.applying_as === 'team'
                    ? ([['Team', draft.team_details]] as [string, string][])
                    : []),
                  ['Why', draft.motivation],
                ].map(([label, value]) => (
                  <div key={label} className="grid gap-1 sm:grid-cols-[200px_1fr] sm:gap-4">
                    <dt className="font-semibold text-ink-900">{label}</dt>
                    <dd className="whitespace-pre-line text-ink-600">{value || '—'}</dd>
                  </div>
                ))}
              </dl>
              <button
                type="button"
                onClick={() => goTo(0)}
                className="mt-5 min-h-[44px] text-sm font-semibold text-green-cta underline underline-offset-2 hover:text-green-800"
              >
                Edit my answers
              </button>
            </div>
          )}
        </div>

        {submitError && (
          <p
            role="alert"
            className="mt-6 rounded-ctl border border-danger bg-[var(--error-surface)] px-4 py-3 text-sm font-medium text-danger"
          >
            {submitError}
          </p>
        )}

        <div className="mt-8 flex flex-wrap gap-3 border-t border-line pt-6">
          {step > 0 && (
            <Button type="button" variant="secondary" onClick={() => goTo(step - 1)}>
              Back
            </Button>
          )}
          <Button type="submit" disabled={submitting}>
            {step === STEPS.length - 1
              ? submitting
                ? 'Sending…'
                : 'Submit application'
              : 'Continue'}
          </Button>
        </div>
      </form>
    </div>
  )
}
