'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { DemoSlot } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { TextField } from '@/components/ui/field'

export function SlotManager({ slots }: { slots: DemoSlot[] }) {
  const router = useRouter()
  const [localDateTime, setLocalDateTime] = useState('')
  const [duration, setDuration] = useState('30')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [confirmingId, setConfirmingId] = useState<string | null>(null)

  async function addSlot(event: React.FormEvent) {
    event.preventDefault()
    if (!localDateTime) {
      setError('Pick a date and time.')
      return
    }
    // datetime-local has no timezone; Date parses it as local time, and
    // toISOString converts to UTC for storage.
    const startsAt = new Date(localDateTime)
    if (Number.isNaN(startsAt.getTime())) {
      setError('That date could not be read.')
      return
    }
    if (startsAt <= new Date()) {
      setError('Pick a time in the future.')
      return
    }

    setBusy(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/slots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          starts_at: startsAt.toISOString(),
          duration_minutes: Number(duration),
        }),
      })
      if (!res.ok) {
        const body = (await res.json()) as { error?: string }
        setError(body.error ?? 'Could not add that slot.')
        return
      }
      setLocalDateTime('')
      router.refresh()
    } catch {
      setError('Could not reach the server.')
    } finally {
      setBusy(false)
    }
  }

  async function removeSlot(id: string) {
    setBusy(true)
    setError(null)
    try {
      const res = await fetch(`/api/admin/slots?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      })
      if (!res.ok) {
        const body = (await res.json()) as { error?: string }
        setError(body.error ?? 'Could not remove that slot.')
        return
      }
      setConfirmingId(null)
      router.refresh()
    } catch {
      setError('Could not reach the server.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div>
      <form
        onSubmit={addSlot}
        className="rounded-card border border-line bg-white p-6 shadow-sm"
      >
        <h3 className="font-display text-base font-bold text-ink-900">Add a time</h3>
        <div className="mt-4 grid gap-4 sm:grid-cols-[1fr_160px_auto] sm:items-end">
          <TextField
            label="Date and time"
            type="datetime-local"
            value={localDateTime}
            onChange={(e) => setLocalDateTime(e.target.value)}
            hint="In your local timezone."
            required
          />
          <TextField
            label="Length (minutes)"
            type="number"
            min={5}
            max={240}
            step={5}
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            required
          />
          <Button type="submit" disabled={busy} className="sm:mb-0.5">
            {busy ? 'Saving…' : 'Add slot'}
          </Button>
        </div>
        {error && (
          <p role="alert" className="mt-4 text-sm font-medium text-danger">
            {error}
          </p>
        )}
      </form>

      <h3 className="mt-10 font-display text-base font-bold text-ink-900">
        Published times ({slots.length})
      </h3>

      {slots.length === 0 ? (
        <p className="mt-3 rounded-card border border-dashed border-line-strong bg-beige-50 p-6 text-sm text-ink-600">
          Nothing published. Applicants currently see &ldquo;no times are open right now&rdquo;
          when they try to book.
        </p>
      ) : (
        <ul className="mt-3 space-y-2">
          {slots.map((slot) => {
            const date = new Date(slot.starts_at)
            const isPast = date <= new Date()
            return (
              <li
                key={slot.id}
                className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-card border border-line bg-white px-5 py-3"
              >
                <span
                  className={
                    isPast ? 'flex-1 text-sm text-ink-500' : 'flex-1 text-sm font-semibold text-ink-900'
                  }
                >
                  {date.toLocaleString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit',
                  })}
                  <span className="ml-2 font-normal text-ink-500">
                    {slot.duration_minutes} min{isPast ? ' · past' : ''}
                  </span>
                </span>

                {confirmingId === slot.id ? (
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-semibold text-ink-900">Remove this slot?</span>
                    <Button variant="secondary" disabled={busy} onClick={() => void removeSlot(slot.id)}>
                      Yes, remove
                    </Button>
                    <Button variant="ghost" disabled={busy} onClick={() => setConfirmingId(null)}>
                      Keep
                    </Button>
                  </span>
                ) : (
                  <Button variant="ghost" onClick={() => setConfirmingId(slot.id)}>
                    Remove
                  </Button>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
