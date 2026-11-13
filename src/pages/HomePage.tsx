import CallToAction from '../features/landing/CallToAction'
import Faq from '../features/landing/Faq'
import Features from '../features/landing/Features'
import Hero from '../features/landing/Hero'
import HowItWorks from '../features/landing/HowItWorks'
import Pricing from '../features/landing/Pricing'

export default function HomePage() {
  return (
    <>
      <Hero />
      <HowItWorks />
      <Features />
      <Pricing />
      <Faq />
      <CallToAction />
    </>
  )
}
