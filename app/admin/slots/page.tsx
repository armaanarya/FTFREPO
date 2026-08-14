import { adminListSlots } from '@/lib/admin-data'
import { SlotManager } from './slot-manager'

export default async function AdminSlotsPage() {
  const slots = await adminListSlots()

  return (
    <div>
      <h2 className="font-display text-xl font-bold text-ink-900">Call availability</h2>
      <p className="mt-2 max-w-prose text-sm text-ink-600">
        Applicants can only book times you publish here. Times are entered in your own
        timezone and stored in UTC, so everyone sees the correct local time.
      </p>
      <div className="mt-6">
        <SlotManager slots={slots} />
      </div>
    </div>
  )
}
