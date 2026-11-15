import { Plane } from 'lucide-react'
import { Link } from 'react-router'
import { useT } from '../../features/preferences/preferences-context'

export default function Logo() {
  const t = useT()
  return (
    <Link
      to="/"
      className="flex items-center gap-2 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-600"
      aria-label={t('nav.home')}
    >
      <span className="bg-sunset-deep flex size-8 items-center justify-center rounded-xl text-white shadow-md shadow-brand-600/30">
        <Plane className="size-4.5 -rotate-12" strokeWidth={2.25} aria-hidden="true" />
      </span>
      <span className="font-display text-lg font-extrabold tracking-tight text-ink">
        Fly<span className="text-brand-600">Alert</span>
      </span>
    </Link>
  )
}
