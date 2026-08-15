/**
 * People. Real names, real roles, real email addresses only.
 *
 * `photo` points at a file in /public. If the file is missing the component
 * falls back to initials rather than a stock portrait — see components/ui/avatar.
 */

export type Person = {
  name: string
  role: string
  email: string
  photo: string | null
  bio: string
}

export const LEADERSHIP: Person[] = [
  {
    name: 'Armaan Arya',
    role: 'President',
    email: 'armaanarya100@gmail.com',
    photo: '/people/armaan-arya.png',
    bio: 'Leads the Financing the Future international program, working with chapter founders on curriculum, outreach, and getting new chapters off the ground.',
  },
  {
    name: 'Anay Sinhal',
    role: 'Co-President',
    email: 'anay13366@gmail.com',
    photo: '/people/anay.png',
    bio: 'Co-leads the Financing the Future international program, running intro calls with prospective founders and supporting chapters once they launch.',
  },
]

/**
 * Chapter officers.
 *
 * Intentionally EMPTY. This directory will list every chapter and its officers
 * once real people have been confirmed and have agreed to appear. Adding
 * example entries here would put invented students on a public page — do not.
 *
 * To populate: add a Chapter object per chapter, each with its own officers.
 */
export type Officer = {
  name: string
  role: string
  email?: string
  photo?: string | null
}

export type Chapter = {
  /** URL-safe id, e.g. "valley-christian" */
  slug: string
  name: string
  location: string
  country: string
  foundedYear?: number
  officers: Officer[]
}

export const CHAPTERS: Chapter[] = []
