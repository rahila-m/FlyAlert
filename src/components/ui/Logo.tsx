import { Plane } from 'lucide-react'
import { Link } from 'react-router'

export default function Logo() {
  return (
    <Link
      to="/"
      className="flex items-center gap-2 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-600"
      aria-label="FlyAlert home"
    >
      <span className="flex size-8 items-center justify-center rounded-lg bg-brand-600 text-white shadow-sm">
        <Plane className="size-4.5" strokeWidth={2.25} aria-hidden="true" />
      </span>
      <span className="text-lg font-bold tracking-tight text-ink">
        Fly<span className="text-brand-600">Alert</span>
      </span>
    </Link>
  )
}
