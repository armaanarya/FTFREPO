'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { RadioGroup, TextArea } from '@/components/ui/field'
import type { BookingFormat, DemoSlot } from '@/lib/types'
import { cn } from '@/lib/utils'

/**
 * Slot picker.
 *
 * Times are stored in UTC and rendered in the timezone the user selects, which
 * defaults to whatever their browser reports. Getting this wrong is the classic
 * way a scheduling tool wastes everyone's morning, so the chosen zone is shown
 * in plain text next to every time, not just implied.
 */
export function SlotPicker({
  slots,
  onBooked,
}: {
  slots: DemoSlot[]
  onBooked?: () => void
}) {
  const router = useRouter()
  const browserZone = useMemo(
    () => Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
    [],
  )

  const [timezone, setTimezone] = useState(browserZone)
  const [slotId, setSlotId] = useState<string | null>(null)
  const [format, setFormat] = useState<BookingFormat>('video')
  const [note, setNote] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const zones = useMemo(() => {
    // Intl.supportedValuesOf is not in every runtime; fall back to a short list
    // covering the countries we actually operate in.
    const fallback = [
      'America/Los_Angeles',
      'America/New_York',
      'Europe/Madrid',
      'Asia/Singapore',
      'Asia/Ho_Chi_Minh',
      'UTC',
    ]
    try {
      const all = (
        Intl as unknown as { supportedValuesOf?: (k: string) => string[] }
      ).supportedValuesOf?.('timeZone')
      if (all?.length) return all
    } catch {
      /* fall through */
    }
    return Array.from(new Set([browserZone, ...fallback]))
  }, [browserZone])

  /** Group slots by calendar day *in the selected timezone*. */
  const grouped = useMemo(() => {
    const dayFormatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    })
    const timeFormatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      hour: 'numeric',
      minute: '2-digit',
    })

    const map = new Map<string, { slot: DemoSlot; time: string }[]>()
    for (const slot of slots) {
      const date = new Date(slot.starts_at)
      const day = dayFormatter.format(date)
      if (!map.has(day)) map.set(day, [])
      map.get(day)!.push({ slot, time: timeFormatter.format(date) })
    }
    return Array.from(map.entries())
  }, [slots, timezone])

  async function submit(event: React.FormEvent) {
    event.preventDefault()
    if (!slotId) {
      setError('Choose a time before continuing.')
      return
    }

    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slot_id: slotId, timezone, format, note }),
      })
      const body = (await res.json()) as { error?: string }

      if (!res.ok) {
        setError(body.error ?? 'We could not book that time. Please try another.')
        setSubmitting(false)
        // A 409 means someone else took it while this page was open — refresh
        // so the stale slot disappears from the list.
        if (res.status === 409) router.refresh()
        return
      }

      router.refresh()
      onBooked?.()
    } catch {
      setError('We could not reach the server. Check your connection and try again.')
      setSubmitting(false)
    }
  }

  if (slots.length === 0) {
    return (
      <div className="rounded-card border border-line-strong bg-beige-50 p-6">
        <h3 className="font-display text-base font-bold text-ink-900">
          No times are open right now
        </h3>
        <p className="mt-2 text-sm text-ink-600">
          Our team has not published availability for the coming weeks yet. Your application is
          saved — check back in a few days, or watch your dashboard.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={submit} className="space-y-8">
      <div>
        <label htmlFor="tz" className="block text-sm font-semibold text-ink-900">
          Your timezone
        </label>
        <p id="tz-hint" className="mt-1 text-sm text-ink-500">
          We detected {browserZone}. Every time below is shown in the zone you pick here.
        </p>
        <select
          id="tz"
          value={timezone}
          aria-describedby="tz-hint"
          onChange={(e) => setTimezone(e.target.value)}
          className="mt-2 min-h-[44px] w-full max-w-sm rounded-ctl border border-line-strong bg-white px-3.5 py-2.5 text-base text-ink-900"
        >
          {zones.map((zone) => (
            <option key={zone} value={zone}>
              {zone.replace(/_/g, ' ')}
            </option>
          ))}
        </select>
      </div>

      <fieldset>
        <legend className="text-sm font-semibold text-ink-900">
          Pick a time{' '}
          <span className="text-danger" aria-hidden="true">
            *
          </span>
          <span className="sr-only"> (required)</span>
        </legend>

        <div className="mt-4 space-y-6">
          {grouped.map(([day, entries]) => (
            <div key={day}>
              <h3 className="font-display text-sm font-bold text-ink-900">{day}</h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {entries.map(({ slot, time }) => {
                  const selected = slotId === slot.id
                  return (
                    <label
                      key={slot.id}
                      className={cn(
                        'flex min-h-[44px] cursor-pointer items-center rounded-ctl border px-4 text-sm font-semibold transition-colors duration-150',
                        // The radio itself is visually hidden, so the LABEL has to
                        // carry the focus indicator — otherwise a keyboard user
                        // tabbing through times sees nothing at all (WCAG 2.4.7).
                        'has-[:focus-visible]:outline has-[:focus-visible]:outline-[3px] has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-green-cta',
                        selected
                          ? 'border-green-cta bg-green-cta text-white has-[:focus-visible]:outline-ink-900'
                          : 'border-line-strong bg-white text-ink-900 hover:bg-beige-50',
                      )}
                    >
                      <input
                        type="radio"
                        name="slot"
                        value={slot.id}
                        checked={selected}
                        onChange={() => {
                          setSlotId(slot.id)
                          setError(null)
                        }}
                        className="sr-only"
                      />
                      {/* The visible label carries the timezone so the choice is
                          unambiguous when read out of context. */}
                      {time}
                      <span className="sr-only">
                        {' '}
                        {timezone.replace(/_/g, ' ')}, {day}, {slot.duration_minutes} minutes
                      </span>
                      {selected && (
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 16 16"
                          fill="none"
                          aria-hidden="true"
                          className="ml-2"
                        >
                          <path
                            d="M3 8.5l3.5 3.5L13 5"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      )}
                    </label>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </fieldset>

      <RadioGroup
        label="How would you like to meet?"
        name="format"
        value={format}
        onChange={setFormat}
        options={[
          { value: 'video', label: 'Video call', description: 'We send a link before the call.' },
          { value: 'phone', label: 'Phone call', description: 'We call the number you give us.' },
        ]}
      />

      <TextArea
        label="Anything you want us to know?"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        hint="Optional. Questions, constraints, or context about your school."
        maxLength={1000}
        className="min-h-[100px]"
      />

      {error && (
        <p
          role="alert"
          className="rounded-ctl border border-danger bg-[var(--error-surface)] px-4 py-3 text-sm font-medium text-danger"
        >
          {error}
        </p>
      )}

      <Button type="submit" size="lg" disabled={submitting}>
        {submitting ? 'Booking…' : 'Confirm this time'}
      </Button>
    </form>
  )
}
