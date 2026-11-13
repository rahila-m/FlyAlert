import { Link } from 'react-router'
import { buttonStyles } from '../components/ui/button-styles'

// Placeholder for pages that are planned but not built yet (e.g. auth in Phase 3).
export default function ComingSoonPage({
  title,
  description,
}: {
  title: string
  description: string
}) {
  return (
    <section className="flex flex-1 flex-col items-center justify-center px-6 py-24 text-center">
      <p className="text-sm font-semibold uppercase tracking-wider text-brand-600">
        Coming soon
      </p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight text-ink">{title}</h1>
      <p className="mt-3 max-w-md text-ink-muted">{description}</p>
      <Link to="/" className={buttonStyles('primary', 'md', 'mt-8')}>
        Back to home
      </Link>
    </section>
  )
}
