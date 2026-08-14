import 'server-only'

import { createAdminClient, hasServiceRole } from './supabase/admin'
import type { Application, DemoBookingWithSlot, DemoSlot, Partner, Profile } from './types'

/**
 * Admin reads.
 *
 * These use the service-role client, which bypasses RLS — so EVERY caller must
 * have already passed `requireAdmin()` (pages) or `requireAdminApi()` (routes).
 * Nothing in this module performs its own authorization; that is the caller's
 * job and it is not optional.
 */

export type AdminApplication = Application & { profiles: Pick<Profile, 'email' | 'avatar_url'> | null }

export async function adminListApplications(): Promise<AdminApplication[]> {
  if (!hasServiceRole) return []
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('applications')
    .select('*, profiles(email, avatar_url)')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('[admin:applications]', error.message)
    return []
  }
  return (data as AdminApplication[]) ?? []
}

export type AdminBooking = DemoBookingWithSlot & {
  profiles: Pick<Profile, 'email' | 'full_name'> | null
}

export async function adminListBookings(): Promise<AdminBooking[]> {
  if (!hasServiceRole) return []
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('demo_bookings')
    .select('*, demo_slots(*), profiles(email, full_name)')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('[admin:bookings]', error.message)
    return []
  }
  const rows = (data as AdminBooking[]) ?? []
  return rows.sort((a, b) =>
    (a.demo_slots?.starts_at ?? '').localeCompare(b.demo_slots?.starts_at ?? ''),
  )
}

export async function adminListPartners(): Promise<Partner[]> {
  if (!hasServiceRole) return []
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('partners')
    .select('*')
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: true })

  if (error) {
    console.error('[admin:partners]', error.message)
    return []
  }
  return (data as Partner[]) ?? []
}

export async function adminListSlots(): Promise<DemoSlot[]> {
  if (!hasServiceRole) return []
  const supabase = createAdminClient()
  const { data } = await supabase
    .from('demo_slots')
    .select('*')
    .gte('starts_at', new Date(Date.now() - 7 * 864e5).toISOString())
    .order('starts_at', { ascending: true })
  return (data as DemoSlot[]) ?? []
}

export async function adminGetContent(): Promise<Record<string, string>> {
  if (!hasServiceRole) return {}
  const supabase = createAdminClient()
  const { data } = await supabase.from('site_content').select('key, value')
  const map: Record<string, string> = {}
  for (const row of ((data as { key: string; value: string }[]) ?? [])) {
    map[row.key] = row.value
  }
  return map
}
