import { BellRing, ChartLine, Coins, ExternalLink, Globe, ShieldCheck } from 'lucide-react'
import Container from '../../components/ui/Container'
import SectionHeading from '../../components/ui/SectionHeading'

const FEATURES = [
  {
    icon: BellRing,
    title: 'Target price alerts',
    description: 'Get notified in the app as soon as a fare drops to your target. Email alerts are coming soon.',
  },
  {
    icon: ChartLine,
    title: 'Price history charts',
    description: 'See how a fare has moved over time, based only on prices we actually recorded.',
  },
  {
    icon: Globe,
    title: 'Routes worldwide',
    description: 'Search flights between airports around the world, one-way or round-trip.',
  },
  {
    icon: Coins,
    title: 'Multi-currency',
    description: 'Choose your preferred currency so prices are easy to compare at a glance.',
  },
  {
    icon: ShieldCheck,
    title: 'No notification spam',
    description: "We won't alert you twice for the same price. Only changes that matter.",
  },
  {
    icon: ExternalLink,
    title: 'Book with the source',
    description: 'We never sell tickets. You book directly with the airline or booking provider.',
  },
]

export default function Features() {
  return (
    <section id="features" className="py-20 sm:py-24">
      <Container>
        <SectionHeading
          eyebrow="Features"
          title="Everything you need to catch a better fare"
          description="Simple tools that do one job well: helping you pay less for flights."
        />

        <div className="mt-14 grid gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature) => (
            <div key={feature.title} className="group bg-surface p-8 transition hover:bg-surface-muted">
              <feature.icon
                className="size-6 text-brand-600 transition group-hover:scale-110"
                aria-hidden="true"
              />
              <h3 className="mt-5 font-semibold text-ink">{feature.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-muted">{feature.description}</p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  )
}
