import { Link } from 'react-router'
import { openCookieSettings } from '../../features/consent/consent'
import { useT } from '../../features/preferences/preferences-context'
import Container from '../ui/Container'
import Logo from '../ui/Logo'
import { NAV_LINKS } from './nav-links'

const CURRENT_YEAR = new Date().getFullYear()

const linkClass =
  'text-sm text-ink-muted transition hover:text-ink focus-visible:outline-2 focus-visible:outline-brand-600'

export default function Footer() {
  const t = useT()
  return (
    <footer className="border-t border-line bg-surface-muted">
      <Container className="py-12">
        <div className="flex flex-col gap-10 md:flex-row md:justify-between">
          <div className="max-w-xs">
            <Logo />
            <p className="mt-4 text-sm leading-relaxed text-ink-muted">{t('footer.tagline')}</p>
          </div>

          <div className="grid grid-cols-2 gap-10 sm:grid-cols-3 sm:gap-16">
            <div>
              <h3 className="text-sm font-semibold text-ink">{t('footer.product')}</h3>
              <ul className="mt-4 space-y-3">
                {NAV_LINKS.map((link) => (
                  <li key={link.hash}>
                    <Link to={{ pathname: '/', hash: link.hash }} className={linkClass}>
                      {t(link.labelKey)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-ink">{t('footer.account')}</h3>
              <ul className="mt-4 space-y-3">
                <li>
                  <Link to="/login" className={linkClass}>
                    {t('nav.logIn')}
                  </Link>
                </li>
                <li>
                  <Link to="/signup" className={linkClass}>
                    {t('footer.signUp')}
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-ink">{t('legal.heading')}</h3>
              <ul className="mt-4 space-y-3">
                <li>
                  <Link to="/privacy" className={linkClass}>
                    {t('legal.privacy')}
                  </Link>
                </li>
                <li>
                  <Link to="/terms" className={linkClass}>
                    {t('legal.terms')}
                  </Link>
                </li>
                <li>
                  <button type="button" onClick={openCookieSettings} className={linkClass}>
                    {t('consent.title')}
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-2 border-t border-line pt-6 text-sm text-ink-subtle sm:flex-row sm:justify-between">
          <p>{t('footer.rights', { year: CURRENT_YEAR })}</p>
          <p>{t('footer.noTickets')}</p>
        </div>
      </Container>
    </footer>
  )
}
