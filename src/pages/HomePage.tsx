import { useSearchParams } from 'react-router'
import Container from '../components/ui/Container'
import FormAlert from '../components/ui/FormAlert'
import Airlines from '../features/landing/Airlines'
import CallToAction from '../features/landing/CallToAction'
import Faq from '../features/landing/Faq'
import Features from '../features/landing/Features'
import Hero from '../features/landing/Hero'
import HowItWorks from '../features/landing/HowItWorks'
import { useT } from '../features/preferences/preferences-context'

export default function HomePage() {
  const t = useT()
  const [searchParams] = useSearchParams()
  return (
    <>
      {searchParams.get('account') === 'deleted' && (
        <Container className="pt-6">
          <FormAlert variant="success">{t('account.deleted')}</FormAlert>
        </Container>
      )}
      <Hero />
      <HowItWorks />
      <Features />
      <Airlines />
      <Faq />
      <CallToAction />
    </>
  )
}
