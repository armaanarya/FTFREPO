'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'

/**
 * Portrait with an initials fallback.
 *
 * If the image file is absent or fails to load we render the person's initials
 * rather than a broken image or a stock photo. Showing a stranger's face where
 * a real person belongs would be worse than showing nothing.
 */
export function Avatar({
  name,
  src,
  className,
}: {
  name: string
  src: string | null
  className?: string
}) {
  const [failed, setFailed] = useState(false)

  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')

  const shell = cn(
    'relative flex shrink-0 items-center justify-center overflow-hidden rounded-card border border-beige-200 bg-beige-100',
    className,
  )

  if (!src || failed) {
    return (
      <div className={shell}>
        {/* aria-hidden: the name is always rendered as text next to this. */}
        <span aria-hidden="true" className="font-display text-2xl font-extrabold text-green-800">
          {initials}
        </span>
      </div>
    )
  }

  return (
    <div className={shell}>
      {/* eslint-disable-next-line @next/next/no-img-element -- needs an onError
          fallback, which next/image does not expose. */}
      <img
        src={src}
        alt={`${name}, portrait`}
        onError={() => setFailed(true)}
        loading="lazy"
        className="h-full w-full object-cover object-top"
      />
    </div>
  )
}
