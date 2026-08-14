'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { AdminApplication } from '@/lib/admin-data'
import { APPLICATION_STATUSES, STATUS_COPY, type ApplicationStatus } from '@/lib/types'
import { StatusBadge } from '@/components/ui/status-badge'
import { Button } from '@/components/ui/button'

export function ApplicationRow({ application }: { application: AdminApplication }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState<ApplicationStatus>(application.status)

  async function updateStatus(next: ApplicationStatus) {
    const previous = status
    setStatus(next)
    setSaving(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/applications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: application.id, status: next }),
      })
      if (!res.ok) {
        const body = (await res.json()) as { error?: string }
        setStatus(previous)
        setError(body.error ?? 'Could not update the status.')
        return
      }
      router.refresh()
    } catch {
      setStatus(previous)
      setError('Could not reach the server.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="rounded-card border border-line bg-white shadow-sm">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-3 p-5">
        <div className="min-w-[200px] flex-1">
          <p className="font-display text-base font-bold text-ink-900">{application.full_name}</p>
          <p className="text-sm text-ink-500">
            {application.organization} · {application.city}, {application.country}
          </p>
        </div>

        <StatusBadge status={status} />

        <div>
          <label
            htmlFor={`status-${application.id}`}
            className="block text-xs font-semibold text-ink-500"
          >
            Move to
          </label>
          <select
            id={`status-${application.id}`}
            value={status}
            disabled={saving}
            onChange={(e) => void updateStatus(e.target.value as ApplicationStatus)}
            className="mt-1 min-h-[44px] rounded-ctl border border-line-strong bg-white px-3 text-sm text-ink-900"
          >
            {APPLICATION_STATUSES.map((value) => (
              <option key={value} value={value}>
                {STATUS_COPY[value].label}
              </option>
            ))}
          </select>
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls={`detail-${application.id}`}
          className="min-h-[44px] rounded-ctl border border-line-strong px-4 text-sm font-semibold text-ink-700 transition-colors duration-150 hover:bg-beige-50"
        >
          {open ? 'Hide details' : 'Details'}
        </button>
      </div>

      {error && (
        <p role="alert" className="border-t border-line px-5 py-3 text-sm font-medium text-danger">
          {error}
        </p>
      )}

      {open && (
        <div id={`detail-${application.id}`} className="border-t border-line bg-beige-50 p-5">
          <dl className="space-y-3 text-sm">
            <div className="grid gap-1 sm:grid-cols-[180px_1fr] sm:gap-4">
              <dt className="font-semibold text-ink-900">Email</dt>
              <dd className="break-all text-ink-600">{application.email}</dd>
            </div>
            <div className="grid gap-1 sm:grid-cols-[180px_1fr] sm:gap-4">
              <dt className="font-semibold text-ink-900">Grade or role</dt>
              <dd className="text-ink-600">{application.grade_or_role}</dd>
            </div>
            <div className="grid gap-1 sm:grid-cols-[180px_1fr] sm:gap-4">
              <dt className="font-semibold text-ink-900">Applying</dt>
              <dd className="text-ink-600">
                {application.applying_as === 'team' ? 'With a team' : 'On their own'}
              </dd>
            </div>
            {application.team_details && (
              <div className="grid gap-1 sm:grid-cols-[180px_1fr] sm:gap-4">
                <dt className="font-semibold text-ink-900">Team</dt>
                <dd className="whitespace-pre-line text-ink-600">{application.team_details}</dd>
              </div>
            )}
            <div className="grid gap-1 sm:grid-cols-[180px_1fr] sm:gap-4">
              <dt className="font-semibold text-ink-900">Why</dt>
              <dd className="whitespace-pre-line text-ink-600">{application.motivation}</dd>
            </div>
            <div className="grid gap-1 sm:grid-cols-[180px_1fr] sm:gap-4">
              <dt className="font-semibold text-ink-900">Submitted</dt>
              <dd className="text-ink-600">
                {new Date(application.created_at).toLocaleString('en-US')}
              </dd>
            </div>
          </dl>

          <div className="mt-5">
            <Button
              variant="secondary"
              onClick={() => {
                void navigator.clipboard?.writeText(application.email)
              }}
            >
              Copy email address
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
