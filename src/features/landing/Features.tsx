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

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature) => (
            <div
              key={feature.title}
              className="group rounded-3xl border border-line bg-surface p-7 transition duration-300 hover:-translate-y-1 hover:border-brand-200 hover:shadow-xl hover:shadow-brand-600/10"
            >
              <span className="flex size-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 transition duration-300 group-hover:bg-accent-50 group-hover:text-accent-600">
                <feature.icon className="size-6" aria-hidden="true" />
              </span>
              <h3 className="mt-5 font-bold text-ink">{t(feature.title)}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-muted">{t(feature.text)}</p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  )
}
