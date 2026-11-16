import { Link } from 'react-router'
import { useT } from '../../features/preferences/preferences-context'
import AirlinerShape from './AirlinerShape'

// Brand mark: a white airliner climbing towards the top-right on the sunset
// gradient, with a coral "alert" dot — flight + alert = FlyAlert.
// The same mark is in public/favicon.svg.
function LogoMark() {
  return (
    <span className="bg-sunset-deep relative inline-flex size-9 shrink-0 items-center justify-center rounded-xl text-white shadow-md shadow-brand-600/30">
      <AirlinerShape className="size-[62%] rotate-45" />
      <span className="absolute -top-0.5 -right-0.5 size-2.5 rounded-full bg-accent-500 ring-2 ring-surface" />
    </span>
  )
}

export default function Logo() {
  const t = useT()
  return (
    <Link
      to="/"
      className="flex items-center gap-2.5 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-600"
      aria-label={t('nav.home')}
    >
      <LogoMark />
      <span className="font-display text-xl font-extrabold tracking-tight text-ink">
        Fly<span className="text-brand-600">Alert</span>
      </span>
    </Link>
  )
}
