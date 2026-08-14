import { NextResponse, type NextRequest } from 'next/server'
import { requireAdminApi } from '@/lib/auth'
import { createAdminClient, hasServiceRole } from '@/lib/supabase/admin'
import { clean, oneOf } from '@/lib/sanitize'
import { APPLICATION_STATUSES } from '@/lib/types'

export async function PATCH(req: NextRequest) {
  // Authorization first, before reading the body or touching the database.
  const admin = await requireAdminApi()
  if (!admin) return NextResponse.json({ error: 'Forbidden.' }, { status: 403 })
  if (!hasServiceRole) {
    return NextResponse.json({ error: 'Service role key not configured.' }, { status: 503 })
  }

  try {
    const body = (await req.json()) as Record<string, unknown>
    const id = clean(body.id, 64)
    const status = oneOf(body.status, APPLICATION_STATUSES)

    if (!id) return NextResponse.json({ error: 'Missing application id.' }, { status: 400 })
    if (!status) return NextResponse.json({ error: 'Unknown status.' }, { status: 400 })

    const supabase = createAdminClient()
    const { error } = await supabase.from('applications').update({ status }).eq('id', id)

    if (error) {
      console.error('[admin:applications:patch]', error.message)
      return NextResponse.json({ error: 'Could not update.' }, { status: 500 })
    }
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[admin:applications:patch]', err)
    return NextResponse.json({ error: 'Server error.' }, { status: 500 })
  }
}
