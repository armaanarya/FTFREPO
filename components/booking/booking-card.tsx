'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { DemoBookingWithSlot } from '@/lib/types'
import { Button } from '@/components/ui/button'

/**
 * A confirmed booking. Renders the time in the timezone the user chose when
 * booking — and says so — because "3:00 PM" alone is worthless to someone
 * reading it from a different country.
 */
export function BookingCard({
  booking,
  cancellable = false,
  past = false,
}: {
  booking: DemoBookingWithSlot
  cancellable?: boolean
  past?: boolean
}) {
  const router = useRouter()
  const [cancelling, setCancelling] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const slot = booking.demo_slots
  if (!slot) return null

  const date = new Date(slot.starts_at)
  const formatted = new Intl.DateTimeFormat('en-US', {
    timeZone: booking.timezone,
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date)

  async function cancel() {
    setCancelling(true)
    setError(null)
    try {
      const res = await fetch(`/api/bookings?id=${encodeURIComponent(booking.id)}`, {
        method: 'DELETE',
      })
      if (!res.ok) {
        const body = (await res.json()) as { error?: string }
        setError(body.error ?? 'Could not cancel. Please try again.')
        setCancelling(false)
        return
      }
      router.refresh()
    } catch {
      setError('Could not reach the server. Please try again.')
      setCancelling(false)
    }
  }

  return (
    <div className="rounded-card border border-line bg-white p-6 shadow-sm">
      <p className="font-display text-lg font-bold text-ink-900">{formatted}</p>
      <p className="mt-1 text-sm text-ink-500">
        {booking.timezone.replace(/_/g, ' ')} · {slot.duration_minutes} minutes ·{' '}
        {booking.format === 'video' ? 'Video call' : 'Phone call'}
      </p>

      {booking.note && (
        <p className="mt-3 whitespace-pre-line border-l-[3px] border-line pl-4 text-sm text-ink-600">
          {booking.note}
        </p>
      )}

      {error && (
        <p role="alert" className="mt-3 text-sm font-medium text-danger">
          {error}
        </p>
      )}

      {cancellable && !past && (
        <div className="mt-5">
          {confirming ? (
            // Confirm before an irreversible action rather than cancelling on
            // a single stray click.
            <div className="flex flex-wrap items-center gap-3">
              <p className="text-sm font-semibold text-ink-900">
                Cancel this call? The time goes back into the pool.
              </p>
              <Button variant="secondary" onClick={cancel} disabled={cancelling}>
                {cancelling ? 'Cancelling…' : 'Yes, cancel it'}
              </Button>
              <Button variant="ghost" onClick={() => setConfirming(false)} disabled={cancelling}>
                Keep it
              </Button>
            </div>
          ) : (
            <Button variant="secondary" onClick={() => setConfirming(true)}>
              Cancel this call
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
