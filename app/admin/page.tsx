import Link from 'next/link'
import { adminListApplications, adminListBookings, adminListPartners } from '@/lib/admin-data'

export default async function AdminOverviewPage() {
  const [applications, bookings, partners] = await Promise.all([
    adminListApplications(),
    adminListBookings(),
    adminListPartners(),
  ])

  const now = new Date()
  const upcomingCalls = bookings.filter(
    (b) => b.status === 'confirmed' && b.demo_slots && new Date(b.demo_slots.starts_at) > now,
  )

  const tiles = [
    {
      label: 'Applications',
      value: applications.length,
      detail: `${applications.filter((a) => a.status === 'new').length} awaiting a call`,
      href: '/admin/applications',
    },
    {
      label: 'Upcoming calls',
      value: upcomingCalls.length,
      detail: `${bookings.length} booked all time`,
      href: '/admin/bookings',
    },
    {
      label: 'Active chapters',
      value: applications.filter((a) => a.status === 'active_chapter').length,
      detail: 'Applications marked active',
      href: '/admin/applications',
    },
    {
      label: 'Published spotlights',
      value: partners.filter((p) => p.is_published).length,
      detail: `${partners.length} total entries`,
      href: '/admin/partners',
    },
  ]

  return (
    <div>
      <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {tiles.map((tile) => (
          <Link
            key={tile.label}
            href={tile.href}
            className="rounded-card border border-line bg-white p-6 shadow-sm transition-colors duration-150 hover:bg-beige-50"
          >
            <dt className="text-sm font-semibold text-ink-600">{tile.label}</dt>
            <dd className="tabular mt-2 font-display text-4xl font-extrabold text-ink-900">
              {tile.value}
            </dd>
            <dd className="mt-1 text-sm text-ink-500">{tile.detail}</dd>
          </Link>
        ))}
      </dl>

      <div className="mt-10 rounded-card border border-line bg-beige-50 p-6">
        <h2 className="font-display text-lg font-bold text-ink-900">
          A note on the numbers above
        </h2>
        <p className="mt-2 max-w-prose text-sm text-ink-600">
          These counts are live from the database. The public site never shows an invented
          figure — the impact bar on the landing page carries only the three verified statistics
          (300+ students, 7 years, 4 countries). The active-chapter tile appears publicly only
          once you set a real number under{' '}
          <Link
            href="/admin/content"
            className="font-semibold text-green-cta underline underline-offset-2"
          >
            Content
          </Link>
          .
        </p>
      </div>
    </div>
  )
}
