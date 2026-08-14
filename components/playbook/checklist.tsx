'use client'

import { useState } from 'react'
import { CHECKLIST_ITEMS } from '@/lib/types'
import { cn } from '@/lib/utils'

/**
 * Founder action-item checklist.
 *
 * Uses real <input type="checkbox"> elements — not divs with role="checkbox" —
 * so keyboard interaction, screen-reader announcement, and form semantics come
 * from the platform rather than from hand-rolled key handlers.
 *
 * Writes are optimistic and reconciled on failure: a founder ticking four boxes
 * should never wait on four round trips.
 */
export function Checklist({ initial }: { initial: Record<string, boolean> }) {
  const [state, setState] = useState<Record<string, boolean>>(initial)
  const [error, setError] = useState<string | null>(null)
  const [savingKeys, setSavingKeys] = useState<Set<string>>(new Set())

  const done = CHECKLIST_ITEMS.filter((item) => state[item.key]).length
  const total = CHECKLIST_ITEMS.length

  async function toggle(key: string, next: boolean) {
    const previous = state[key] ?? false
    setState((s) => ({ ...s, [key]: next }))
    setSavingKeys((s) => new Set(s).add(key))
    setError(null)

    try {
      const res = await fetch('/api/checklist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ item_key: key, is_complete: next }),
      })
      if (!res.ok) throw new Error('save failed')
    } catch {
      // Roll back so the UI never claims something was saved that was not.
      setState((s) => ({ ...s, [key]: previous }))
      setError('We could not save that change. Check your connection and try again.')
    } finally {
      setSavingKeys((s) => {
        const copy = new Set(s)
        copy.delete(key)
        return copy
      })
    }
  }

  const percent = Math.round((done / total) * 100)

  return (
    <div>
      {/* Progress: a bar for glanceability plus a text equivalent, because a bar
          alone communicates nothing to a screen reader or in high contrast. */}
      <div className="flex items-center gap-4">
        <div
          role="progressbar"
          aria-valuenow={done}
          aria-valuemin={0}
          aria-valuemax={total}
          aria-valuetext={`${done} of ${total} complete`}
          className="h-2 flex-1 overflow-hidden rounded-full bg-beige-200"
        >
          <div
            className="h-full rounded-full bg-green-cta transition-[width] duration-300"
            style={{ width: `${percent}%` }}
          />
        </div>
        <p className="tabular shrink-0 text-sm font-semibold text-ink-900">
          {done} of {total} complete
        </p>
      </div>

      <ul className="mt-6 space-y-3">
        {CHECKLIST_ITEMS.map((item) => {
          const checked = state[item.key] ?? false
          const saving = savingKeys.has(item.key)
          return (
            <li key={item.key}>
              <label
                className={cn(
                  'flex cursor-pointer gap-4 rounded-card border p-5 transition-colors duration-150',
                  checked
                    ? 'border-green-cta bg-green-50'
                    : 'border-line-strong bg-white hover:bg-beige-50',
                )}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  disabled={saving}
                  onChange={(e) => void toggle(item.key, e.target.checked)}
                  className="mt-0.5 h-5 w-5 shrink-0 accent-[var(--green-cta)]"
                />
                <span>
                  <span
                    className={cn(
                      'block font-display text-base font-bold',
                      checked ? 'text-green-900' : 'text-ink-900',
                    )}
                  >
                    {item.title}
                  </span>
                  <span className="mt-1 block text-sm text-ink-600">{item.body}</span>
                </span>
              </label>
            </li>
          )
        })}
      </ul>

      {/* Live region so a failure is announced, not just displayed. */}
      <p role="alert" aria-live="assertive" className="mt-4 text-sm font-medium text-danger">
        {error}
      </p>
    </div>
  )
}
