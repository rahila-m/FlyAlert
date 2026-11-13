import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router'
import Container from '../../components/ui/Container'

export default function CallToAction() {
  return (
    <section className="pb-20 sm:pb-24">
      <Container>
        <div className="relative overflow-hidden rounded-3xl bg-brand-600 px-6 py-14 text-center shadow-xl sm:px-12">
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.18),transparent_55%)]"
          />
          <h2 className="relative text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Ready to catch your next price drop?
          </h2>
          <p className="relative mx-auto mt-4 max-w-xl text-lg text-brand-100">
            Create a free account and set up your first flight alert in under a minute.
          </p>
          <Link
            to="/signup"
            className="relative mt-8 inline-flex h-12 items-center gap-2 rounded-lg bg-white px-6 font-semibold text-brand-700 shadow-sm transition hover:bg-brand-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            Sign up free
            <ArrowRight className="size-4.5" aria-hidden="true" />
          </Link>
        </div>
      </Container>
    </section>
  )
}
