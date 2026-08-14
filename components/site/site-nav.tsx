import { getProfile } from '@/lib/auth'
import { NavBar } from './nav-bar'

/**
 * Server wrapper: resolves the session once per request and hands the plain
 * profile to the client nav. Keeping the fetch here means the nav never renders
 * a signed-out state and then flips, which would be a layout shift on every page.
 */
export async function SiteNav() {
  const profile = await getProfile()
  return <NavBar profile={profile} />
}
