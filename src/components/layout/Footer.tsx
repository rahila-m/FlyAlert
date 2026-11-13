import { Link } from 'react-router'
import Container from '../ui/Container'
import Logo from '../ui/Logo'
import { NAV_LINKS } from './nav-links'

const CURRENT_YEAR = new Date().getFullYear()

const linkClass =
  'text-sm text-ink-muted transition hover:text-ink focus-visible:outline-2 focus-visible:outline-brand-600'

export default function Footer() {
  return (
    <footer className="border-t border-line bg-surface-muted">
      <Container className="py-12">
        <div className="flex flex-col gap-10 md:flex-row md:justify-between">
          <div className="max-w-xs">
            <Logo />
            <p className="mt-4 text-sm leading-relaxed text-ink-muted">
              Track flight prices worldwide and get notified when they drop to your
              target price.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-10 sm:gap-16">
            <div>
              <h3 className="text-sm font-semibold text-ink">Product</h3>
              <ul className="mt-4 space-y-3">
                {NAV_LINKS.map((link) => (
                  <li key={link.hash}>
                    <Link to={{ pathname: '/', hash: link.hash }} className={linkClass}>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-ink">Account</h3>
              <ul className="mt-4 space-y-3">
                <li>
                  <Link to="/login" className={linkClass}>
                    Log in
                  </Link>
                </li>
                <li>
                  <Link to="/signup" className={linkClass}>
                    Sign up
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-2 border-t border-line pt-6 text-sm text-ink-subtle sm:flex-row sm:justify-between">
          <p>© {CURRENT_YEAR} FlyAlert. All rights reserved.</p>
          <p>FlyAlert doesn't sell tickets. You always book with the airline or provider.</p>
        </div>
      </Container>
    </footer>
  )
}
