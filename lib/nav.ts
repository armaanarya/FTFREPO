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
 * Kept flat and short on purpose — an overloaded nav is the most common way a
 * site like this becomes hard for a 12-year-old and a school principal to use
 * at the same time.
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
        label: 'How it works',
        href: '/#how-it-works',
        description: 'The four steps from applying to launching your chapter.',
      },
      {
        label: 'Global spotlight',
        href: '/#spotlight',
        description: 'Chapter leaders and the work they are doing.',
      },
    ],
  },
  {
    label: 'Get started',
    items: [
      {
        label: 'Start a chapter',
        href: '/apply',
        description: 'Apply to bring a chapter to your school or community.',
      },
      {
        label: 'Book a demo',
        href: '/book',
        description: 'Talk to our team about the program.',
      },
      {
        label: 'Launch playbook',
        href: '/playbook',
        description: 'What happens in your launch meeting, and what to prepare.',
      },
    ],
  },
  { label: 'Dashboard', href: '/dashboard' },
]

/** Shown in the footer. Flattened from NAV so the two can never drift. */
export const FOOTER_LINKS = NAV.flatMap((group) =>
  group.items ? group.items.map(({ label, href }) => ({ label, href })) : [{ label: group.label, href: group.href! }],
)
