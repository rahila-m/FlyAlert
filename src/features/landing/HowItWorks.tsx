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
              className="relative rounded-2xl border border-line bg-surface p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >
              <span className="absolute top-6 right-6 text-sm font-semibold text-ink-subtle">0{index + 1}</span>
              <span className="flex size-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                <step.icon className="size-5" aria-hidden="true" />
              </span>
              <h3 className="mt-5 font-semibold text-ink">{t(step.title)}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-muted">{t(step.text)}</p>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  )
}
