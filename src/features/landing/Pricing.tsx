import { Check } from 'lucide-react'
import { Link } from 'react-router'
import { buttonStyles } from '../../components/ui/button-styles'
import Container from '../../components/ui/Container'
import SectionHeading from '../../components/ui/SectionHeading'

const FREE_FEATURES = [
  'Unlimited flight searches',
  'Up to 5 active price alerts',
  'Email & in-app notifications',
  'Price history for tracked flights',
]

const PRO_FEATURES = [
  'More active price alerts',
  'More frequent price checks',
  'AI-powered price insights',
  'Priority support',
]

function FeatureList({ items }: { items: string[] }) {
  return (
    <ul className="mt-8 space-y-3">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-3 text-sm text-ink-muted">
          <Check className="mt-0.5 size-4 shrink-0 text-brand-600" aria-hidden="true" />
          {item}
        </li>
      ))}
    </ul>
  )
}

export default function Pricing() {
  return (
    <section id="pricing" className="border-t border-line bg-surface-muted py-20 sm:py-24">
      <Container>
        <SectionHeading
          eyebrow="Pricing"
          title="Free while we're in beta"
          description="Start tracking fares today at no cost. Paid plans will only come later, if ever needed."
        />

        <div className="mx-auto mt-14 grid max-w-4xl gap-6 md:grid-cols-2">
          <div className="relative flex flex-col rounded-2xl border-2 border-brand-600 bg-surface p-8 shadow-lg">
            <span className="absolute -top-3 left-8 rounded-full bg-brand-600 px-3 py-1 text-xs font-semibold text-white">
              Available now
            </span>
            <h3 className="text-lg font-semibold text-ink">Free</h3>
            <p className="mt-4 flex items-baseline gap-1">
              <span className="text-4xl font-bold tracking-tight text-ink">$0</span>
              <span className="text-sm text-ink-muted">/ month</span>
            </p>
            <p className="mt-2 text-sm text-ink-muted">Everything you need to get started.</p>
            <FeatureList items={FREE_FEATURES} />
            <div className="mt-auto pt-8">
              <Link to="/signup" className={buttonStyles('primary', 'md', 'w-full')}>
                Get started free
              </Link>
            </div>
          </div>

          <div className="flex flex-col rounded-2xl border border-line bg-surface p-8">
            <h3 className="text-lg font-semibold text-ink">Pro</h3>
            <p className="mt-4 flex items-baseline gap-1">
              <span className="text-4xl font-bold tracking-tight text-ink-subtle">TBA</span>
            </p>
            <p className="mt-2 text-sm text-ink-muted">Planned for the future. Not available yet.</p>
            <FeatureList items={PRO_FEATURES} />
            <div className="mt-auto pt-8">
              <button type="button" disabled className={buttonStyles('secondary', 'md', 'w-full')}>
                Coming later
              </button>
            </div>
          </div>
        </div>
      </Container>
    </section>
  )
}
