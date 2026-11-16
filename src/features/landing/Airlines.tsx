import { Globe2, Info } from 'lucide-react'
import AirlineLogo from '../../components/ui/AirlineLogo'
import Container from '../../components/ui/Container'
import SectionHeading from '../../components/ui/SectionHeading'
import { useT } from '../preferences/preferences-context'

// Example airlines that appeared in real FlyAlert search results (Nov 2026).
// Logos come from the Travelpayouts/Aviasales logo CDN (see AirlineLogo).
const EXAMPLE_AIRLINES = [
  { name: 'Turkish Airlines', code: 'TK' },
  { name: 'Pegasus Airlines', code: 'PC' },
  { name: 'AJet', code: 'VF' },
  { name: 'SunExpress', code: 'XQ' },
  { name: 'Azerbaijan Airlines (AZAL)', code: 'J2' },
  { name: 'Uzbekistan Airways', code: 'HY' },
  { name: 'Air Serbia', code: 'JU' },
  { name: 'LOT Polish Airlines', code: 'LO' },
  { name: 'British Airways', code: 'BA' },
  { name: 'Air France', code: 'AF' },
  { name: 'Wizz Air', code: 'W6' },
  { name: 'Ryanair', code: 'FR' },
  { name: 'Vueling', code: 'VY' },
]

export default function Airlines() {
  const t = useT()
  return (
    <section id="airlines" className="border-t border-line bg-surface-muted py-20 sm:py-24">
      <Container>
        <SectionHeading
          eyebrow={t('airlines.eyebrow')}
          title={t('airlines.title')}
          description={t('airlines.subtitle')}
        />

        <ul className="mx-auto mt-12 flex max-w-4xl flex-wrap justify-center gap-2.5">
          {EXAMPLE_AIRLINES.map((airline) => (
            <li
              key={airline.code}
              className="flex items-center gap-2.5 rounded-full border border-line bg-surface py-1.5 pr-4 pl-1.5 text-sm font-semibold text-ink shadow-sm transition hover:-translate-y-0.5 hover:border-brand-200 hover:text-brand-700 hover:shadow-md"
            >
              <AirlineLogo name={airline.name} code={airline.code} size="md" />
              {airline.name}
            </li>
          ))}
          <li className="flex items-center gap-1.5 rounded-full border border-dashed border-line px-4 py-2 text-sm text-ink-muted">
            <Globe2 className="size-4" aria-hidden="true" />
            {t('airlines.more')}
          </li>
        </ul>

        {/* Honest about what the data covers. */}
        <p className="mx-auto mt-8 flex max-w-2xl items-start justify-center gap-2 text-center text-sm text-ink-subtle">
          <Info className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          {t('airlines.note')}
        </p>
      </Container>
    </section>
  )
}
