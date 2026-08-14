import { NextResponse, type NextRequest } from 'next/server'
import { requireAdminApi } from '@/lib/auth'
import { createAdminClient, hasServiceRole } from '@/lib/supabase/admin'
import { clean, cleanMultiline, safeHttpsUrl } from '@/lib/sanitize'

type PartnerPayload = {
  name: string
  photo_url: string | null
  location: string
  country: string
  bio: string
  quote: string | null
  chapter_stats: string | null
  is_published: boolean
  sort_order: number
}

/**
 * Shared validation. `photo_url` goes through `safeHttpsUrl` because it is
 * rendered into an <img src> on a public page — an admin pasting a
 * `javascript:` or `data:` URL must not become a stored XSS vector.
 */
function parse(body: Record<string, unknown>): PartnerPayload | { error: string } {
  const name = clean(body.name, 120)
  const location = clean(body.location, 160)
  const country = clean(body.country, 80)
  const bio = cleanMultiline(body.bio, 600)

  if (!name || !location || !country || !bio) {
    return { error: 'Name, location, country, and bio are all required.' }
  }

  const rawPhoto = clean(body.photo_url, 500)
  if (rawPhoto && !safeHttpsUrl(rawPhoto)) {
    return { error: 'The photo URL must be an absolute https:// link.' }
  }

  const sortOrder = Number(body.sort_order)

  return {
    name,
    photo_url: rawPhoto ? safeHttpsUrl(rawPhoto) : null,
    location,
    country,
    bio,
    quote: cleanMultiline(body.quote, 400) || null,
    chapter_stats: clean(body.chapter_stats, 200) || null,
    is_published: body.is_published === true,
    sort_order: Number.isFinite(sortOrder) ? Math.trunc(sortOrder) : 0,
  }
}

export async function POST(req: NextRequest) {
  const admin = await requireAdminApi()
  if (!admin) return NextResponse.json({ error: 'Forbidden.' }, { status: 403 })
  if (!hasServiceRole) {
    return NextResponse.json({ error: 'Service role key not configured.' }, { status: 503 })
  }

  try {
    const parsed = parse((await req.json()) as Record<string, unknown>)
    if ('error' in parsed) return NextResponse.json(parsed, { status: 400 })

    const supabase = createAdminClient()
    const { error } = await supabase.from('partners').insert(parsed)
    if (error) {
      console.error('[admin:partners:post]', error.message)
      return NextResponse.json({ error: 'Could not create the entry.' }, { status: 500 })
    }
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[admin:partners:post]', err)
    return NextResponse.json({ error: 'Server error.' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  const admin = await requireAdminApi()
  if (!admin) return NextResponse.json({ error: 'Forbidden.' }, { status: 403 })
  if (!hasServiceRole) {
    return NextResponse.json({ error: 'Service role key not configured.' }, { status: 503 })
  }

  try {
    const body = (await req.json()) as Record<string, unknown>
    const id = clean(body.id, 64)
    if (!id) return NextResponse.json({ error: 'Missing entry id.' }, { status: 400 })

    const parsed = parse(body)
    if ('error' in parsed) return NextResponse.json(parsed, { status: 400 })

    const supabase = createAdminClient()
    const { error } = await supabase.from('partners').update(parsed).eq('id', id)
    if (error) {
      console.error('[admin:partners:patch]', error.message)
      return NextResponse.json({ error: 'Could not save the entry.' }, { status: 500 })
    }
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[admin:partners:patch]', err)
    return NextResponse.json({ error: 'Server error.' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  const admin = await requireAdminApi()
  if (!admin) return NextResponse.json({ error: 'Forbidden.' }, { status: 403 })
  if (!hasServiceRole) {
    return NextResponse.json({ error: 'Service role key not configured.' }, { status: 503 })
  }

  try {
    const id = clean(new URL(req.url).searchParams.get('id'), 64)
    if (!id) return NextResponse.json({ error: 'Missing entry id.' }, { status: 400 })

    const supabase = createAdminClient()
    const { error } = await supabase.from('partners').delete().eq('id', id)
    if (error) {
      console.error('[admin:partners:delete]', error.message)
      return NextResponse.json({ error: 'Could not delete the entry.' }, { status: 500 })
    }
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[admin:partners:delete]', err)
    return NextResponse.json({ error: 'Server error.' }, { status: 500 })
  }
}
