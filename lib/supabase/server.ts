import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { PUBLIC_SUPABASE_ANON_KEY, PUBLIC_SUPABASE_URL } from './config'

/**
 * `cookies` on the client options is a union of the current and deprecated
 * shapes, which defeats contextual inference for the callback parameter — hence
 * the explicit annotation rather than an implicit any.
 */
type CookieToSet = { name: string; value: string; options: CookieOptions }

/**
 * Supabase client for Server Components, Route Handlers, and Server Actions.
 * Reads and refreshes the session from cookies.
 *
 * Uses the ANON key on purpose: requests made through this client are subject
 * to RLS as the signed-in user, which is exactly the guarantee we want. The
 * service-role client lives in ./admin and is never used to serve user data.
 */
export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet: CookieToSet[]) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options)
          })
        } catch {
          // Called from a Server Component, where cookies are read-only. The
          // middleware refreshes the session, so this is safe to swallow.
        }
      },
    },
  })
}
