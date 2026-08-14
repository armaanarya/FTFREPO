import Image from 'next/image'
import { ButtonLink } from '@/components/ui/button'
import { Section, SectionHeading } from '@/components/ui/section'
import { PartnerSpotlight } from '@/components/site/partner-spotlight'
import { getActiveChapterCount } from '@/lib/data'
import { COUNTRIES, HOW_IT_WORKS, SITE, STATS } from '@/lib/site'

/**
 * Revalidate rather than force-dynamic: this page is public and cacheable, but
 * it renders admin-managed content (spotlight entries, the chapter count), so a
 * permanent build-time snapshot would hide edits until the next deploy.
 */
export const revalidate = 60


export default async function HomePage() {
  // Only rendered if an admin has set a real number. See docs/SPEC.md.
  const activeChapters = await getActiveChapterCount()

  const stats = activeChapters
    ? [
        ...STATS,
        {
          value: activeChapters,
          label: 'Active chapters',
          detail: 'Chapters currently running programs.',
        },
      ]
    : STATS

  return (
    <>
      {/* ---------------------------------------------------------------- Hero */}
      <section className="border-b border-line bg-white px-4 py-16 sm:px-6 sm:py-24">
        <div className="mx-auto grid max-w-content items-center gap-12 lg:grid-cols-[1.15fr_1fr]">
          <div>
            <p className="font-display text-xs font-bold uppercase tracking-[0.1em] text-green-cta">
              A program of {SITE.parentOrg}
            </p>
            <h1 className="mt-4 font-display text-4xl font-extrabold text-ink-900 sm:text-5xl lg:text-6xl">
              Helping young people build{' '}
              <span className="text-green-cta">core financial skills</span>.
            </h1>
            <p className="mt-6 max-w-prose text-lg text-ink-600">
              Financing the Future is a student-led financial literacy program. We train
              students to teach the money skills that school leaves out — budgeting, saving,
              credit, and planning — to other students in their own communities.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink href="/apply" size="lg">
                Start a chapter
              </ButtonLink>
              <ButtonLink href="/book" variant="secondary" size="lg">
                Book a demo
              </ButtonLink>
            </div>

            <p className="mt-5 text-sm text-ink-500">
              Open to middle and high school students. Administrators and faculty are welcome
              to book a call too.
            </p>
          </div>

          {/* This column used to repeat the logo already sitting in the nav.
              For the administrator audience it is the most valuable space on
              the page, so it now answers the two questions they actually have:
              what gets taught, and where this already runs. */}
          <aside
            aria-labelledby="hero-aside-heading"
            className="rounded-card border border-beige-200 bg-beige-50 p-6 sm:p-8"
          >
            <div className="flex items-center gap-3">
              <Image src="/ftf-mark.svg" alt="" width={132} height={108} priority className="h-11 w-auto" />
              <h2 id="hero-aside-heading" className="font-display text-lg font-bold text-ink-900">
                What chapters teach
              </h2>
            </div>

            <ul className="mt-5 space-y-2.5">
              {['Budgeting that survives a real month', 'Saving and setting goals', 'How credit works, and how it breaks', 'Planning for costs that are coming'].map(
                (topic) => (
                  <li key={topic} className="flex gap-2.5 text-ink-700">
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 20 20"
                      fill="none"
                      aria-hidden="true"
                      className="mt-1 shrink-0 text-green-cta"
                    >
                      <circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="1.8" />
                      <path
                        d="M6 10.5l2.5 2.5L14 7.5"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    {topic}
                  </li>
                ),
              )}
            </ul>

            <div className="mt-6 border-t border-beige-200 pt-5">
              <p className="font-display text-xs font-bold uppercase tracking-[0.08em] text-ink-500">
                Running today in
              </p>
              <p className="mt-2 font-semibold text-ink-900">{COUNTRIES.join(' · ')}</p>
              <p className="mt-3 text-sm text-ink-600">
                Educational only. We do not give investment, tax, or legal advice.
              </p>
            </div>
          </aside>
        </div>
      </section>

      {/* --------------------------------------------------------------- Stats */}
      <section aria-labelledby="impact-heading" className="border-b border-line bg-green-800">
        <div className="mx-auto max-w-content px-4 py-12 sm:px-6 sm:py-14">
          <h2 id="impact-heading" className="sr-only">
            Our impact
          </h2>
          <dl className="grid grid-cols-2 gap-x-6 gap-y-10 lg:grid-cols-4">
            {/* `order` puts the number above its label visually while keeping
                dt-before-dd in the DOM, so the value is never announced without
                the thing it measures. No sr-only duplication. */}
            {stats.map((stat) => (
              <div key={stat.label} className="flex flex-col">
                <dt className="order-2 mt-2 font-semibold text-white">{stat.label}</dt>
                <dd className="tabular order-1 font-display text-4xl font-extrabold leading-none text-white sm:text-5xl">
                  {stat.value}
                </dd>
                <dd className="order-3 mt-1 text-sm text-green-100">{stat.detail}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ----------------------------------------------------------- Our story */}
      <Section id="our-story">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
          <SectionHeading
            eyebrow="Our story"
            title="Started at one school. Now running on three continents."
          />
          <div className="space-y-4 text-lg text-ink-600">
            <p>
              Financing the Future began at {SITE.foundedAt} with a straightforward
              observation: students graduate knowing how to solve for x, but not how to read a
              paycheck, build credit, or make a budget survive a real month.
            </p>
            <p>
              Seven years later, the program has coached more than 300 students. What started
              as one class has become a network of student-led chapters across the United
              States, Singapore, Vietnam, and Spain — each one run by students who teach in
              their own schools, libraries, and community centers.
            </p>
            <p>
              We remain a program of{' '}
              <a
                href={SITE.parentOrgUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-green-cta underline underline-offset-2 hover:text-green-800"
              >
                {SITE.parentOrg}
              </a>
              , which means every chapter is backed by an established nonprofit — something
              school administrators reasonably want to know before saying yes.
            </p>
          </div>
        </div>
      </Section>

      {/* ------------------------------------------------------------ Spotlight */}
      <PartnerSpotlight />

      {/* --------------------------------------------------------- How it works */}
      <Section id="how-it-works">
        <SectionHeading
          eyebrow="How it works"
          title="Four steps to your own chapter"
          lede="Most founders go from first application to first class in a single school term."
        />

        <ol className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {HOW_IT_WORKS.map((step) => (
            <li
              key={step.step}
              className="rounded-card border border-line bg-white p-6 shadow-sm"
            >
              <span
                aria-hidden="true"
                className="flex h-10 w-10 items-center justify-center rounded-chip bg-green-100 font-display text-lg font-extrabold text-green-800"
              >
                {step.step}
              </span>
              <h3 className="mt-4 font-display text-lg font-bold text-ink-900">
                <span className="sr-only">Step {step.step}: </span>
                {step.title}
              </h3>
              <p className="mt-2 text-sm text-ink-600">{step.body}</p>
            </li>
          ))}
        </ol>

        <div className="mt-10 flex flex-wrap gap-3">
          <ButtonLink href="/apply" size="lg">
            Start a chapter
          </ButtonLink>
          <ButtonLink href="/book" variant="secondary" size="lg">
            Book a demo
          </ButtonLink>
        </div>
      </Section>
    </>
  )
}
