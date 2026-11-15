import { Globe2, Info } from 'lucide-react'
import Container from '../../components/ui/Container'
import SectionHeading from '../../components/ui/SectionHeading'

// Example airlines that appeared in real FlyAlert search results (Nov 2026).
// Names only, no logos: airline logos are trademarks of their owners.
const EXAMPLE_AIRLINES = [
  'Turkish Airlines',
  'Pegasus Airlines',
  'AJet',
  'SunExpress',
  'Azerbaijan Airlines (AZAL)',
  'Uzbekistan Airways',
  'Air Serbia',
  'LOT Polish Airlines',
  'British Airways',
  'Air France',
  'Wizz Air',
  'Ryanair',
  'Vueling',
]

export default function Airlines() {
  return (
    <section id="airlines" className="border-t border-line bg-surface-muted py-20 sm:py-24">
      <Container>
        <SectionHeading
          eyebrow="Airlines"
          title="Fares from airlines around the world"
          description="Full-service and low-cost carriers, on routes across Europe, the Middle East, Asia and the Americas."
        />

        <ul className="mx-auto mt-12 flex max-w-4xl flex-wrap justify-center gap-2.5">
          {EXAMPLE_AIRLINES.map((airline) => (
            <li
              key={airline}
              className="rounded-full border border-line bg-surface px-4 py-2 text-sm font-medium text-ink shadow-sm"
            >
              {airline}
            </li>
          ))}
          <li className="flex items-center gap-1.5 rounded-full border border-dashed border-line px-4 py-2 text-sm text-ink-muted">
            <Globe2 className="size-4" aria-hidden="true" />
            and many more
          </li>
        </ul>

        {/* Honest about what the data covers. */}
        <p className="mx-auto mt-8 flex max-w-2xl items-start justify-center gap-2 text-center text-sm text-ink-subtle">
          <Info className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          FlyAlert shows the cheapest fares travelers have recently found for each route and date, so
          the airlines you see depend on the route.
        </p>
      </Container>
    </section>
  )
}
