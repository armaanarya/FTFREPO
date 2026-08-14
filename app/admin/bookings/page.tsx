import { adminListBookings } from '@/lib/admin-data'

export default async function AdminBookingsPage() {
  const bookings = await adminListBookings()

  if (bookings.length === 0) {
    return (
      <div className="rounded-card border border-dashed border-line-strong bg-beige-50 p-8">
        <h2 className="font-display text-lg font-bold text-ink-900">No calls booked yet</h2>
        <p className="mt-2 text-sm text-ink-600">
          Publish some availability under <strong>Availability</strong> so applicants have times
          to choose from.
        </p>
      </div>
    )
  }

  const now = new Date()

  return (
    <div>
      <p className="text-sm text-ink-600">
        {bookings.length} booking{bookings.length === 1 ? '' : 's'}, earliest first. Times are
        shown in each attendee&rsquo;s own timezone as well as yours.
      </p>

      {/* Horizontal overflow is scoped to the table so the page body never
          scrolls sideways on a phone. */}
      <div className="mt-6 overflow-x-auto rounded-card border border-line">
        <table className="w-full min-w-[720px] border-collapse bg-white text-sm">
          <caption className="sr-only">All booked intro calls</caption>
          <thead>
            <tr className="border-b border-line bg-beige-50 text-left">
              <th scope="col" className="px-4 py-3 font-semibold text-ink-900">
                When (your time)
              </th>
              <th scope="col" className="px-4 py-3 font-semibold text-ink-900">
                Attendee
              </th>
              <th scope="col" className="px-4 py-3 font-semibold text-ink-900">
                Their timezone
              </th>
              <th scope="col" className="px-4 py-3 font-semibold text-ink-900">
                Format
              </th>
              <th scope="col" className="px-4 py-3 font-semibold text-ink-900">
                Note
              </th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((booking) => {
              const slot = booking.demo_slots
              const date = slot ? new Date(slot.starts_at) : null
              const isPast = date ? date <= now : false
              return (
                <tr
                  key={booking.id}
                  className="border-b border-line last:border-b-0 align-top"
                >
                  <td className="px-4 py-3">
                    <span className={isPast ? 'text-ink-500' : 'font-semibold text-ink-900'}>
                      {date
                        ? date.toLocaleString('en-US', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                            hour: 'numeric',
                            minute: '2-digit',
                          })
                        : 'Slot removed'}
                    </span>
                    <span className="mt-0.5 block text-xs text-ink-500">
                      {booking.status === 'cancelled'
                        ? 'Cancelled'
                        : isPast
                          ? 'Past'
                          : 'Upcoming'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="block text-ink-900">
                      {booking.profiles?.full_name ?? '—'}
                    </span>
                    <span className="block break-all text-xs text-ink-500">
                      {booking.profiles?.email ?? ''}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-ink-600">
                    {booking.timezone.replace(/_/g, ' ')}
                    {date && (
                      <span className="mt-0.5 block text-xs text-ink-500">
                        {date.toLocaleTimeString('en-US', {
                          timeZone: booking.timezone,
                          hour: 'numeric',
                          minute: '2-digit',
                        })}{' '}
                        their time
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-ink-600">
                    {booking.format === 'video' ? 'Video' : 'Phone'}
                  </td>
                  <td className="max-w-[280px] whitespace-pre-line px-4 py-3 text-ink-600">
                    {booking.note ?? '—'}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
