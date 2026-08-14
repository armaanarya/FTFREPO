import Link from 'next/link'
import { requireAdmin } from '@/lib/auth'
import { hasServiceRole } from '@/lib/supabase/admin'

/**
 * Never prerender this route. It is behind an auth check, and a statically
 * generated page would be served without ever running that check — the build
 * output marked these routes `○ (Static)` when built without Supabase env vars,
 * which is exactly how a protected page ships as public HTML. Explicit beats
 * relying on `cookies()` happening to be reached during prerender.
 */
export const dynamic = 'force-dynamic'


const TABS = [
  { href: '/admin', label: 'Overview' },
  { href: '/admin/applications', label: 'Applications' },
  { href: '/admin/bookings', label: 'Calls' },
  { href: '/admin/slots', label: 'Availability' },
  { href: '/admin/partners', label: 'Spotlight' },
  { href: '/admin/content', label: 'Content' },
]

/**
 * Every admin page is gated here. `requireAdmin` redirects a non-admin away
 * before any child renders, and the admin APIs re-check independently — a
 * layout guard alone would do nothing for a direct fetch().
 */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin('/admin')

  return (
    <div className="mx-auto max-w-content px-4 py-12 sm:px-6">
      <h1 className="font-display text-3xl font-extrabold text-ink-900">Admin</h1>

      {!hasServiceRole && (
        <p
          role="alert"
          className="mt-6 rounded-ctl border border-[color:var(--status-onboarded)] bg-[color:var(--status-onboarded-surface)] px-4 py-3 text-sm font-medium text-[color:var(--status-onboarded)]"
        >
          <code>SUPABASE_SERVICE_ROLE_KEY</code> is not set, so admin data cannot be read or
          written. See <code>docs/SUPABASE-SETUP.md</code>.
        </p>
      )}

      {/* Square tabs, consistent with the main nav's dashboard chrome. */}
      <nav aria-label="Admin sections" className="mt-8 border-b border-line">
        <ul className="flex flex-wrap gap-1">
          {TABS.map((tab) => (
            <li key={tab.href}>
              <Link
                href={tab.href}
                className="flex min-h-[44px] items-center border-b-[3px] border-transparent px-4 text-[15px] font-medium text-ink-600 transition-colors duration-150 hover:border-line-strong hover:text-ink-900"
              >
                {tab.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="mt-8">{children}</div>
    </div>
  )
}
