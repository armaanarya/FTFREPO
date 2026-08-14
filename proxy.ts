import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

type CookieToSet = { name: string; value: string; options: CookieOptions }

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''

/** Routes that require a session. Prefix match. */
const PROTECTED = ['/dashboard', '/apply', '/book', '/playbook', '/admin']

/**
 * Next.js proxy (formerly the `middleware` convention, deprecated in Next 16.3).
 *
 * Refreshes the Supabase session cookie on every request and gates protected
 * routes.
 *
 * This is a first line of defence for UX, NOT the authorization boundary —
 * middleware only checks that a session exists. Whether that user may see a
 * given row is decided by RLS, and whether they may see an admin screen is
 * decided by `requireAdmin()` on the server. Never move an authorization
 * decision up here.
 */
export default async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request })

  // With Supabase unconfigured the app still serves its public pages; protected
  // routes send the visitor to sign-in, which explains the situation.
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    if (PROTECTED.some((p) => request.nextUrl.pathname.startsWith(p))) {
      const url = request.nextUrl.clone()
      url.pathname = '/signin'
      url.searchParams.set('next', request.nextUrl.pathname)
      return NextResponse.redirect(url)
    }
    return response
  }

  const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet: CookieToSet[]) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
        response = NextResponse.next({ request })
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        )
      },
    },
  })

  // getUser() revalidates the token with Supabase. Do not swap this for
  // getSession(), which trusts the cookie without verifying it.
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user && PROTECTED.some((p) => request.nextUrl.pathname.startsWith(p))) {
    const url = request.nextUrl.clone()
    url.pathname = '/signin'
    url.searchParams.set('next', request.nextUrl.pathname + request.nextUrl.search)
    return NextResponse.redirect(url)
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
