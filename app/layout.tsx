import type { Metadata } from 'next'
import { Manrope, Inter } from 'next/font/google'
import '../styles/globals.css'
import { SiteNav } from '@/components/site/site-nav'
import { SiteFooter } from '@/components/site/site-footer'
import { SITE } from '@/lib/site'

const manrope = Manrope({
  subsets: ['latin'],
  weight: ['600', '700', '800'],
  variable: '--font-manrope',
  display: 'swap',
})
const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: `${SITE.name} — financial literacy for students`,
    template: `%s — ${SITE.name}`,
  },
  description:
    'Financing the Future is a student-led financial literacy program of Valley Christian Schools. We have coached 300+ students across four countries. Start a chapter at your school.',
  icons: { icon: '/icon.svg' },
  openGraph: {
    title: SITE.name,
    description: SITE.tagline,
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${manrope.variable} ${inter.variable}`}>
      <body>
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        <SiteNav />
        {/* tabIndex={-1} so the skip link actually moves FOCUS here, not just
            the viewport — several browsers scroll without focusing otherwise. */}
        <main id="main-content" tabIndex={-1} className="focus-visible:outline-none">
          {children}
        </main>
        <SiteFooter />
      </body>
    </html>
  )
}
