import { Activity, BellRing, Search, Target } from 'lucide-react'
import Container from '../../components/ui/Container'
import SectionHeading from '../../components/ui/SectionHeading'
import { useT } from '../preferences/preferences-context'

const STEPS = [
  { icon: Search, title: 'how.step1.title', text: 'how.step1.text' },
  { icon: Target, title: 'how.step2.title', text: 'how.step2.text' },
  { icon: Activity, title: 'how.step3.title', text: 'how.step3.text' },
  { icon: BellRing, title: 'how.step4.title', text: 'how.step4.text' },
] as const

export default function HowItWorks() {
  const t = useT()
  return (
    <section id="how-it-works" className="border-t border-line bg-surface-muted py-20 sm:py-24">
      <Container>
        <SectionHeading eyebrow={t('how.eyebrow')} title={t('how.title')} description={t('how.subtitle')} />

        <ol className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step, index) => (
            <li
              key={step.title}
              className="group relative overflow-hidden rounded-3xl border border-line bg-surface p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-brand-200 hover:shadow-xl hover:shadow-brand-600/10"
            >
              <span className="font-display absolute -top-3 -right-1 text-7xl font-extrabold text-surface-muted transition group-hover:text-brand-50" aria-hidden="true">
                {index + 1}
              </span>
              <span className="bg-sunset-deep relative flex size-12 items-center justify-center rounded-2xl text-white shadow-lg shadow-brand-600/25">
                <step.icon className="size-5" aria-hidden="true" />
              </span>
              <h3 className="relative mt-5 font-bold text-ink">{t(step.title)}</h3>
              <p className="relative mt-2 text-sm leading-relaxed text-ink-muted">{t(step.text)}</p>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  )
}
