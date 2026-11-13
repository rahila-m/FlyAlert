import { ChevronDown } from 'lucide-react'
import Container from '../../components/ui/Container'
import SectionHeading from '../../components/ui/SectionHeading'

const FAQS = [
  {
    question: 'Does FlyAlert sell flight tickets?',
    answer:
      'No. FlyAlert is a price tracking tool. When you find a fare you like, we send you to the airline or booking provider to complete your purchase.',
  },
  {
    question: 'Is FlyAlert free?',
    answer:
      'Yes. FlyAlert is free while in beta and does not require a credit card. If paid plans are introduced later, the free plan will remain available.',
  },
  {
    question: 'How often are prices checked?',
    answer:
      'We check the prices of your tracked flights on a regular schedule and save each result, so you can see how the fare changes over time.',
  },
  {
    question: 'Can FlyAlert predict future flight prices?',
    answer:
      'No. We show you prices we have actually recorded and notify you when they drop. We never claim to know what a fare will cost in the future.',
  },
  {
    question: 'Will I get spammed with notifications?',
    answer:
      'No. You are notified when a fare reaches your target, and we avoid sending repeated alerts for the same price.',
  },
  {
    question: 'Which currencies are supported?',
    answer:
      'You can choose your preferred currency in your profile. Prices are displayed in that currency whenever the data provider supports it.',
  },
]

export default function Faq() {
  return (
    <section id="faq" className="py-20 sm:py-24">
      <Container>
        <SectionHeading eyebrow="FAQ" title="Frequently asked questions" />

        <div className="mx-auto mt-12 max-w-3xl divide-y divide-line rounded-2xl border border-line bg-surface">
          {FAQS.map((faq) => (
            <details key={faq.question} className="group px-6 [&_summary::-webkit-details-marker]:hidden">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 font-medium text-ink transition hover:text-brand-600">
                {faq.question}
                <ChevronDown
                  className="size-5 shrink-0 text-ink-subtle transition group-open:rotate-180"
                  aria-hidden="true"
                />
              </summary>
              <p className="pb-5 text-sm leading-relaxed text-ink-muted">{faq.answer}</p>
            </details>
          ))}
        </div>
      </Container>
    </section>
  )
}
