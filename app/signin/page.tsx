import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import Image from 'next/image'
import { getProfile } from '@/lib/auth'
import { isSupabaseConfigured } from '@/lib/supabase/config'
import { GoogleSignInButton } from './google-button'

export const metadata: Metadata = { title: 'Sign in' }

const ERRORS: Record<string, string> = {
  missing_code: 'Google did not return a sign-in code. Please try again.',
  exchange_failed: 'We could not complete sign-in. Please try again.',
  access_denied: 'Sign-in was cancelled.',
}

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>
}) {
  const params = await searchParams
  const profile = await getProfile()

  // Only ever accept a same-origin path.
  const rawNext = params.next ?? '/dashboard'
  const next = rawNext.startsWith('/') && !rawNext.startsWith('//') ? rawNext : '/dashboard'

  if (profile) redirect(next)

  const errorMessage = params.error
    ? (ERRORS[params.error] ?? 'Something went wrong signing in. Please try again.')
    : null

  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-4 py-20 sm:py-28">
      <Image src="/ftf-mark.svg" alt="" width={132} height={108} className="h-16 w-auto" />
      <h1 className="mt-6 text-center font-display text-3xl font-extrabold text-ink-900">
        Sign in to Financing the Future
      </h1>
      <p className="mt-3 text-center text-ink-600">
        We use your Google account so you do not have to make another password. We only read
        your name, email, and profile picture.
      </p>

      {errorMessage && (
        <p
          role="alert"
          className="mt-6 w-full rounded-ctl border border-danger bg-[var(--error-surface)] px-4 py-3 text-sm font-medium text-danger"
        >
          {errorMessage}
        </p>
      )}

      <div className="mt-8 w-full">
        {isSupabaseConfigured ? (
          <GoogleSignInButton next={next} />
        ) : (
          <div className="rounded-card border border-line-strong bg-beige-50 p-6">
            <h2 className="font-display text-base font-bold text-ink-900">
              Sign-in is not configured yet
            </h2>
            <p className="mt-2 text-sm text-ink-600">
              This deployment has no Supabase credentials set, so Google sign-in is
              unavailable. The public pages work normally. See{' '}
              <code className="rounded bg-white px-1.5 py-0.5 text-[13px]">
                docs/SUPABASE-SETUP.md
              </code>{' '}
              to finish setup.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
