import type { Metadata } from 'next'
import { Section, SectionHeading } from '@/components/ui/section'
import { Avatar } from '@/components/ui/avatar'
import { BookACall } from '@/components/ui/calendly'
import { LEADERSHIP } from '@/lib/people'
import { SITE } from '@/lib/site'

export const metadata: Metadata = {
  title: 'Contact',
  description:
    'Reach the co-presidents of the Financing the Future international program directly, or book a call.',
}

export default function ContactPage() {
  return (
    <>
      <section className="border-b border-line bg-white px-4 py-16 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-content">
          <h1 className="font-display text-4xl font-extrabold text-ink-900 sm:text-5xl">
            Contact us
          </h1>
          <p className="mt-5 max-w-prose text-lg text-ink-600">
            Two people run this program, and both of them read their own email. Whether you are
            a student who wants to start a chapter, a teacher, or an administrator checking us
            out — write to either of us directly.
          </p>
        </div>
      </section>

      {/* ------------------------------------------------------ Leadership */}
      <Section>
        <SectionHeading
          eyebrow="Leadership"
          title="Co-Presidents"
          lede={`${SITE.name} international program`}
        />

        <ul className="mt-10 grid gap-6 lg:grid-cols-2">
          {LEADERSHIP.map((person) => (
            <li
              key={person.email}
              className="flex flex-col gap-5 rounded-card border border-line bg-white p-6 shadow-sm sm:flex-row sm:p-7"
            >
              <Avatar name={person.name} src={person.photo} className="h-32 w-32 sm:h-36 sm:w-36" />

              <div className="min-w-0">
                <h3 className="font-display text-xl font-extrabold text-ink-900">
                  {person.name}
                </h3>
                <p className="mt-0.5 font-semibold text-green-cta">{person.role}</p>
                <p className="mt-3 text-ink-600">{person.bio}</p>
                <a
                  href={`mailto:${person.email}`}
                  className="mt-4 inline-flex min-h-[44px] items-center gap-2 break-all font-semibold text-green-cta underline underline-offset-2 hover:text-green-800"
                >
                  <svg
                    width="17"
                    height="17"
                    viewBox="0 0 20 20"
                    fill="none"
                    aria-hidden="true"
                    className="shrink-0"
                  >
                    <rect
                      x="2.5"
                      y="4.5"
                      width="15"
                      height="11"
                      rx="2"
                      stroke="currentColor"
                      strokeWidth="1.6"
                    />
                    <path
                      d="M3 6l7 5 7-5"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  {person.email}
                </a>
              </div>
            </li>
          ))}
        </ul>
      </Section>

      {/* ---------------------------------------------------------- Book */}
      <Section tone="beige">
        <div className="rounded-card border border-beige-200 bg-white p-8 sm:p-10">
          <h2 className="font-display text-2xl font-extrabold text-ink-900 sm:text-3xl">
            Would rather just talk?
          </h2>
          <p className="mt-3 max-w-prose text-ink-600">
            Book a thirty-minute call. No form, no account, no commitment.
          </p>
          <BookACall className="mt-6" />
        </div>
      </Section>

      {/* --------------------------------------------------- Organization */}
      <Section>
        <h2 className="font-display text-2xl font-extrabold text-ink-900">
          About the organization
        </h2>
        <p className="mt-3 max-w-prose text-ink-600">
          {SITE.name} is a student-led financial literacy program of{' '}
          <a
            href={SITE.parentOrgUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-green-cta underline underline-offset-2 hover:text-green-800"
          >
            {SITE.parentOrg}
          </a>
          , a nonprofit organization. Administrators and faculty are welcome to contact us
          directly with questions about curriculum, supervision, or school policy.
        </p>
      </Section>
    </>
  )
}
