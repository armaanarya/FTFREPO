import { adminListApplications } from '@/lib/admin-data'
import { ApplicationRow } from './application-row'

export default async function AdminApplicationsPage() {
  const applications = await adminListApplications()

  if (applications.length === 0) {
    return (
      <div className="rounded-card border border-dashed border-line-strong bg-beige-50 p-8">
        <h2 className="font-display text-lg font-bold text-ink-900">No applications yet</h2>
        <p className="mt-2 text-sm text-ink-600">
          Applications appear here as soon as someone submits one.
        </p>
      </div>
    )
  }

  return (
    <div>
      <p className="text-sm text-ink-600">
        {applications.length} application{applications.length === 1 ? '' : 's'}. Expand a row to
        read the full answers and move it through the pipeline.
      </p>
      <ul className="mt-6 space-y-3">
        {applications.map((application) => (
          <li key={application.id}>
            <ApplicationRow application={application} />
          </li>
        ))}
      </ul>
    </div>
  )
}
