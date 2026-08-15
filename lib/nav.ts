export type NavItem = {
  label: string
  href: string
  description?: string
}

export type NavGroup = {
  label: string
  /** A group with `href` is itself a link; its children open in a dropdown. */
  href?: string
  items?: NavItem[]
}

/**
 * Primary navigation. Groups with `items` render as dropdowns.
 *
 * Every destination is public — there is no sign-in anywhere on this site.
 */
export const NAV: NavGroup[] = [
  {
    label: 'Program',
    items: [
      {
        label: 'Our story',
        href: '/#our-story',
        description: 'How Financing the Future started and where it runs today.',
      },
      {
        label: 'Program formats',
        href: '/get-started#formats',
        description: 'A 6–8 week course, or a single two-hour deep dive.',
      },
      {
        label: 'How it works',
        href: '/#how-it-works',
        description: 'The four steps from first call to your first class.',
      },
    ],
  },
  {
    label: 'Start a chapter',
    items: [
      {
        label: 'Get started',
        href: '/get-started',
        description: 'What we ask of you, and what we provide in return.',
      },
      {
        label: 'What we provide',
        href: '/get-started#what-we-provide',
        description: 'Curriculum, outreach guidance, LinkedIn, and graphics.',
      },
    ],
  },
  { label: 'Chapter officers', href: '/officers' },
  { label: 'Contact', href: '/contact' },
]

/** Shown in the footer. Flattened from NAV so the two can never drift. */
export const FOOTER_LINKS = NAV.flatMap((group) =>
  group.items
    ? group.items.map(({ label, href }) => ({ label, href }))
    : [{ label: group.label, href: group.href! }],
)
