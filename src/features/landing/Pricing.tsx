import { Check, HeartHandshake } from 'lucide-react'
import { Link } from 'react-router'
import { buttonStyles } from '../../components/ui/button-styles'
import Container from '../../components/ui/Container'
import SectionHeading from '../../components/ui/SectionHeading'

const FEATURES = [
  'Unlimited flight searches',
  'Up to 5 active price alerts',
  'Automatic price checks',
  'In-app price drop notifications',
  'Price history for every alert',
  'No credit card, no paid plans',
]

export default function Pricing() {
  return (
    <section id="pricing" className="border-t border-line bg-surface-muted py-20 sm:py-24">
      <Container>
        <SectionHeading
          eyebrow="Pricing"
          title="Free. For everyone."
          description="FlyAlert has no paid plans and no premium tier. Every feature is free for every user."
        />

        <div className="mx-auto mt-14 max-w-xl">
          <div className="flex flex-col rounded-2xl border-2 border-brand-600 bg-surface p-8 shadow-lg">
            <div className="flex items-baseline justify-between gap-4">
              <h3 className="text-lg font-semibold text-ink">FlyAlert</h3>
              <p className="flex items-baseline gap-1">
                <span className="text-4xl font-bold tracking-tight text-ink">$0</span>
                <span className="text-sm text-ink-muted">forever</span>
              </p>
            </div>
            <ul className="mt-8 grid gap-3 sm:grid-cols-2">
              {FEATURES.map((feature) => (
                <li key={feature} className="flex items-start gap-3 text-sm text-ink-muted">
                  <Check className="mt-0.5 size-4 shrink-0 text-brand-600" aria-hidden="true" />
                  {feature}
                </li>
              ))}
            </ul>
            <Link to="/signup" className={buttonStyles('primary', 'md', 'mt-8 w-full')}>
              Get started free
            </Link>
          </div>

          {/* Being open about how a free product pays its bills builds trust. */}
          <div className="mt-6 flex gap-3 rounded-xl border border-line bg-surface p-4 text-sm text-ink-muted">
            <HeartHandshake className="mt-0.5 size-5 shrink-0 text-brand-600" aria-hidden="true" />
            <p>
              <strong className="font-semibold text-ink">How is FlyAlert free?</strong> When you book
              through our links we may earn a small commission from the booking site, at no extra cost
              to you. We may also show a few clearly marked ads. Your price never depends on either.
            </p>
          </div>
        </div>
      </Container>
    </section>
  )
}
