'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { TextArea, TextField } from '@/components/ui/field'

export function ContentEditor({
  contentKey,
  initial,
  title,
  description,
  multiline = false,
  inputMode,
  placeholder,
}: {
  contentKey: string
  initial: string
  title: string
  description: string
  multiline?: boolean
  inputMode?: 'numeric'
  placeholder?: string
}) {
  const router = useRouter()
  const [value, setValue] = useState(initial)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  const dirty = value !== initial

  async function save() {
    setBusy(true)
    setError(null)
    setSaved(false)
    try {
      const res = await fetch('/api/admin/content', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: contentKey, value }),
      })
      if (!res.ok) {
        const body = (await res.json()) as { error?: string }
        setError(body.error ?? 'Could not save.')
        return
      }
      setSaved(true)
      router.refresh()
    } catch {
      setError('Could not reach the server.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="rounded-card border border-line bg-white p-6 shadow-sm">
      <h3 className="font-display text-base font-bold text-ink-900">{title}</h3>
      <p className="mt-1.5 text-sm text-ink-600">{description}</p>

      <div className="mt-4">
        {multiline ? (
          <TextArea
            label={title}
            value={value}
            onChange={(e) => {
              setValue(e.target.value)
              setSaved(false)
            }}
            maxLength={8000}
            className="min-h-[220px] font-sans"
            placeholder={placeholder}
          />
        ) : (
          <TextField
            label={title}
            value={value}
            inputMode={inputMode}
            onChange={(e) => {
              setValue(e.target.value)
              setSaved(false)
            }}
            maxLength={200}
            placeholder={placeholder}
          />
        )}
      </div>

      {error && (
        <p role="alert" className="mt-3 text-sm font-medium text-danger">
          {error}
        </p>
      )}

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <Button onClick={save} disabled={busy || !dirty}>
          {busy ? 'Saving…' : 'Save'}
        </Button>
        {value.trim() === '' && (
          <span className="text-sm text-ink-500">
            Empty — this content does not appear on the site.
          </span>
        )}
        {/* Live region so the confirmation is announced, not just seen. */}
        <span role="status" aria-live="polite" className="text-sm font-medium text-green-cta">
          {saved && !dirty ? 'Saved.' : ''}
        </span>
      </div>
    </section>
  )
}
