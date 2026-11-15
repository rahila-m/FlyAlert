import { ArrowRight, Plane } from 'lucide-react'
import { Link } from 'react-router'
import { buttonStyles } from '../../components/ui/button-styles'
import Container from '../../components/ui/Container'
import { useT } from '../preferences/preferences-context'

export default function CallToAction() {
  const t = useT()
  return (
    <section className="pb-20 sm:pb-24">
      <Container>
        <div className="bg-sunset-deep relative isolate overflow-hidden rounded-[2rem] px-6 py-16 text-center shadow-2xl shadow-brand-600/25 sm:px-12">
          {/* Decoration: a soft glow and a large faded plane */}
          <div aria-hidden="true" className="absolute -top-24 -right-24 -z-10 size-80 rounded-full bg-accent-500/30 blur-3xl" />
          <Plane
            aria-hidden="true"
            className="absolute -bottom-10 -left-6 -z-10 size-56 -rotate-12 text-white/10"
            strokeWidth={1.25}
          />
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">{t('cta.title')}</h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-white/85">{t('cta.subtitle')}</p>
          <Link to="/signup" className={buttonStyles('accent', 'lg', 'mt-8')}>
            {t('cta.button')}
            <ArrowRight className="size-4.5" aria-hidden="true" />
          </Link>
        </div>
      </Container>
    </section>
  )
}
