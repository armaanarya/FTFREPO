import type { Metadata } from 'next'
import { Section, SectionHeading } from '@/components/ui/section'
import { BookACall, SchedulingNote } from '@/components/ui/calendly'
import { SignUpFormButton } from '@/components/ui/signup-form-button'
import { FOUNDER_EXPECTATIONS, PROGRAM_FORMATS, WHAT_WE_PROVIDE } from '@/lib/program'

export const metadata: Metadata = {
  title: 'Get started',
  description:
    'What running a Financing the Future chapter involves, the two program formats, what we ask of you, and what we provide.',
}

export default function GetStartedPage() {
  return (
    <>
      <section className="border-b border-line bg-white px-4 py-16 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-content">
          <h1 className="max-w-prose font-display text-4xl font-extrabold text-ink-900 sm:text-5xl">
            Start a chapter
          </h1>
          <p className="mt-5 max-w-prose text-lg text-ink-600">
            There is no application form and no account to make. Book a call, and we will work
            through the whole thing together. Everything below is what we will cover — reading
            it first means we can spend the call planning instead of explaining.
          </p>
          <div className="mt-8 flex flex-wrap items-start gap-3">
            <BookACall showNote={false} />
            <SignUpFormButton showFallback={false} />
          </div>
          <SchedulingNote className="mt-5" />
        </div>
      </section>

      {/* ------------------------------------------------ Program formats */}
      <Section id="formats">
        <SectionHeading
          eyebrow="Choose one"
          title="Two ways to run your chapter"
          lede="You pick the format that fits your school and your schedule. Both use the same curriculum and both are fully supported — one is not a lesser version of the other."
        />

        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          {PROGRAM_FORMATS.map((format) => (
            <div
              key={format.id}
              className="flex flex-col rounded-card border border-line bg-white p-7 shadow-sm"
            >
              <p className="font-display text-xs font-bold uppercase tracking-[0.1em] text-green-cta">
                {format.shape}
              </p>
              <h3 className="mt-2 font-display text-2xl font-extrabold text-ink-900">
                {format.name}
              </h3>
              <p className="mt-4 text-ink-600">{format.body}</p>
              <p className="mt-auto pt-5 text-sm font-semibold text-ink-900">{format.bestFor}</p>
            </div>
          ))}
        </div>

        <p className="mt-6 max-w-prose text-ink-600">
          Not sure which one fits? That is exactly what the call is for — most founders decide
          on it with us rather than before.
        </p>
      </Section>

      {/* --------------------------------------------------- Expectations */}
      <Section id="what-we-ask" tone="beige">
        <SectionHeading
          eyebrow="What we ask of you"
          title="Four things to work out before your call"
          lede="None of these need a final answer before you book. Come with rough thinking and we will sharpen it together — but the more you have thought about them, the further we get in one conversation."
        />

        <ol className="mt-10 grid gap-5 sm:grid-cols-2">
          {FOUNDER_EXPECTATIONS.map((item, index) => (
            <li
              key={item.title}
              className="rounded-card border border-beige-200 bg-white p-6 shadow-sm"
            >
              <span
                aria-hidden="true"
                className="flex h-10 w-10 items-center justify-center rounded-chip bg-green-100 font-display text-lg font-extrabold text-green-800"
              >
                {index + 1}
              </span>
              <h3 className="mt-4 font-display text-lg font-bold text-ink-900">
                <span className="sr-only">Step {index + 1}: </span>
                {item.title}
              </h3>
              <p className="mt-2 text-ink-600">{item.body}</p>
            </li>
          ))}
        </ol>
      </Section>

      {/* ------------------------------------------------- What we provide */}
      <Section id="what-we-provide">
        <SectionHeading
          eyebrow="What we provide"
          title="You are not doing this alone"
          lede="Every chapter gets all of this. There is no tier system and nothing is held back."
        />

        <ul className="mt-10 grid gap-5 sm:grid-cols-2">
          {WHAT_WE_PROVIDE.map((item) => (
            <li
              key={item.title}
              className="flex gap-3.5 rounded-card border border-line bg-white p-6 shadow-sm"
            >
              <svg
                width="22"
                height="22"
                viewBox="0 0 20 20"
                fill="none"
                aria-hidden="true"
                className="mt-0.5 shrink-0 text-green-cta"
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
              <div>
                <h3 className="font-display text-lg font-bold text-ink-900">{item.title}</h3>
                <p className="mt-1.5 text-ink-600">{item.body}</p>
              </div>
            </li>
          ))}
        </ul>
      </Section>

      {/* ------------------------------------------------------ Book again */}
      <Section tone="beige">
        <div className="rounded-card border border-beige-200 bg-white p-8 sm:p-10">
          <h2 className="font-display text-2xl font-extrabold text-ink-900 sm:text-3xl">
            Ready when you are
          </h2>
          <p className="mt-3 max-w-prose text-ink-600">
            The call is about thirty minutes. Bring questions — including the sceptical ones.
          </p>
          <BookACall className="mt-6" />
        </div>
      </Section>
    </>
  )
}
