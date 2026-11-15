import { ChevronDown } from 'lucide-react'
import Container from '../../components/ui/Container'
import SectionHeading from '../../components/ui/SectionHeading'
import { useT } from '../preferences/preferences-context'

const FAQS = [
  { question: 'faq.q1', answer: 'faq.a1' },
  { question: 'faq.q2', answer: 'faq.a2' },
  { question: 'faq.q3', answer: 'faq.a3' },
  { question: 'faq.q4', answer: 'faq.a4' },
  { question: 'faq.q5', answer: 'faq.a5' },
  { question: 'faq.q6', answer: 'faq.a6' },
] as const

export default function Faq() {
  const t = useT()
  return (
    <section id="faq" className="py-20 sm:py-24">
      <Container>
        <SectionHeading eyebrow={t('faq.eyebrow')} title={t('faq.title')} />

        <div className="mx-auto mt-12 max-w-3xl divide-y divide-line rounded-2xl border border-line bg-surface">
          {FAQS.map((faq) => (
            <details key={faq.question} className="group px-6 [&_summary::-webkit-details-marker]:hidden">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 font-medium text-ink transition hover:text-brand-600">
                {t(faq.question)}
                <ChevronDown
                  className="size-5 shrink-0 text-ink-subtle transition group-open:rotate-180"
                  aria-hidden="true"
                />
              </summary>
              <p className="pb-5 text-sm leading-relaxed text-ink-muted">{t(faq.answer)}</p>
            </details>
          ))}
        </div>
      </Container>
    </section>
  )
}
