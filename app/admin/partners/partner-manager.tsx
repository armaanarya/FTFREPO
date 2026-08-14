'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Partner } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { TextArea, TextField } from '@/components/ui/field'

type Draft = {
  id?: string
  name: string
  photo_url: string
  location: string
  country: string
  bio: string
  quote: string
  chapter_stats: string
  is_published: boolean
  sort_order: number
}

const EMPTY: Draft = {
  name: '',
  photo_url: '',
  location: '',
  country: '',
  bio: '',
  quote: '',
  chapter_stats: '',
  is_published: false,
  sort_order: 0,
}

function toDraft(partner: Partner): Draft {
  return {
    id: partner.id,
    name: partner.name,
    photo_url: partner.photo_url ?? '',
    location: partner.location,
    country: partner.country,
    bio: partner.bio,
    quote: partner.quote ?? '',
    chapter_stats: partner.chapter_stats ?? '',
    is_published: partner.is_published,
    sort_order: partner.sort_order,
  }
}

export function PartnerManager({ partners }: { partners: Partner[] }) {
  const router = useRouter()
  const [draft, setDraft] = useState<Draft | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [confirmingId, setConfirmingId] = useState<string | null>(null)

  const confirmRef = useRef<HTMLButtonElement>(null)

  /**
   * The inline confirmation replaces the button the user just activated, so
   * focus would fall back to <body>. Move it onto the confirm control
   * (WCAG 2.4.3).
   */
  useEffect(() => {
    if (confirmingId) confirmRef.current?.focus()
  }, [confirmingId])

  function set<K extends keyof Draft>(key: K, value: Draft[K]) {
    setDraft((d) => (d ? { ...d, [key]: value } : d))
  }

  async function save(event: React.FormEvent) {
    event.preventDefault()
    if (!draft) return
    if (!draft.name.trim() || !draft.location.trim() || !draft.country.trim() || !draft.bio.trim()) {
      setError('Name, location, country, and bio are all required.')
      return
    }

    setBusy(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/partners', {
        method: draft.id ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(draft),
      })
      if (!res.ok) {
        const body = (await res.json()) as { error?: string }
        setError(body.error ?? 'Could not save.')
        return
      }
      setDraft(null)
      router.refresh()
    } catch {
      setError('Could not reach the server.')
    } finally {
      setBusy(false)
    }
  }

  async function remove(id: string) {
    setBusy(true)
    setError(null)
    try {
      const res = await fetch(`/api/admin/partners?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      })
      if (!res.ok) {
        const body = (await res.json()) as { error?: string }
        setError(body.error ?? 'Could not delete.')
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
      {!draft && (
        <Button onClick={() => setDraft({ ...EMPTY, sort_order: partners.length })}>
          Add a spotlight entry
        </Button>
      )}

      {draft && (
        <form onSubmit={save} className="rounded-card border border-line bg-white p-6 shadow-sm">
          <h3 className="font-display text-base font-bold text-ink-900">
            {draft.id ? 'Edit entry' : 'New entry'}
          </h3>

          <div className="mt-5 space-y-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <TextField
                label="Name"
                required
                value={draft.name}
                onChange={(e) => set('name', e.target.value)}
                maxLength={120}
              />
              <TextField
                label="Photo URL"
                type="url"
                value={draft.photo_url}
                onChange={(e) => set('photo_url', e.target.value)}
                hint="Must be an https link. Leave blank for no photo."
                maxLength={500}
              />
              <TextField
                label="Location"
                required
                value={draft.location}
                onChange={(e) => set('location', e.target.value)}
                hint="School or city, as it should read on the card."
                maxLength={160}
              />
              <TextField
                label="Country"
                required
                value={draft.country}
                onChange={(e) => set('country', e.target.value)}
                maxLength={80}
              />
            </div>

            <TextArea
              label="Bio"
              required
              value={draft.bio}
              onChange={(e) => set('bio', e.target.value)}
              maxLength={600}
              className="min-h-[110px]"
            />
            <TextArea
              label="Quote"
              value={draft.quote}
              onChange={(e) => set('quote', e.target.value)}
              hint="Optional. Their own words about the chapter."
              maxLength={400}
              className="min-h-[90px]"
            />
            <TextField
              label="Chapter accomplishments"
              value={draft.chapter_stats}
              onChange={(e) => set('chapter_stats', e.target.value)}
              hint="Optional. Only what you can verify — this renders publicly."
              maxLength={200}
            />

            <div className="grid gap-5 sm:grid-cols-2 sm:items-end">
              <TextField
                label="Sort order"
                type="number"
                value={String(draft.sort_order)}
                onChange={(e) => set('sort_order', Number(e.target.value) || 0)}
                hint="Lower numbers appear first."
              />
              <label className="flex min-h-[44px] cursor-pointer items-center gap-3 rounded-ctl border border-line-strong px-4">
                <input
                  type="checkbox"
                  checked={draft.is_published}
                  onChange={(e) => set('is_published', e.target.checked)}
                  className="h-5 w-5 accent-[var(--green-cta)]"
                />
                <span className="text-sm font-semibold text-ink-900">
                  Published — visible on the public site
                </span>
              </label>
            </div>
          </div>

          {error && (
            <p role="alert" className="mt-5 text-sm font-medium text-danger">
              {error}
            </p>
          )}

          <div className="mt-6 flex flex-wrap gap-3 border-t border-line pt-5">
            <Button type="submit" disabled={busy}>
              {busy ? 'Saving…' : draft.id ? 'Save changes' : 'Create entry'}
            </Button>
            <Button type="button" variant="secondary" onClick={() => setDraft(null)} disabled={busy}>
              Cancel
            </Button>
          </div>
        </form>
      )}

      <ul className="mt-8 space-y-3">
        {partners.length === 0 && !draft && (
          <li className="rounded-card border border-dashed border-line-strong bg-beige-50 p-6 text-sm text-ink-600">
            No spotlight entries yet.
          </li>
        )}
        {partners.map((partner) => (
          <li
            key={partner.id}
            className="flex flex-wrap items-center gap-x-4 gap-y-3 rounded-card border border-line bg-white px-5 py-4"
          >
            <div className="min-w-[200px] flex-1">
              <p className="font-display text-base font-bold text-ink-900">{partner.name}</p>
              <p className="text-sm text-ink-500">
                {partner.location} · {partner.country}
              </p>
            </div>
            <span
              className={
                partner.is_published
                  ? 'rounded-chip border border-green-cta bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-cta'
                  : 'rounded-chip border border-line-strong bg-beige-100 px-2.5 py-1 text-xs font-semibold text-ink-700'
              }
            >
              {partner.is_published ? 'Published' : 'Draft'}
            </span>
            <Button variant="secondary" onClick={() => setDraft(toDraft(partner))}>
              Edit
            </Button>
            {confirmingId === partner.id ? (
              <span className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-semibold text-ink-900">
                  Delete {partner.name} permanently?
                </span>
                <Button ref={confirmRef} variant="secondary" disabled={busy} onClick={() => void remove(partner.id)}>
                  Yes, delete
                </Button>
                <Button variant="ghost" disabled={busy} onClick={() => setConfirmingId(null)}>
                  Keep
                </Button>
              </span>
            ) : (
              <Button variant="ghost" onClick={() => setConfirmingId(partner.id)}>
                Delete
              </Button>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}
