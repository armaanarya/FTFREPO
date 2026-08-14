'use client'

import { createBrowserClient } from '@supabase/ssr'
import { PUBLIC_SUPABASE_ANON_KEY, PUBLIC_SUPABASE_URL } from './config'

/**
 * Browser Supabase client. Only ever holds the anon key, which is safe to ship
 * — every table it can reach is governed by RLS.
 */
export function createClient() {
  return createBrowserClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY)
}
