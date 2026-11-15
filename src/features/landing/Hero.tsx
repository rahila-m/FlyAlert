import { Check } from 'lucide-react'
import Container from '../../components/ui/Container'
import FlightSearchForm from '../search/FlightSearchForm'
import ExampleAlertCard from './ExampleAlertCard'

const HIGHLIGHTS = ['100% free, no paid plans', 'No credit card required', 'Pause or delete alerts anytime']

export default function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* Decorative background */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,var(--color-brand-100),transparent_60%)] opacity-70"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,var(--line)_1px,transparent_1px),linear-gradient(to_bottom,var(--line)_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)] opacity-60"
      />

      <Container className="pt-14 pb-16 sm:pt-20 lg:pb-24">
        <div className="grid items-center gap-12 lg:grid-cols-[1.15fr_1fr]">
          <div className="text-center lg:text-left">
            <p className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-surface/70 px-3 py-1 text-sm font-medium text-brand-700 shadow-sm">
              <span className="size-1.5 rounded-full bg-brand-500" />
              Flight price tracking, made simple
            </p>
            <h1 className="mt-6 text-4xl font-bold tracking-tight text-ink sm:text-5xl lg:text-6xl">
              Stop checking prices.
              <span className="block text-brand-600">Let them come to you.</span>
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-ink-muted lg:mx-0">
              Track any route worldwide, set your target price, and get notified the
              moment fares drop. Then book directly with the airline or provider.
            </p>
            <ul className="mt-8 flex flex-col items-center gap-x-6 gap-y-2 text-sm text-ink-muted sm:flex-row sm:justify-center lg:justify-start">
              {HIGHLIGHTS.map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <Check className="size-4 text-emerald-600" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <ExampleAlertCard />
        </div>

        <div className="mt-14 lg:mt-16">
          <FlightSearchForm />
        </div>
      </Container>
    </section>
  )
}
