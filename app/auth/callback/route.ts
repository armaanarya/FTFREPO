import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * OAuth callback. Exchanges the PKCE code for a session, then returns the user
 * to wherever they were headed before sign-in.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const error = searchParams.get('error')

  if (error) {
    return NextResponse.redirect(`${origin}/signin?error=${encodeURIComponent(error)}`)
  }

  // Only ever redirect to a path on this origin. An attacker-supplied absolute
  // URL here would turn the callback into an open redirect.
  const rawNext = searchParams.get('next') ?? '/dashboard'
  const next = rawNext.startsWith('/') && !rawNext.startsWith('//') ? rawNext : '/dashboard'

  if (!code) {
    return NextResponse.redirect(`${origin}/signin?error=missing_code`)
  }

  const supabase = await createClient()
  const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

  if (exchangeError) {
    return NextResponse.redirect(`${origin}/signin?error=exchange_failed`)
  }

  return NextResponse.redirect(`${origin}${next}`)
}
