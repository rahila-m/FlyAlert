import { Activity, BellRing, Search, Target } from 'lucide-react'
import Container from '../../components/ui/Container'
import SectionHeading from '../../components/ui/SectionHeading'

const STEPS = [
  {
    icon: Search,
    title: 'Search your route',
    description: 'Pick your departure and destination airports, travel dates and cabin class.',
  },
  {
    icon: Target,
    title: 'Set a target price',
    description: 'Choose the flight you like and tell us the price you would be happy to pay.',
  },
  {
    icon: Activity,
    title: 'We monitor fares',
    description: 'FlyAlert checks prices on a regular schedule and records every change.',
  },
  {
    icon: BellRing,
    title: 'Get alerted & book',
    description: 'When the price hits your target, we notify you with a link to book.',
  },
]

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="border-t border-line bg-surface-muted py-20 sm:py-24">
      <Container>
        <SectionHeading
          eyebrow="How it works"
          title="From search to savings in four steps"
          description="Set it up once. FlyAlert keeps watching so you don't have to."
        />

        <ol className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step, index) => (
            <li
              key={step.title}
              className="relative rounded-2xl border border-line bg-surface p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >
              <span className="absolute top-6 right-6 text-sm font-semibold text-ink-subtle">
                0{index + 1}
              </span>
              <span className="flex size-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                <step.icon className="size-5" aria-hidden="true" />
              </span>
              <h3 className="mt-5 font-semibold text-ink">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-muted">{step.description}</p>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  )
}
