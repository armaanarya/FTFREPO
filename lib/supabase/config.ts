/**
 * Supabase configuration, in one place so every consumer degrades the same way.
 *
 * The site is designed to still render its public marketing surface when
 * Supabase is not configured (see docs/SUPABASE-SETUP.md) — that is deliberate,
 * so the landing page can ship before the backend exists. Anything requiring a
 * session checks `isSupabaseConfigured` and shows an honest message instead of
 * throwing a stack trace at a visitor.
 */

export const PUBLIC_SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
export const PUBLIC_SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''

export const isSupabaseConfigured = Boolean(PUBLIC_SUPABASE_URL && PUBLIC_SUPABASE_ANON_KEY)
