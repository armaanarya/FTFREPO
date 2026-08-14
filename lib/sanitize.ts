/**
 * Server-side input hygiene. Every value that reaches the database passes
 * through here — client validation is a UX affordance, never a control.
 *
 * Control characters are matched via explicit \u escapes rather than literal
 * bytes so the source stays diffable and copy-paste safe.
 */

/** C0 and C1 control characters, excluding tab/newline/carriage return. */
const CONTROL_CHARS = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F]/g

/**
 * Single-line field: strip control characters, collapse all whitespace runs to
 * one space, trim, and clamp.
 */
export function clean(value: unknown, maxLength: number): string {
  if (typeof value !== 'string') return ''
  return value.replace(CONTROL_CHARS, '').replace(/\s+/g, ' ').trim().slice(0, maxLength)
}

/**
 * Multi-line field (textareas): same hygiene, but paragraph breaks survive.
 * Runs of 3+ newlines collapse to 2 so a user cannot pad a record with
 * thousands of blank lines.
 */
export function cleanMultiline(value: unknown, maxLength: number): string {
  if (typeof value !== 'string') return ''
  return value
    .replace(CONTROL_CHARS, '')
    .replace(/\r\n?/g, '\n')
    .replace(/[^\S\n]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
    .slice(0, maxLength)
}

/** Clamp a value to a fixed set of allowed strings, or return null. */
export function oneOf<T extends string>(value: unknown, allowed: readonly T[]): T | null {
  if (typeof value !== 'string') return null
  return (allowed as readonly string[]).includes(value) ? (value as T) : null
}

/**
 * Basic email shape check. Deliberately permissive — the address is proven by
 * the Google OAuth flow, so this only guards against malformed writes.
 */
export function isEmail(value: string): boolean {
  return value.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value)
}

/**
 * Accept only an absolute https URL. Partner photo URLs are admin-entered and
 * rendered in an <img>, so a javascript: or data: value must never survive.
 */
export function safeHttpsUrl(value: unknown, maxLength = 500): string | null {
  const raw = clean(value, maxLength)
  if (!raw) return null
  try {
    const url = new URL(raw)
    return url.protocol === 'https:' ? url.toString() : null
  } catch {
    return null
  }
}

/** Validate an IANA timezone against the runtime's own database. */
export function safeTimezone(value: unknown): string | null {
  const raw = clean(value, 64)
  if (!raw) return null
  try {
    new Intl.DateTimeFormat('en-US', { timeZone: raw })
    return raw
  } catch {
    return null
  }
}
