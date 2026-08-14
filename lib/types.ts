export const APPLICATION_STATUSES = [
  'new',
  'demo_scheduled',
  'onboarded',
  'active_chapter',
] as const
export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number]

/** Plain-language copy for each status, shown to founders on the dashboard. */
export const STATUS_COPY: Record<
  ApplicationStatus,
  { label: string; explanation: string }
> = {
  new: {
    label: 'Received',
    explanation: 'We have your application. The next step is booking your intro call.',
  },
  demo_scheduled: {
    label: 'Call scheduled',
    explanation: 'Your intro call is booked. Read the Launch Playbook before you meet with us.',
  },
  onboarded: {
    label: 'Onboarded',
    explanation: 'You have completed onboarding. Work through your launch checklist next.',
  },
  active_chapter: {
    label: 'Active chapter',
    explanation: 'Your chapter is live. Curriculum and teaching resources are unlocked below.',
  },
}

export const APPLYING_AS = ['individual', 'team'] as const
export type ApplyingAs = (typeof APPLYING_AS)[number]

export const BOOKING_FORMATS = ['video', 'phone'] as const
export type BookingFormat = (typeof BOOKING_FORMATS)[number]

export const BOOKING_STATUSES = ['confirmed', 'cancelled', 'completed', 'no_show'] as const
export type BookingStatus = (typeof BOOKING_STATUSES)[number]

export type Profile = {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  is_admin: boolean
  created_at: string
}

export type Application = {
  id: string
  user_id: string
  full_name: string
  email: string
  organization: string
  city: string
  country: string
  grade_or_role: string
  motivation: string
  applying_as: ApplyingAs
  team_details: string | null
  status: ApplicationStatus
  created_at: string
  updated_at: string
}

export type DemoSlot = {
  id: string
  starts_at: string
  duration_minutes: number
  is_active: boolean
}

export type DemoBooking = {
  id: string
  user_id: string
  slot_id: string
  timezone: string
  format: BookingFormat
  note: string | null
  status: BookingStatus
  created_at: string
}

export type DemoBookingWithSlot = DemoBooking & { demo_slots: DemoSlot | null }

export type Partner = {
  id: string
  name: string
  photo_url: string | null
  location: string
  country: string
  bio: string
  quote: string | null
  chapter_stats: string | null
  is_published: boolean
  sort_order: number
  created_at: string
}

export type ChecklistProgress = {
  id: string
  user_id: string
  item_key: string
  is_complete: boolean
  updated_at: string
}

/**
 * The founder action-item checklist from the launch meeting. Keys are stable
 * identifiers persisted in the database — renaming a key orphans saved progress,
 * so add new keys rather than editing existing ones.
 */
export const CHECKLIST_ITEMS = [
  {
    key: 'format_decision',
    title: 'Decide your program format',
    body: 'Choose between longer hands-on workshops or the six-week financial literacy class.',
  },
  {
    key: 'calendar_availability',
    title: 'Confirm your calendar availability',
    body: 'Work out how many sessions you can run and at what times across your school year.',
  },
  {
    key: 'outreach_locations',
    title: 'Finalize your outreach locations',
    body: 'Identify the schools, libraries, community centers, or nonprofits you will teach at, and rate how accessible outreach is in your area.',
  },
  {
    key: 'policy_barriers',
    title: 'Note any policy barriers',
    body: 'Flag any school or state policies that affect teaching in your area so we can plan around them.',
  },
] as const

export type ChecklistItemKey = (typeof CHECKLIST_ITEMS)[number]['key']

/** Keys used in the `site_content` table. */
export const CONTENT_KEYS = {
  playbookFollowUp: 'playbook_follow_up',
  chaptersActive: 'chapters_active',
} as const
