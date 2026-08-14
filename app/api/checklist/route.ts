import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { isSupabaseConfigured } from '@/lib/supabase/config'
import { clientIp, rateLimit } from '@/lib/rate-limit'
import { CHECKLIST_ITEMS } from '@/lib/types'

const VALID_KEYS = new Set<string>(CHECKLIST_ITEMS.map((item) => item.key))

export async function POST(req: NextRequest) {
  if (!isSupabaseConfigured) {
    return NextResponse.json({ error: 'Not configured.' }, { status: 503 })
  }

  try {
    if (!rateLimit(`checklist:${clientIp(req)}`, 60, 60_000)) {
      return NextResponse.json({ error: 'Too many requests.' }, { status: 429 })
    }

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Sign in first.' }, { status: 401 })

    const body = (await req.json()) as { item_key?: unknown; is_complete?: unknown }

    // Only keys the app actually defines. Without this the table becomes a
    // free-form key/value store any signed-in user can write to.
    const itemKey = typeof body.item_key === 'string' ? body.item_key : ''
    if (!VALID_KEYS.has(itemKey)) {
      return NextResponse.json({ error: 'Unknown checklist item.' }, { status: 400 })
    }
    if (typeof body.is_complete !== 'boolean') {
      return NextResponse.json({ error: 'is_complete must be a boolean.' }, { status: 400 })
    }

    const { error } = await supabase.from('checklist_progress').upsert(
      {
        user_id: user.id,
        item_key: itemKey,
        is_complete: body.is_complete,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,item_key' },
    )

    if (error) {
      console.error('[checklist]', error.message)
      return NextResponse.json({ error: 'Could not save.' }, { status: 500 })
    }
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[checklist]', err)
    return NextResponse.json({ error: 'Server error.' }, { status: 500 })
  }
}
