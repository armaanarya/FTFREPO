import { adminListPartners } from '@/lib/admin-data'
import { PartnerManager } from './partner-manager'

export default async function AdminPartnersPage() {
  const partners = await adminListPartners()

  return (
    <div>
      <h2 className="font-display text-xl font-bold text-ink-900">Global spotlight</h2>
      <p className="mt-2 max-w-prose text-sm text-ink-600">
        Entries appear on the landing page only when <strong>Published</strong> is on. Until at
        least one is published, the spotlight section shows a written explanation rather than
        placeholder cards — please keep it that way and only add real chapter leaders who have
        agreed to appear.
      </p>
      <div className="mt-6">
        <PartnerManager partners={partners} />
      </div>
    </div>
  )
}
