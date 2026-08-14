import { NextResponse, type NextRequest } from 'next/server'
import { requireAdminApi } from '@/lib/auth'
import { createAdminClient, hasServiceRole } from '@/lib/supabase/admin'
import { clean } from '@/lib/sanitize'

export async function POST(req: NextRequest) {
  const admin = await requireAdminApi()
  if (!admin) return NextResponse.json({ error: 'Forbidden.' }, { status: 403 })
  if (!hasServiceRole) {
    return NextResponse.json({ error: 'Service role key not configured.' }, { status: 503 })
  }

  try {
    const body = (await req.json()) as Record<string, unknown>
    const startsAtRaw = clean(body.starts_at, 40)
    const startsAt = new Date(startsAtRaw)
    const duration = Number(body.duration_minutes)

    if (!startsAtRaw || Number.isNaN(startsAt.getTime())) {
      return NextResponse.json({ error: 'Invalid date.' }, { status: 400 })
    }
    if (startsAt <= new Date()) {
      return NextResponse.json({ error: 'Slot must be in the future.' }, { status: 400 })
    }
    if (!Number.isInteger(duration) || duration < 5 || duration > 240) {
      return NextResponse.json({ error: 'Length must be 5–240 minutes.' }, { status: 400 })
    }

    const supabase = createAdminClient()
    const { error } = await supabase
      .from('demo_slots')
      .insert({ starts_at: startsAt.toISOString(), duration_minutes: duration })

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ error: 'A slot already exists at that time.' }, { status: 409 })
      }
      console.error('[admin:slots:post]', error.message)
      return NextResponse.json({ error: 'Could not add the slot.' }, { status: 500 })
    }
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[admin:slots:post]', err)
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
    if (!id) return NextResponse.json({ error: 'Missing slot id.' }, { status: 400 })

    const supabase = createAdminClient()

    // A slot with a live booking must not vanish underneath the person who
    // booked it — deactivate instead so their card keeps rendering.
    const { count } = await supabase
      .from('demo_bookings')
      .select('id', { count: 'exact', head: true })
      .eq('slot_id', id)
      .neq('status', 'cancelled')

    if ((count ?? 0) > 0) {
      const { error } = await supabase
        .from('demo_slots')
        .update({ is_active: false })
        .eq('id', id)
      if (error) {
        console.error('[admin:slots:delete]', error.message)
        return NextResponse.json({ error: 'Could not hide the slot.' }, { status: 500 })
      }
      return NextResponse.json({ ok: true, deactivated: true })
    }

    const { error } = await supabase.from('demo_slots').delete().eq('id', id)
    if (error) {
      console.error('[admin:slots:delete]', error.message)
      return NextResponse.json({ error: 'Could not remove the slot.' }, { status: 500 })
    }
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[admin:slots:delete]', err)
    return NextResponse.json({ error: 'Server error.' }, { status: 500 })
  }
}
