import { redirect } from 'next/navigation'
import { createClient } from './supabase/server'
import { isSupabaseConfigured } from './supabase/config'
import type { Profile } from './types'

/**
 * The signed-in user's profile, or null.
 *
 * Reads through the RLS-governed server client, so a user can only ever
 * retrieve their own row — `is_admin` cannot be spoofed from the browser
 * because it is a database column, not a claim in a token the client controls.
 */
export async function getProfile(): Promise<Profile | null> {
  if (!isSupabaseConfigured) return null

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
  return (data as Profile) ?? null
}

/**
 * Require a signed-in user. Redirects to sign-in, preserving the intended
 * destination so the user lands where they were going after OAuth.
 */
export async function requireUser(returnTo: string): Promise<Profile> {
  const profile = await getProfile()
  if (!profile) redirect(`/signin?next=${encodeURIComponent(returnTo)}`)
  return profile
}

/**
 * Require an admin. Deliberately redirects rather than rendering a "forbidden"
 * page, so the existence of admin routes is not advertised to non-admins.
 *
 * This is the server-side gate for admin PAGES. Admin API routes must call
 * `requireAdminApi` — a page redirect is meaningless to a fetch() caller.
 */
export async function requireAdmin(returnTo: string): Promise<Profile> {
  const profile = await requireUser(returnTo)
  if (!profile.is_admin) redirect('/dashboard')
  return profile
}

/**
 * Authorization for admin API routes. Returns the profile, or null when the
 * caller is not an admin — the route then returns 403 without leaking whether
 * the resource exists.
 */
export async function requireAdminApi(): Promise<Profile | null> {
  const profile = await getProfile()
  if (!profile || !profile.is_admin) return null
  return profile
}
