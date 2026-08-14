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
        <main id="main-content">{children}</main>
        <SiteFooter />
      </body>
    </html>
  )
}
