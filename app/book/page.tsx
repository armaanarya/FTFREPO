import type { Metadata } from 'next'
import { requireUser } from '@/lib/auth'
import { getAvailableSlots, getMyBookings } from '@/lib/data'
import { SlotPicker } from '@/components/booking/slot-picker'
import { BookingCard } from '@/components/booking/booking-card'
import { ButtonLink } from '@/components/ui/button'

/**
 * Never prerender this route. It is behind an auth check, and a statically
 * generated page would be served without ever running that check — the build
 * output marked these routes `○ (Static)` when built without Supabase env vars,
 * which is exactly how a protected page ships as public HTML. Explicit beats
 * relying on `cookies()` happening to be reached during prerender.
 */
export const dynamic = 'force-dynamic'


export const metadata: Metadata = { title: 'Book a demo' }

export default async function BookPage() {
  const profile = await requireUser('/book')
  const [slots, bookings] = await Promise.all([
    getAvailableSlots(),
    getMyBookings(profile.id),
  ])

  const upcoming = bookings.filter(
    (b) => b.demo_slots && new Date(b.demo_slots.starts_at) > new Date(),
  )

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <h1 className="font-display text-3xl font-extrabold text-ink-900 sm:text-4xl">
        Book a demo
      </h1>
      <p className="mt-4 max-w-prose text-lg text-ink-600">
        A short call with our team. We walk through how the program works, what running a
        chapter looks like at your school, and answer whatever you want to ask.
      </p>

      {upcoming.length > 0 ? (
        <div className="mt-10">
          <h2 className="font-display text-xl font-bold text-ink-900">
            You already have a call booked
          </h2>
          <div className="mt-4 space-y-4">
            {upcoming.map((booking) => (
              <BookingCard key={booking.id} booking={booking} cancellable />
            ))}
          </div>
          <p className="mt-6 text-sm text-ink-600">
            Need a different time? Cancel the booking above and pick a new one.
          </p>
          <div className="mt-6">
            <ButtonLink href="/playbook" variant="secondary">
              Read the launch playbook
            </ButtonLink>
          </div>
        </div>
      ) : (
        <div className="mt-10">
          <SlotPicker slots={slots} />
        </div>
      )}
    </div>
  )
}
