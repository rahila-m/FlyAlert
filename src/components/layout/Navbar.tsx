import { LayoutDashboard, LogOut, Menu, X } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { useAuth } from '../../features/auth/auth-context'
import NotificationBell from '../../features/notifications/NotificationBell'
import { useT } from '../../features/preferences/preferences-context'
import PreferencesMenu from '../../features/preferences/PreferencesMenu'
import { supabase } from '../../lib/supabase'
import { buttonStyles } from '../ui/button-styles'
import Container from '../ui/Container'
import Logo from '../ui/Logo'
import { NAV_LINKS } from './nav-links'

// Log in / Sign up for visitors, Dashboard / Log out for logged-in users.
function AccountActions({ isMobile, onNavigate }: { isMobile: boolean; onNavigate?: () => void }) {
  const { user, isLoading } = useAuth()
  const navigate = useNavigate()
  const t = useT()

  async function handleLogout() {
    onNavigate?.()
    await supabase.auth.signOut()
    navigate('/', { replace: true })
  }

  // Keep the space empty while the session loads, so buttons don't flicker.
  if (isLoading) return <div className={isMobile ? 'h-11' : 'h-9 w-44'} aria-hidden="true" />

  const ghostOrSecondary = isMobile ? buttonStyles('secondary') : buttonStyles('ghost', 'sm')
  const primary = isMobile ? buttonStyles('primary') : buttonStyles('primary', 'sm')

  if (user) {
    return (
      <>
        <Link to="/dashboard" onClick={onNavigate} className={ghostOrSecondary}>
          <LayoutDashboard className="size-4" aria-hidden="true" />
          {t('nav.dashboard')}
        </Link>
        <button
          type="button"
          onClick={handleLogout}
          className={isMobile ? buttonStyles('secondary') : buttonStyles('secondary', 'sm')}
        >
          <LogOut className="size-4" aria-hidden="true" />
          {t('nav.logOut')}
        </button>
      </>
    )
  }

  return (
    <>
      <Link to="/login" onClick={onNavigate} className={ghostOrSecondary}>
        {t('nav.logIn')}
      </Link>
      <Link to="/signup" onClick={onNavigate} className={primary}>
        {t('nav.signUp')}
      </Link>
    </>
  )
}

export default function Navbar() {
  const { user } = useAuth()
  const t = useT()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const closeMenu = () => setIsMenuOpen(false)

  return (
    <header className="sticky top-0 z-50 border-b border-line/70 bg-surface/80 backdrop-blur-md">
      <Container className="flex h-16 items-center justify-between gap-4">
        <Logo />

        {/* Desktop navigation */}
        <nav aria-label={t('nav.main')} className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <li key={link.hash}>
                <Link to={{ pathname: '/', hash: link.hash }} className={buttonStyles('ghost', 'sm')}>
                  {t(link.labelKey)}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-1 sm:gap-2">
          <PreferencesMenu />
          {/* Notifications are shown on every screen size for logged-in users. */}
          {user && <NotificationBell />}

          <div className="hidden items-center gap-2 md:flex">
            <AccountActions isMobile={false} />
          </div>

          {/* Mobile menu button */}
          <button
            type="button"
            className={buttonStyles('ghost', 'sm', 'md:hidden')}
            aria-expanded={isMenuOpen}
            aria-controls="mobile-menu"
            aria-label={isMenuOpen ? t('nav.closeMenu') : t('nav.openMenu')}
            onClick={() => setIsMenuOpen((open) => !open)}
          >
            {isMenuOpen ? <X className="size-5" aria-hidden="true" /> : <Menu className="size-5" aria-hidden="true" />}
          </button>
        </div>
      </Container>

      {/* Mobile navigation */}
      {isMenuOpen && (
        <div id="mobile-menu" className="border-t border-line bg-surface md:hidden">
          <Container className="py-4">
            <nav aria-label={t('nav.mobile')}>
              <ul className="flex flex-col gap-1">
                {NAV_LINKS.map((link) => (
                  <li key={link.hash}>
                    <Link
                      to={{ pathname: '/', hash: link.hash }}
                      onClick={closeMenu}
                      className={buttonStyles('ghost', 'md', 'w-full justify-start')}
                    >
                      {t(link.labelKey)}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
            <div className="mt-4 grid grid-cols-2 gap-2 border-t border-line pt-4">
              <AccountActions isMobile onNavigate={closeMenu} />
            </div>
          </Container>
        </div>
      )}
    </header>
  )
}
