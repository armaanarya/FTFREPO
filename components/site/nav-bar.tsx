'use client'

import { useCallback, useEffect, useId, useRef, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { NAV, type NavGroup } from '@/lib/nav'
import type { Profile } from '@/lib/types'
import { cn } from '@/lib/utils'

/**
 * Static top navigation.
 *
 * Deliberately NOT animated: fixed 64px height, square corners, no scroll-driven
 * resize, no transform on scroll, no entrance motion. It reads as dashboard
 * chrome rather than a marketing header, which is what the brand calls for.
 * The only transitions are 150ms color changes on hover/focus, which convey
 * state rather than decorate.
 *
 * Keyboard model for the dropdowns (APG disclosure-with-menu pattern):
 *   Enter / Space / ArrowDown  open the menu and focus its first item
 *   ArrowUp                    open the menu and focus its last item
 *   ArrowDown / ArrowUp        move between items, wrapping
 *   Home / End                 first / last item
 *   Escape                     close and return focus to the trigger
 *   Tab                        close and let focus leave naturally
 * Hover opens the menu too, but hover is never the only way in.
 */
export function NavBar({ profile }: { profile: Profile | null }) {
  const pathname = usePathname()
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const [mobileOpen, setMobileOpen] = useState(false)
  const navRef = useRef<HTMLElement>(null)
  const triggerRefs = useRef<(HTMLButtonElement | null)[]>([])
  const menuRefs = useRef<(HTMLDivElement | null)[]>([])
  const mobileToggleRef = useRef<HTMLButtonElement>(null)
  const baseId = useId()

  const close = useCallback(() => setOpenIndex(null), [])

  // Close everything when the route changes — otherwise a menu stays open over
  // the new page after following one of its own links.
  useEffect(() => {
    setOpenIndex(null)
    setMobileOpen(false)
  }, [pathname])

  // Escape closes the mobile menu and returns focus to the toggle, so a keyboard
  // user is not stranded inside an open panel.
  useEffect(() => {
    if (!mobileOpen) return
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setMobileOpen(false)
        mobileToggleRef.current?.focus()
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [mobileOpen])

  // Click outside closes the dropdown.
  useEffect(() => {
    if (openIndex === null) return
    function onPointerDown(event: PointerEvent) {
      if (!navRef.current?.contains(event.target as Node)) close()
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [openIndex, close])

  /** Move focus within an open menu. */
  function focusItem(groupIndex: number, itemIndex: number) {
    const items = menuRefs.current[groupIndex]?.querySelectorAll<HTMLAnchorElement>('[data-menu-item]')
    if (!items?.length) return
    const wrapped = (itemIndex + items.length) % items.length
    items[wrapped]?.focus()
  }

  function onTriggerKeyDown(event: React.KeyboardEvent, index: number) {
    switch (event.key) {
      case 'Enter':
      case ' ':
        event.preventDefault()
        setOpenIndex(openIndex === index ? null : index)
        if (openIndex !== index) requestAnimationFrame(() => focusItem(index, 0))
        break
      case 'ArrowDown':
        event.preventDefault()
        setOpenIndex(index)
        requestAnimationFrame(() => focusItem(index, 0))
        break
      case 'ArrowUp':
        event.preventDefault()
        setOpenIndex(index)
        requestAnimationFrame(() => focusItem(index, -1))
        break
      case 'Escape':
        close()
        break
    }
  }

  function onMenuKeyDown(event: React.KeyboardEvent, groupIndex: number) {
    const items = menuRefs.current[groupIndex]?.querySelectorAll<HTMLAnchorElement>('[data-menu-item]')
    if (!items?.length) return
    const current = Array.from(items).indexOf(document.activeElement as HTMLAnchorElement)

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault()
        focusItem(groupIndex, current + 1)
        break
      case 'ArrowUp':
        event.preventDefault()
        focusItem(groupIndex, current - 1)
        break
      case 'Home':
        event.preventDefault()
        focusItem(groupIndex, 0)
        break
      case 'End':
        event.preventDefault()
        focusItem(groupIndex, items.length - 1)
        break
      case 'Escape':
        event.preventDefault()
        close()
        triggerRefs.current[groupIndex]?.focus()
        break
      case 'Tab':
        // Let Tab do its normal thing, but don't leave an orphaned open menu.
        close()
        break
    }
  }

  /** A nav target is current when the pathname matches, ignoring any hash. */
  function isCurrent(href?: string) {
    if (!href) return false
    const path = href.split('#')[0]
    if (path === '' || path === '/') return pathname === '/' && !href.includes('#')
    return pathname === path || pathname.startsWith(path + '/')
  }

  function groupContainsCurrent(group: NavGroup) {
    if (group.href) return isCurrent(group.href)
    return group.items?.some((item) => isCurrent(item.href)) ?? false
  }

  return (
    <header
      ref={navRef}
      className="sticky top-0 z-50 border-b border-line bg-white"
      style={{ height: 'var(--nav-h)' }}
    >
      <nav aria-label="Main" className="mx-auto flex h-full max-w-content items-stretch gap-1 px-4 sm:px-6">
        {/* Brand */}
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2.5 pr-3 sm:pr-6"
          aria-label="Financing the Future — home"
        >
          <Image
            src="/ftf-mark.svg"
            alt=""
            width={40}
            height={33}
            priority
            className="h-[26px] w-auto sm:h-[30px]"
          />
          {/* Always visible. Hiding the wordmark on small screens left the chrome
              with nothing but an unlabelled coin icon — a visitor arriving from a
              shared link had no way to see whose site this is. */}
          <span className="font-display text-[13px] font-extrabold leading-[1.1] tracking-tight text-green-800 sm:text-[15px]">
            Financing
            <br />
            the Future
          </span>
        </Link>

        {/* Desktop links */}
        <ul className="ml-auto hidden items-stretch lg:flex">
          {NAV.map((group, index) => {
            const menuId = `${baseId}-menu-${index}`
            const triggerId = `${baseId}-trigger-${index}`
            const current = groupContainsCurrent(group)

            if (!group.items) {
              return (
                <li key={group.label} className="flex items-stretch">
                  <Link
                    href={group.href!}
                    aria-current={current ? 'page' : undefined}
                    className={cn(
                      'flex items-center border-b-[3px] px-4 text-[15px] transition-colors duration-150',
                      current
                        ? 'border-green-cta font-semibold text-green-800'
                        : 'border-transparent font-medium text-ink-600 hover:border-line-strong hover:text-ink-900',
                    )}
                  >
                    {group.label}
                  </Link>
                </li>
              )
            }

            const isOpen = openIndex === index

            return (
              <li
                key={group.label}
                className="relative flex items-stretch"
                onMouseEnter={() => setOpenIndex(index)}
                onMouseLeave={close}
              >
                <button
                  type="button"
                  id={triggerId}
                  ref={(el) => {
                    triggerRefs.current[index] = el
                  }}
                  aria-expanded={isOpen}
                  // No aria-haspopup: this is a disclosure containing a list of
                  // links, not a role="menu" with menuitems. Claiming "menu"
                  // makes a screen reader announce semantics the panel does not
                  // actually implement (WCAG 4.1.2).
                  aria-controls={menuId}
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  onKeyDown={(e) => onTriggerKeyDown(e, index)}
                  className={cn(
                    'flex items-center gap-1.5 border-b-[3px] px-4 text-[15px] transition-colors duration-150',
                    current
                      ? 'border-green-cta font-semibold text-green-800'
                      : 'border-transparent font-medium text-ink-600 hover:text-ink-900',
                    isOpen && !current && 'border-line-strong text-ink-900',
                  )}
                >
                  {group.label}
                  {/* Static chevron — rotating it would be motion the brief rules out. */}
                  <svg
                    width="10"
                    height="6"
                    viewBox="0 0 10 6"
                    fill="none"
                    aria-hidden="true"
                    className="shrink-0"
                  >
                    <path
                      d="M1 1L5 5L9 1"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>

                {isOpen && (
                  <div
                    id={menuId}
                    ref={(el) => {
                      menuRefs.current[index] = el
                    }}
                    aria-labelledby={triggerId}
                    onKeyDown={(e) => onMenuKeyDown(e, index)}
                    // Square panel, hard border, no radius, no entrance animation —
                    // it should read as a continuation of the bar, not a popover.
                    className="absolute left-0 top-full w-[320px] border border-line bg-white shadow-lg"
                  >
                    <ul className="py-1">
                      {group.items.map((item) => (
                        <li key={item.href}>
                          <Link
                            href={item.href}
                            data-menu-item
                            aria-current={isCurrent(item.href) ? 'page' : undefined}
                            onClick={close}
                            className="block border-l-[3px] border-transparent px-4 py-2.5 transition-colors duration-150 hover:border-green-cta hover:bg-green-50 focus-visible:border-green-cta focus-visible:bg-green-50 aria-[current=page]:border-green-cta aria-[current=page]:bg-green-50"
                          >
                            <span className="block text-[14px] font-semibold text-ink-900">
                              {item.label}
                            </span>
                            {item.description && (
                              <span className="mt-0.5 block text-[13px] leading-snug text-ink-500">
                                {item.description}
                              </span>
                            )}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </li>
            )
          })}
        </ul>

        {/* Account / CTA */}
        <div className="ml-auto flex items-center gap-2 lg:ml-4">
          {profile ? (
            <>
              <span className="hidden max-w-[180px] truncate text-sm text-ink-500 xl:block">
                {profile.full_name ?? profile.email}
              </span>
              <form action="/auth/signout" method="post">
                <button
                  type="submit"
                  className="flex h-10 items-center rounded-ctl border border-line-strong px-4 text-sm font-semibold text-ink-700 transition-colors duration-150 hover:bg-beige-50"
                >
                  Sign out
                </button>
              </form>
            </>
          ) : (
            <Link
              href="/apply"
              className="on-green hidden h-10 items-center rounded-ctl bg-green-cta px-4 text-sm font-semibold text-white transition-colors duration-150 hover:bg-green-800 sm:flex"
            >
              Start a chapter
            </Link>
          )}

          {/* Mobile toggle */}
          <button
            type="button"
            ref={mobileToggleRef}
            onClick={() => setMobileOpen((v) => !v)}
            aria-expanded={mobileOpen}
            aria-controls={`${baseId}-mobile`}
            className="flex h-11 w-11 items-center justify-center rounded-ctl border border-line-strong text-ink-700 lg:hidden"
          >
            <span className="sr-only">{mobileOpen ? 'Close menu' : 'Open menu'}</span>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              {mobileOpen ? (
                <path
                  d="M4 4l12 12M16 4L4 16"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              ) : (
                <path
                  d="M3 5h14M3 10h14M3 15h14"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              )}
            </svg>
          </button>
        </div>
      </nav>

      {/* Mobile panel — a plain disclosure. Every group is expanded; there is no
          hover dependency and no nested menu to trap a screen reader in. */}
      {mobileOpen && (
        <div
          id={`${baseId}-mobile`}
          className="max-h-[calc(100vh-var(--nav-h))] overflow-y-auto border-b border-line bg-white lg:hidden"
        >
          <ul className="px-4 py-2 sm:px-6">
            {NAV.map((group) => (
              <li key={group.label} className="border-b border-line py-2 last:border-b-0">
                {group.href ? (
                  <Link
                    href={group.href}
                    aria-current={isCurrent(group.href) ? 'page' : undefined}
                    className="flex min-h-[44px] items-center font-display text-[15px] font-bold text-ink-900 aria-[current=page]:text-green-800"
                  >
                    {group.label}
                  </Link>
                ) : (
                  <>
                    <p className="py-1.5 font-display text-xs font-bold uppercase tracking-[0.08em] text-ink-500">
                      {group.label}
                    </p>
                    <ul>
                      {group.items!.map((item) => (
                        <li key={item.href}>
                          <Link
                            href={item.href}
                            aria-current={isCurrent(item.href) ? 'page' : undefined}
                            className="flex min-h-[44px] items-center text-[15px] font-medium text-ink-700 aria-[current=page]:font-semibold aria-[current=page]:text-green-800"
                          >
                            {item.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </li>
            ))}
          </ul>
          {!profile && (
            <div className="px-4 pb-4 sm:px-6">
              <Link
                href="/apply"
                className="on-green flex min-h-[44px] items-center justify-center rounded-ctl bg-green-cta px-4 font-semibold text-white"
              >
                Start a chapter
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  )
}
