import type { Metadata } from 'next'
import { Section, SectionHeading } from '@/components/ui/section'
import { Avatar } from '@/components/ui/avatar'
import { BookACall } from '@/components/ui/calendly'
import { CHAPTERS } from '@/lib/people'
import { COUNTRIES } from '@/lib/site'

export const metadata: Metadata = {
  title: 'Chapter officers',
  description:
    'Every Financing the Future chapter and the students who lead it.',
}

export default function OfficersPage() {
  return (
    <>
      <section className="border-b border-line bg-white px-4 py-16 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-content">
          <h1 className="font-display text-4xl font-extrabold text-ink-900 sm:text-5xl">
            Chapter officers
          </h1>
          <p className="mt-5 max-w-prose text-lg text-ink-600">
            Every Financing the Future chapter is run by students. This page will list each
            chapter and the officers who lead it, so you can see exactly who is teaching where.
          </p>
        </div>
      </section>

      <Section>
        {CHAPTERS.length === 0 ? (
          /* Honest empty state. No sample chapters and no invented officers —
             real students go here once they have confirmed and agreed to appear. */
          <div className="rounded-card border border-line bg-beige-50 p-8 sm:p-10">
            <h2 className="font-display text-2xl font-extrabold text-ink-900">
              This directory is being built
            </h2>
            <p className="mt-4 max-w-prose text-ink-600">
              We are collecting names, roles, and permission from the officers of each chapter
              before publishing them here. Rather than fill this page with example entries, we
              would rather leave it empty until the real ones are ready.
            </p>
            <p className="mt-3 max-w-prose text-ink-600">
              Our chapters currently run across {COUNTRIES.slice(0, -1).join(', ')}, and{' '}
              {COUNTRIES[COUNTRIES.length - 1]}. If you want to know about a specific chapter
              before this page is live, ask us on a call and we will tell you about it.
            </p>
            <BookACall className="mt-7" size="md" showNote={false} />
          </div>
        ) : (
          <div className="space-y-14">
            {CHAPTERS.map((chapter) => (
              <section key={chapter.slug} aria-labelledby={`chapter-${chapter.slug}`}>
                <SectionHeading
                  id={`chapter-${chapter.slug}`}
                  eyebrow={`${chapter.location} · ${chapter.country}`}
                  title={chapter.name}
                  lede={chapter.foundedYear ? `Founded ${chapter.foundedYear}` : undefined}
                />

                {chapter.officers.length === 0 ? (
                  <p className="mt-6 rounded-card border border-dashed border-line-strong bg-beige-50 p-6 text-ink-600">
                    Officers for this chapter have not been published yet.
                  </p>
                ) : (
                  <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {chapter.officers.map((officer) => (
                      <li
                        key={`${chapter.slug}-${officer.name}`}
                        className="flex gap-4 rounded-card border border-line bg-white p-5 shadow-sm"
                      >
                        <Avatar
                          name={officer.name}
                          src={officer.photo ?? null}
                          className="h-20 w-20"
                        />
                        <div className="min-w-0">
                          <h3 className="font-display text-base font-bold text-ink-900">
                            {officer.name}
                          </h3>
                          <p className="mt-0.5 text-sm font-semibold text-green-cta">
                            {officer.role}
                          </p>
                          {officer.email && (
                            <a
                              href={`mailto:${officer.email}`}
                              className="mt-2 inline-flex min-h-[36px] items-center break-all text-sm text-ink-600 underline underline-offset-2 hover:text-green-800"
                            >
                              {officer.email}
                            </a>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            ))}
          </div>
        )}
      </Section>

      <Section tone="beige">
        <div className="rounded-card border border-beige-200 bg-white p-8 sm:p-10">
          <h2 className="font-display text-2xl font-extrabold text-ink-900 sm:text-3xl">
            Want your chapter listed here?
          </h2>
          <p className="mt-3 max-w-prose text-ink-600">
            Start one. Book a call and we will walk you through what running a chapter looks
            like at your school.
          </p>
          <BookACall className="mt-6" />
        </div>
      </Section>
    </>
  )
}
