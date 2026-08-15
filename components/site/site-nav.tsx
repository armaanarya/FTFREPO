import { NavBar } from './nav-bar'

/**
 * Site chrome. There is no session to resolve — the site has no sign-in — so
 * this is a thin pass-through kept for a single import point in the layout.
 */
export function SiteNav() {
  return <NavBar />
}
