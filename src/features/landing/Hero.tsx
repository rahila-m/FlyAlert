import { Check } from 'lucide-react'
import Container from '../../components/ui/Container'
import { useT } from '../preferences/preferences-context'
import FlightSearchForm from '../search/FlightSearchForm'
import ExampleAlertCard from './ExampleAlertCard'

const HIGHLIGHTS = ['hero.point1', 'hero.point2', 'hero.point3'] as const

export default function Hero() {
  const t = useT()
  return (
    <section className="relative isolate overflow-hidden bg-night-950 text-white">
      {/* Decorative "sunset sky": soft glowing color clouds on a night background. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-40 -left-32 size-[34rem] rounded-full bg-indigo-600/40 blur-3xl" />
        <div className="absolute top-10 right-[-10rem] size-[30rem] rounded-full bg-fuchsia-600/30 blur-3xl" />
        <div className="absolute bottom-[-12rem] left-1/3 size-[32rem] rounded-full bg-accent-500/25 blur-3xl" />
        {/* Faint dotted pattern for texture */}
        <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.08)_1px,transparent_1px)] bg-[size:22px_22px] [mask-image:linear-gradient(to_bottom,black,transparent_85%)]" />
      </div>

      <Container className="pt-16 pb-12 sm:pt-24 lg:pb-16">
        <div className="grid items-center gap-12 lg:grid-cols-[1.15fr_1fr]">
          <div className="text-center lg:text-left">
            <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-sm font-medium text-white/90 backdrop-blur">
              <span className="size-1.5 rounded-full bg-accent-400" />
              {t('hero.badge')}
            </p>
            <h1 className="mt-6 text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
              {t('hero.title1')}
              <span className="text-sunset block pb-1">{t('hero.title2')}</span>
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-slate-300 lg:mx-0">
              {t('hero.subtitle')}
            </p>
            <ul className="mt-8 flex flex-col items-center gap-x-6 gap-y-2 text-sm text-slate-200 sm:flex-row sm:justify-center lg:justify-start">
              {HIGHLIGHTS.map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <span className="flex size-5 items-center justify-center rounded-full bg-accent-500/20">
                    <Check className="size-3.5 text-accent-400" aria-hidden="true" />
                  </span>
                  {t(item)}
                </li>
              ))}
            </ul>
          </div>

          <ExampleAlertCard />
        </div>

        {/* The search card sits on the dark sky so it immediately catches the eye. */}
        <div className="mt-14 text-ink lg:mt-16">
          <FlightSearchForm />
        </div>
      </Container>
    </section>
  )
}
