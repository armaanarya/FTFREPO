import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { isSupabaseConfigured } from '@/lib/supabase/config'
import { clientIp, rateLimit } from '@/lib/rate-limit'
import { clean, cleanMultiline, isEmail, oneOf } from '@/lib/sanitize'
import { APPLYING_AS } from '@/lib/types'

export async function POST(req: NextRequest) {
  if (!isSupabaseConfigured) {
    return NextResponse.json({ error: 'Applications are not configured yet.' }, { status: 503 })
  }

  try {
    if (!rateLimit(`apply:${clientIp(req)}`, 5, 60_000)) {
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

    // Honeypot — a real person never fills a field they cannot see.
    if (typeof body.company === 'string' && body.company.trim()) {
      return NextResponse.json({ ok: true })
    }

    // Identity comes from the verified session, never from the request body.
    // Trusting a client-supplied email here would let anyone file an
    // application under someone else's name.
    const email = clean(user.email ?? '', 254).toLowerCase()
    const metadata = (user.user_metadata ?? {}) as Record<string, unknown>
    const fullName =
      clean(metadata.full_name ?? metadata.name ?? '', 120) || email.split('@')[0]

    if (!isEmail(email)) {
      return NextResponse.json({ error: 'Your account has no usable email.' }, { status: 400 })
    }

    const organization = clean(body.organization, 200)
    const city = clean(body.city, 120)
    const country = clean(body.country, 80)
    const gradeOrRole = clean(body.grade_or_role, 80)
    const motivation = cleanMultiline(body.motivation, 2000)
    const applyingAs = oneOf(body.applying_as, APPLYING_AS) ?? 'individual'
    const teamDetails = applyingAs === 'team' ? cleanMultiline(body.team_details, 1000) : null

    if (!organization || !city || !country || !gradeOrRole) {
      return NextResponse.json({ error: 'Some required fields are missing.' }, { status: 400 })
    }
    if (motivation.length < 40) {
      return NextResponse.json(
        { error: 'Please tell us a little more about why you want to start a chapter.' },
        { status: 400 },
      )
    }
    if (applyingAs === 'team' && !teamDetails) {
      return NextResponse.json({ error: 'Tell us who else is on your team.' }, { status: 400 })
    }

    const { error } = await supabase.from('applications').insert({
      user_id: user.id,
      full_name: fullName,
      email,
      organization,
      city,
      country,
      grade_or_role: gradeOrRole,
      motivation,
      applying_as: applyingAs,
      team_details: teamDetails,
    })

    if (error) {
      // 23505 = unique violation on applications_user_id_key. The user already
      // applied; treat it as success so a double-submit is not an error state.
      if (error.code === '23505') return NextResponse.json({ ok: true, duplicate: true })
      console.error('[applications]', error.message)
      return NextResponse.json({ error: 'Could not save your application.' }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[applications]', err)
    return NextResponse.json({ error: 'Server error.' }, { status: 500 })
  }
}
