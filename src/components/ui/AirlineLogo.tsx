import { useState } from 'react'

// Airline logos from the Travelpayouts / Aviasales logo CDN (pics.avs.io),
// which Travelpayouts provides to its partners for showing flight results.
// Logos are trademarks of their airlines; we only show them next to that
// airline's real fares or name. If there's no code or the image fails, we
// fall back to a colored badge with the airline's initials.

const LOGO_HOST = 'https://pics.avs.io'

const FALLBACK_COLORS = ['bg-sky-600', 'bg-indigo-600', 'bg-emerald-600', 'bg-amber-600', 'bg-rose-600', 'bg-violet-600']

const SIZES = {
  sm: { box: 'size-5 rounded', px: 40, text: 'text-[8px]' },
  md: { box: 'size-9 rounded-lg', px: 72, text: 'text-xs' },
  lg: { box: 'size-11 rounded-xl', px: 88, text: 'text-sm' },
} as const

function airlineLogoUrl(code: string, px: number): string {
  // @2x = double resolution, so the logo stays sharp on high-density screens.
  return `${LOGO_HOST}/al_square/${px}/${px}/${encodeURIComponent(code)}@2x.png`
}

export default function AirlineLogo({
  name,
  code,
  size = 'md',
}: {
  name: string
  code: string | null
  size?: keyof typeof SIZES
}) {
  const [failed, setFailed] = useState(false)
  const { box, px, text } = SIZES[size]
  const validCode = code && /^[A-Z0-9]{2}$/.test(code) ? code : null

  if (validCode && !failed) {
    return (
      <img
        src={airlineLogoUrl(validCode, px / 2)}
        alt=""
        width={px / 2}
        height={px / 2}
        loading="lazy"
        decoding="async"
        onError={() => setFailed(true)}
        className={`${box} shrink-0 bg-white object-contain ring-1 ring-line`}
      />
    )
  }

  const initials = (validCode ?? name.split(' ').map((word) => word[0]).join('')).slice(0, 2).toUpperCase()
  const hash = [...name].reduce((sum, char) => sum + char.charCodeAt(0), 0)
  return (
    <span
      aria-hidden="true"
      className={`${box} ${text} flex shrink-0 items-center justify-center font-bold text-white ${FALLBACK_COLORS[hash % FALLBACK_COLORS.length]}`}
    >
      {initials}
    </span>
  )
}
