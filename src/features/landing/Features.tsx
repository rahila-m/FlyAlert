import { BellRing, ChartLine, ExternalLink, Globe, Languages, ShieldCheck } from 'lucide-react'
import Container from '../../components/ui/Container'
import SectionHeading from '../../components/ui/SectionHeading'
import { useT } from '../preferences/preferences-context'

const FEATURES = [
  { icon: BellRing, title: 'features.alerts.title', text: 'features.alerts.text' },
  { icon: ChartLine, title: 'features.history.title', text: 'features.history.text' },
  { icon: Globe, title: 'features.routes.title', text: 'features.routes.text' },
  { icon: Languages, title: 'features.currency.title', text: 'features.currency.text' },
  { icon: ShieldCheck, title: 'features.noSpam.title', text: 'features.noSpam.text' },
  { icon: ExternalLink, title: 'features.book.title', text: 'features.book.text' },
] as const

export default function Features() {
  const t = useT()
  return (
    <section id="features" className="py-20 sm:py-24">
      <Container>
        <SectionHeading
          eyebrow={t('features.eyebrow')}
          title={t('features.title')}
          description={t('features.subtitle')}
        />

        <div className="mt-14 grid gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature) => (
            <div key={feature.title} className="group bg-surface p-8 transition hover:bg-surface-muted">
              <feature.icon className="size-6 text-brand-600 transition group-hover:scale-110" aria-hidden="true" />
              <h3 className="mt-5 font-semibold text-ink">{t(feature.title)}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-muted">{t(feature.text)}</p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  )
}
