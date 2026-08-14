import type { NextRequest } from 'next/server'

/**
 * In-memory fixed-window rate limiter.
 *
 * Scope caveat: this is per-instance. On a serverless platform each cold
 * instance keeps its own counters, so the effective limit is (limit × instances).
 * That is acceptable for the abuse level this app faces — the goal is to stop a
 * naive script, not a distributed attacker. Move to Upstash/Redis if that
 * changes. It is NOT a substitute for the database constraints that enforce
 * correctness (see the unique index on demo_bookings.slot_id).
 */
const buckets = new Map<string, { count: number; resetAt: number }>()

export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now()
  const bucket = buckets.get(key)

  if (!bucket || now > bucket.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs })
    // Opportunistic sweep so the map cannot grow without bound.
    if (buckets.size > 5000) {
      for (const [k, v] of buckets) if (now > v.resetAt) buckets.delete(k)
    }
    return true
  }

  if (bucket.count >= limit) return false
  bucket.count += 1
  return true
}

export function clientIp(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0].trim()
  return req.headers.get('x-real-ip') ?? 'unknown'
}
