import Image from 'next/image'
import Link from 'next/link'
import { FOOTER_LINKS } from '@/lib/nav'
import { SITE } from '@/lib/site'

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-line bg-beige-50">
      <div className="mx-auto max-w-content px-4 py-14 sm:px-6">
        <div className="flex flex-col gap-10 md:flex-row md:justify-between">
          <div className="max-w-xs">
            <div className="flex items-center gap-2.5">
              <Image src="/ftf-mark.svg" alt="" width={44} height={36} className="h-9 w-auto" />
              <span className="font-display text-[15px] font-extrabold leading-[1.1] tracking-tight text-green-800">
                Financing
                <br />
                the Future
              </span>
            </div>
            <p className="mt-4 text-sm text-ink-600">{SITE.tagline}</p>
          </div>

          <div className="flex flex-col gap-10 sm:flex-row sm:gap-16">
            <nav aria-labelledby="footer-pages">
              <h2
                id="footer-pages"
                className="font-display text-xs font-bold uppercase tracking-[0.08em] text-ink-500"
              >
                Pages
              </h2>
              <ul className="mt-3 space-y-1">
                {FOOTER_LINKS.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="flex min-h-[36px] items-center text-sm text-ink-600 transition-colors duration-150 hover:text-green-800 hover:underline"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <div>
              <h2 className="font-display text-xs font-bold uppercase tracking-[0.08em] text-ink-500">
                Contact
              </h2>
              <ul className="mt-3 space-y-1">
                {/* Rendered only when the real value exists. A placeholder
                    mailto or a dead LinkedIn link is worse than no link. */}
                {SITE.linkedinUrl && (
                  <li>
                    <a
                      href={SITE.linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex min-h-[36px] items-center gap-2 text-sm text-ink-600 transition-colors duration-150 hover:text-green-800 hover:underline"
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                        <path d="M6.94 5a2 2 0 1 1-4-.002 2 2 0 0 1 4 .002zM7 8.48H3V21h4V8.48zm6.32 0H9.34V21h3.94v-6.57c0-3.66 4.77-4 4.77 0V21H22v-7.93c0-6.17-7.06-5.94-8.72-2.91l.04-1.68z" />
                      </svg>
                      LinkedIn
                    </a>
                  </li>
                )}
                {SITE.contactEmail && (
                  <li>
                    <a
                      href={`mailto:${SITE.contactEmail}`}
                      className="flex min-h-[36px] items-center text-sm text-ink-600 transition-colors duration-150 hover:text-green-800 hover:underline"
                    >
                      {SITE.contactEmail}
                    </a>
                  </li>
                )}
                <li>
                  <a
                    href={SITE.parentOrgUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex min-h-[36px] items-center text-sm text-ink-600 transition-colors duration-150 hover:text-green-800 hover:underline"
                  >
                    {SITE.parentOrg}
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Nonprofit disclosure */}
        <div className="mt-12 border-t border-beige-200 pt-6">
          <p className="max-w-prose text-xs leading-relaxed text-ink-500">
            {SITE.name} is a student-led financial literacy program of {SITE.parentOrg}, a
            nonprofit organization. We teach foundational financial skills for educational
            purposes only. Nothing we publish or teach is investment, tax, or legal advice.
          </p>
          <p className="mt-4 text-xs text-ink-500">
            © {new Date().getFullYear()} {SITE.name}. A program of {SITE.parentOrg}.
          </p>
        </div>
      </div>
    </footer>
  )
}
