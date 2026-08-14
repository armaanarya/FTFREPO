import { getPublishedPartners } from '@/lib/data'
import { Section, SectionHeading } from '@/components/ui/section'

/**
 * Global Spotlight.
 *
 * There is no seed data behind this and there never should be. Until the team
 * publishes real chapter leaders, the section renders a written explanation
 * rather than skeleton cards or invented people.
 */
export async function PartnerSpotlight() {
  const partners = await getPublishedPartners()

  return (
    <Section id="spotlight" tone="beige">
      <SectionHeading
        eyebrow="Global spotlight"
        title="The people running chapters"
        lede="Financing the Future is led by students. These are the people teaching in their own schools and communities."
      />

      {partners.length === 0 ? (
        <div className="mt-10 rounded-card border border-beige-200 bg-white p-8 sm:p-10">
          <h3 className="font-display text-xl font-bold text-ink-900">
            Chapter leader profiles are being added
          </h3>
          <p className="mt-3 max-w-prose text-ink-600">
            We are collecting photos, bios, and permission from each of our chapter leaders
            before publishing them here. Rather than show placeholder profiles, we would
            rather show you nothing until the real ones are ready.
          </p>
          <p className="mt-3 max-w-prose text-ink-600">
            In the meantime, our chapters run across the United States, Singapore, Vietnam,
            and Spain — and our team can tell you about any of them on an intro call.
          </p>
        </div>
      ) : (
        <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {partners.map((partner) => (
            <li
              key={partner.id}
              className="flex flex-col overflow-hidden rounded-card border border-beige-200 bg-white shadow-sm"
            >
              {partner.photo_url && (
                // eslint-disable-next-line @next/next/no-img-element -- admin-entered
                // remote URLs across arbitrary hosts; next/image optimization would
                // need an allowlist we cannot know ahead of time.
                <img
                  src={partner.photo_url}
                  alt={`${partner.name}, chapter leader in ${partner.location}`}
                  width={400}
                  height={300}
                  loading="lazy"
                  className="aspect-[4/3] w-full object-cover"
                />
              )}
              <div className="flex flex-1 flex-col p-6">
                <h3 className="font-display text-lg font-bold text-ink-900">{partner.name}</h3>
                <p className="mt-1 text-sm font-medium text-green-cta">
                  {partner.location}
                  <span className="text-ink-500"> · {partner.country}</span>
                </p>
                <p className="mt-3 text-sm text-ink-600">{partner.bio}</p>

                {partner.quote && (
                  <blockquote className="mt-4 border-l-[3px] border-green-cta pl-4 text-sm italic text-ink-700">
                    {partner.quote}
                  </blockquote>
                )}

                {partner.chapter_stats && (
                  <p className="mt-auto pt-4 text-sm font-semibold text-ink-900">
                    {partner.chapter_stats}
                  </p>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </Section>
  )
}
