import { NextResponse, type NextRequest } from 'next/server'
import { requireAdminApi } from '@/lib/auth'
import { createAdminClient, hasServiceRole } from '@/lib/supabase/admin'
import { cleanMultiline } from '@/lib/sanitize'
import { CONTENT_KEYS } from '@/lib/types'

const ALLOWED_KEYS = new Set<string>(Object.values(CONTENT_KEYS))

export async function PUT(req: NextRequest) {
  const admin = await requireAdminApi()
  if (!admin) return NextResponse.json({ error: 'Forbidden.' }, { status: 403 })
  if (!hasServiceRole) {
    return NextResponse.json({ error: 'Service role key not configured.' }, { status: 503 })
  }

  try {
    const body = (await req.json()) as { key?: unknown; value?: unknown }
    const key = typeof body.key === 'string' ? body.key : ''

    // Only keys the app knows about — otherwise this becomes an arbitrary
    // key/value store writable from a single endpoint.
    if (!ALLOWED_KEYS.has(key)) {
      return NextResponse.json({ error: 'Unknown content key.' }, { status: 400 })
    }

    const value = cleanMultiline(body.value, 8000)

    if (key === CONTENT_KEYS.chaptersActive && value) {
      const n = Number.parseInt(value, 10)
      if (!Number.isFinite(n) || n <= 0 || String(n) !== value.trim()) {
        return NextResponse.json(
          { error: 'The chapter count must be a whole number greater than zero.' },
          { status: 400 },
        )
      }
    }

    const supabase = createAdminClient()

    // An empty value deletes the row, so "unset" and "set to empty string" are
    // the same state — the public site then renders nothing for that key.
    if (!value) {
      const { error } = await supabase.from('site_content').delete().eq('key', key)
      if (error) {
        console.error('[admin:content:put]', error.message)
        return NextResponse.json({ error: 'Could not clear the content.' }, { status: 500 })
      }
      return NextResponse.json({ ok: true, cleared: true })
    }

    const { error } = await supabase.from('site_content').upsert(
      { key, value, updated_by: admin.id, updated_at: new Date().toISOString() },
      { onConflict: 'key' },
    )

    if (error) {
      console.error('[admin:content:put]', error.message)
      return NextResponse.json({ error: 'Could not save the content.' }, { status: 500 })
    }
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[admin:content:put]', err)
    return NextResponse.json({ error: 'Server error.' }, { status: 500 })
  }
}
