/**
 * Program content: how a chapter runs, what we ask of founders, and what we
 * provide in return. Supplied by the FTF team — see docs/SPEC.md §"Verified
 * facts" for the rule about what may and may not appear on this site.
 */

/** Booking link. Every "book a call" CTA on the site points here. */
export const CALENDLY_URL = 'https://calendly.com/anay13366/30min'

/**
 * FTF sign-up Google Form.
 *
 * TO ACTIVATE: replace `null` with the form URL, e.g.
 *   export const SIGNUP_FORM_URL: string | null = 'https://forms.gle/xxxxxxxx'
 * That is the only change needed — every sign-up button on the site switches
 * from its "opening soon" state to a live link automatically.
 *
 * While this is null the button still renders so the layout is final, but it is
 * disabled and labelled honestly. A button that looks live and goes nowhere is
 * a dead end for a real visitor, and this site is public.
 */
export const SIGNUP_FORM_URL: string | null = null

/**
 * Shown next to every Calendly link. The times on the calendar are not the only
 * times available and founders should not self-select out because of a
 * timezone or a school schedule.
 */
export const SCHEDULING_NOTE =
  'If none of the times on the calendar work for you, just email us. We run chapters across four countries and several timezones, so we are used to working around school schedules — we will find a time that fits yours.'

/**
 * The two ways to run a chapter. A founder picks ONE. This choice is the first
 * thing we cover on the call, so it is stated plainly everywhere it appears.
 */
export const PROGRAM_FORMATS = [
  {
    id: 'series',
    name: '6–8 week program',
    shape: 'One-hour workshop each week',
    body: 'A full course. You meet your students once a week for an hour across six to eight weeks, working through the curriculum module by module. Students build on what they learned the week before, and you get to know them.',
    bestFor:
      'Best if you have a consistent group — a club, a class period, or a partner organization that can host you weekly.',
  },
  {
    id: 'workshop',
    name: 'Single deep-dive workshop',
    shape: 'One session, about two hours',
    body: 'One subject, covered properly. Instead of surveying everything, you take a single topic — budgeting, credit, saving — and go deep on it for roughly two hours. Hands-on the whole way through, with the goal that students leave actually knowing how to do it, not just having heard about it.',
    bestFor:
      'Best if weekly access is hard to arrange, or you are working with a library, community center, or a one-off event.',
  },
] as const

/**
 * What we ask founders to work out before the launch call. These are the exact
 * four things the call is built around — arriving with answers is what makes it
 * a planning conversation instead of an introduction.
 */
export const FOUNDER_EXPECTATIONS = [
  {
    title: 'Finalize your team',
    body: 'Decide who you want to run this program with. Plenty of chapters start with one person, so running solo is completely fine — we just want to know who is involved.',
  },
  {
    title: 'Know your availability',
    body: 'Work out when you can realistically run the 6–8 week program, or when you could hold your workshop. School calendars, sports seasons, exam weeks — bring the real constraints.',
  },
  {
    title: 'Decide how often you will run it',
    body: 'How many times do you plan to offer the program over this school year? Once is a real answer. So is four.',
  },
  {
    title: 'Map your outreach',
    body: 'Where and how do you plan to reach students and teach? We would love to understand what opportunities exist in your local community — schools, libraries, community centers, nonprofits — and how accessible it is for you to actually reach students there.',
  },
] as const

/** What Financing the Future provides to every chapter. */
export const WHAT_WE_PROVIDE = [
  {
    title: 'Complete curriculum and teaching materials',
    body: 'Every lesson, worksheet, and teaching resource you need. You are never writing a course from scratch.',
  },
  {
    title: 'Guidance on outreach and coordinating classes',
    body: 'Help finding places to teach and working with the people who run them — the part that is hardest to figure out alone.',
  },
  {
    title: 'Access to our LinkedIn page',
    body: 'So we can showcase your chapter’s work and increase visibility for what you are building.',
  },
  {
    title: 'Personalized social media graphics and posts',
    body: 'Made for your chapter, to help you promote your program and recruit students in your area.',
  },
] as const

/** The four steps from first contact to a running chapter. */
export const HOW_IT_WORKS = [
  {
    step: 1,
    title: 'Book a call',
    body: 'Pick a time that works for you, or email us if none of them do. No application form and no account required.',
  },
  {
    step: 2,
    title: 'Talk it through',
    body: 'We walk you through the program, answer your questions, and figure out together whether it fits your school and community.',
  },
  {
    step: 3,
    title: 'Plan your chapter',
    body: 'Choose your format, set your dates, and map out where you will teach. This is where the four things above get decided.',
  },
  {
    step: 4,
    title: 'Launch',
    body: 'You get the full curriculum, outreach guidance, LinkedIn access, and graphics built for your chapter. Then you teach.',
  },
] as const
