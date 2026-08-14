import { createClient } from './supabase/server'
import { isSupabaseConfigured } from './supabase/config'
import type {
  Application,
  ChecklistProgress,
  DemoBookingWithSlot,
  DemoSlot,
  Partner,
} from './types'
import { CONTENT_KEYS } from './types'

/**
 * Read helpers for server components.
 *
 * Every function returns an empty/null result rather than throwing when
 * Supabase is unconfigured, so the public site renders before the backend
 * exists. Callers must already handle the empty case honestly — see the
 * spotlight empty state — so this costs nothing.
 */

export async function getPublishedPartners(): Promise<Partner[]> {
  if (!isSupabaseConfigured) return []
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('partners')
    .select('*')
    .eq('is_published', true)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: true })

  if (error) {
    console.error('[partners]', error.message)
    return []
  }
  return (data as Partner[]) ?? []
}

/** A single `site_content` value, or null when unset. Never a placeholder. */
export async function getContent(key: string): Promise<string | null> {
  if (!isSupabaseConfigured) return null
  const supabase = await createClient()
  const { data } = await supabase.from('site_content').select('value').eq('key', key).maybeSingle()
  const value = (data as { value: string } | null)?.value?.trim()
  return value ? value : null
}

/**
 * The admin-set active chapter count, as a display string.
 *
 * Returns null unless the value is a real positive integer. The stat tile is
 * omitted entirely in that case — the site never shows a guessed number.
 */
export async function getActiveChapterCount(): Promise<string | null> {
  const raw = await getContent(CONTENT_KEYS.chaptersActive)
  if (!raw) return null
  const n = Number.parseInt(raw, 10)
  return Number.isFinite(n) && n > 0 ? String(n) : null
}

export async function getMyApplication(userId: string): Promise<Application | null> {
  if (!isSupabaseConfigured) return null
  const supabase = await createClient()
  const { data } = await supabase
    .from('applications')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle()
  return (data as Application) ?? null
}

export async function getMyBookings(userId: string): Promise<DemoBookingWithSlot[]> {
  if (!isSupabaseConfigured) return []
  const supabase = await createClient()
  const { data } = await supabase
    .from('demo_bookings')
    .select('*, demo_slots(*)')
    .eq('user_id', userId)
    .neq('status', 'cancelled')
  const rows = (data as DemoBookingWithSlot[]) ?? []
  return rows.sort((a, b) => {
    const at = a.demo_slots?.starts_at ?? ''
    const bt = b.demo_slots?.starts_at ?? ''
    return at.localeCompare(bt)
  })
}

/**
 * Slots that are active, in the future, and not already booked.
 *
 * The taken-slot filter is a convenience for rendering; correctness is
 * guaranteed by the unique index on demo_bookings.slot_id, not by this query.
 */
export async function getAvailableSlots(): Promise<DemoSlot[]> {
  if (!isSupabaseConfigured) return []
  const supabase = await createClient()

  const [{ data: slots }, { data: taken }] = await Promise.all([
    supabase
      .from('demo_slots')
      .select('*')
      .eq('is_active', true)
      .gt('starts_at', new Date().toISOString())
      .order('starts_at', { ascending: true })
      .limit(60),
    supabase.from('demo_bookings').select('slot_id').neq('status', 'cancelled'),
  ])

  const takenIds = new Set(((taken as { slot_id: string }[]) ?? []).map((r) => r.slot_id))
  return ((slots as DemoSlot[]) ?? []).filter((s) => !takenIds.has(s.id))
}

export async function getMyChecklist(userId: string): Promise<Record<string, boolean>> {
  if (!isSupabaseConfigured) return {}
  const supabase = await createClient()
  const { data } = await supabase
    .from('checklist_progress')
    .select('item_key, is_complete')
    .eq('user_id', userId)

  const map: Record<string, boolean> = {}
  for (const row of ((data as ChecklistProgress[]) ?? [])) {
    map[row.item_key] = row.is_complete
  }
  return map
}
