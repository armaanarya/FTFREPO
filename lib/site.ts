/**
 * Organization facts.
 *
 * NORMATIVE: every value here is verified. Nothing may be added to this file
 * that has not been confirmed by the FTF team. See docs/SPEC.md §"Verified
 * facts". Unknown values are `null`, and every consumer must render nothing
 * rather than a placeholder when it encounters one.
 */

export const SITE = {
  name: 'Financing the Future',
  shortName: 'FTF',
  tagline: 'Helping young people build core financial skills.',
  parentOrg: 'Valley Christian Schools',
  parentOrgUrl: 'https://vcs.net',
  foundedAt: 'Valley Christian School',

  /** Contact + social. null until the team supplies the real value. */
  contactEmail: null as string | null,
  linkedinUrl: null as string | null,
} as const

/** Impact statistics. Each is verified; see docs/SPEC.md. */
export type Stat = { value: string; label: string; detail: string }

export const STATS: Stat[] = [
  { value: '300+', label: 'Students coached', detail: 'Across every chapter since we started.' },
  { value: '7', label: 'Years running', detail: 'Continuously, since our founding at Valley Christian School.' },
  { value: '4', label: 'Countries', detail: 'United States, Singapore, Vietnam, and Spain.' },
]

/**
 * The countries FTF operates in. Used for the spotlight filter and the stats
 * detail line — the count above is derived from this list, so the two can never
 * drift apart.
 */
export const COUNTRIES = ['United States', 'Singapore', 'Vietnam', 'Spain'] as const
export type Country = (typeof COUNTRIES)[number]

export const HOW_IT_WORKS = [
  {
    step: 1,
    title: 'Apply',
    body: 'Tell us who you are, where you are, and why you want to run a chapter. It takes about five minutes.',
  },
  {
    step: 2,
    title: 'Book a demo',
    body: 'Pick a time that works for you. We walk you through the program and answer anything you want to ask.',
  },
  {
    step: 3,
    title: 'Onboarding call',
    body: 'We cover program structure, your school year plan, outreach locations, and the support we provide.',
  },
  {
    step: 4,
    title: 'Launch your chapter',
    body: 'You get the full curriculum, a fundraising page, LinkedIn access, and graphics built for your chapter.',
  },
] as const
