import 'server-only'

import { createClient } from '@supabase/supabase-js'
import { PUBLIC_SUPABASE_URL } from './config'

/**
 * Service-role client. Bypasses RLS entirely.
 *
 * `import 'server-only'` makes it a build error to reach this module from a
 * Client Component, so the key cannot leak into a browser bundle by accident.
 *
 * Use this ONLY where RLS genuinely cannot express the rule:
 *   - reading another user's row for an admin screen after `requireAdmin()`
 *   - the profile upsert on first sign-in
 * Every such call site must have already authorized the caller. Never reach for
 * this because a policy was inconvenient to write.
 */
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

export const hasServiceRole = Boolean(serviceKey && PUBLIC_SUPABASE_URL)

export function createAdminClient() {
  if (!serviceKey) {
    throw new Error(
      'SUPABASE_SERVICE_ROLE_KEY is not set. Admin operations are unavailable. ' +
        'See docs/SUPABASE-SETUP.md.',
    )
  }
  return createClient(PUBLIC_SUPABASE_URL, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}
