import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { isSupabaseConfigured } from '@/lib/supabase/config'
import { clientIp, rateLimit } from '@/lib/rate-limit'
import { clean, cleanMultiline, oneOf, safeTimezone } from '@/lib/sanitize'
import { BOOKING_FORMATS } from '@/lib/types'

export async function POST(req: NextRequest) {
  if (!isSupabaseConfigured) {
    return NextResponse.json({ error: 'Booking is not configured yet.' }, { status: 503 })
  }

  try {
    if (!rateLimit(`book:${clientIp(req)}`, 10, 60_000)) {
      return NextResponse.json(
        { error: 'Too many attempts. Wait a minute and try again.' },
        { status: 429, headers: { 'Retry-After': '60' } },
      )
    }

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Sign in first.' }, { status: 401 })

    const body = (await req.json()) as Record<string, unknown>

    const slotId = clean(body.slot_id, 64)
    const timezone = safeTimezone(body.timezone)
    const format = oneOf(body.format, BOOKING_FORMATS) ?? 'video'
    const note = cleanMultiline(body.note, 1000) || null

    if (!slotId) return NextResponse.json({ error: 'Choose a time.' }, { status: 400 })
    if (!timezone) {
      return NextResponse.json({ error: 'That timezone is not recognized.' }, { status: 400 })
    }

    // Confirm the slot is real, active, and still in the future. Without this a
    // caller could post an arbitrary slot id and book a past or disabled slot.
    const { data: slot } = await supabase
      .from('demo_slots')
      .select('id, starts_at, is_active')
      .eq('id', slotId)
      .maybeSingle()

    if (!slot || !slot.is_active || new Date(slot.starts_at) <= new Date()) {
      return NextResponse.json({ error: 'That time is no longer available.' }, { status: 409 })
    }

    const { error } = await supabase.from('demo_bookings').insert({
      user_id: user.id,
      slot_id: slotId,
      timezone,
      format,
      note,
    })

    if (error) {
      // 23505 on demo_bookings_slot_unique: someone won the race for this slot.
      // The database is what makes this correct — not a check-then-insert here.
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'Someone just booked that time. Please pick another.' },
          { status: 409 },
        )
      }
      console.error('[bookings]', error.message)
      return NextResponse.json({ error: 'Could not book that time.' }, { status: 500 })
    }

    // Advance the application to "demo scheduled" if it is still new. Best
    // effort: RLS has no user-facing UPDATE policy on applications, so this is
    // a no-op unless a future policy allows it. The admin view remains the
    // source of truth for status.
    await supabase
      .from('applications')
      .update({ status: 'demo_scheduled' })
      .eq('user_id', user.id)
      .eq('status', 'new')

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[bookings]', err)
    return NextResponse.json({ error: 'Server error.' }, { status: 500 })
  }
}

/** Cancel one of the caller's own bookings. RLS scopes this to their rows. */
export async function DELETE(req: NextRequest) {
  if (!isSupabaseConfigured) {
    return NextResponse.json({ error: 'Booking is not configured yet.' }, { status: 503 })
  }

  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Sign in first.' }, { status: 401 })

    const bookingId = clean(new URL(req.url).searchParams.get('id'), 64)
    if (!bookingId) return NextResponse.json({ error: 'Missing booking id.' }, { status: 400 })

    const { error } = await supabase
      .from('demo_bookings')
      .update({ status: 'cancelled' })
      .eq('id', bookingId)
      .eq('user_id', user.id)

    if (error) {
      console.error('[bookings:cancel]', error.message)
      return NextResponse.json({ error: 'Could not cancel that booking.' }, { status: 500 })
    }
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[bookings:cancel]', err)
    return NextResponse.json({ error: 'Server error.' }, { status: 500 })
  }
}
