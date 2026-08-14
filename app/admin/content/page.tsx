import { adminGetContent } from '@/lib/admin-data'
import { CONTENT_KEYS } from '@/lib/types'
import { ContentEditor } from './content-editor'

export default async function AdminContentPage() {
  const content = await adminGetContent()

  return (
    <div className="max-w-3xl">
      <h2 className="font-display text-xl font-bold text-ink-900">Editable content</h2>
      <p className="mt-2 text-sm text-ink-600">
        Both fields below are empty by default and render nothing on the public site until you
        fill them in. There is no placeholder text anywhere.
      </p>

      <div className="mt-8 space-y-10">
        <ContentEditor
          contentKey={CONTENT_KEYS.playbookFollowUp}
          initial={content[CONTENT_KEYS.playbookFollowUp] ?? ''}
          title="Post-launch-meeting follow-up"
          description="Paste the instructions and email text you send founders after their launch meeting. This appears at the bottom of the Launch Playbook page. Line breaks are preserved. While this is empty, the section does not appear at all."
          multiline
          placeholder=""
        />

        <ContentEditor
          contentKey={CONTENT_KEYS.chaptersActive}
          initial={content[CONTENT_KEYS.chaptersActive] ?? ''}
          title="Active chapter count"
          description="A whole number. This adds a fourth tile to the landing page impact bar. Leave it empty until you know the real figure — the tile is simply absent rather than showing a guess."
          inputMode="numeric"
        />
      </div>
    </div>
  )
}
