import { LayoutDashboard, LogOut, Menu, X } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { useAuth } from '../../features/auth/auth-context'
import NotificationBell from '../../features/notifications/NotificationBell'
import { supabase } from '../../lib/supabase'
import { buttonStyles } from '../ui/button-styles'
import Container from '../ui/Container'
import Logo from '../ui/Logo'
import { NAV_LINKS } from './nav-links'

// Log in / Sign up for visitors, Dashboard / Log out for logged-in users.
function AccountActions({ isMobile, onNavigate }: { isMobile: boolean; onNavigate?: () => void }) {
  const { user, isLoading } = useAuth()
  const navigate = useNavigate()

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
          Dashboard
        </Link>
        <button type="button" onClick={handleLogout} className={isMobile ? buttonStyles('secondary') : buttonStyles('secondary', 'sm')}>
          <LogOut className="size-4" aria-hidden="true" />
          Log out
        </button>
      </>
    )
  }

  return (
    <>
      <Link to="/login" onClick={onNavigate} className={ghostOrSecondary}>
        Log in
      </Link>
      <Link to="/signup" onClick={onNavigate} className={primary}>
        Sign up free
      </Link>
    </>
  )
}

export default function Navbar() {
  const { user } = useAuth()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const closeMenu = () => setIsMenuOpen(false)

  return (
    <header className="sticky top-0 z-50 border-b border-line/70 bg-surface/80 backdrop-blur-md">
      <Container className="flex h-16 items-center justify-between gap-6">
        <Logo />

        {/* Desktop navigation */}
        <nav aria-label="Main" className="hidden md:block">
          <ul className="flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <li key={link.hash}>
                <Link
                  to={{ pathname: '/', hash: link.hash }}
                  className={buttonStyles('ghost', 'sm')}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
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
            aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
            onClick={() => setIsMenuOpen((open) => !open)}
          >
            {isMenuOpen ? (
              <X className="size-5" aria-hidden="true" />
            ) : (
              <Menu className="size-5" aria-hidden="true" />
            )}
          </button>
        </div>
      </Container>

      {/* Mobile navigation */}
      {isMenuOpen && (
        <div id="mobile-menu" className="border-t border-line bg-surface md:hidden">
          <Container className="py-4">
            <nav aria-label="Mobile">
              <ul className="flex flex-col gap-1">
                {NAV_LINKS.map((link) => (
                  <li key={link.hash}>
                    <Link
                      to={{ pathname: '/', hash: link.hash }}
                      onClick={closeMenu}
                      className={buttonStyles('ghost', 'md', 'w-full justify-start')}
                    >
                      {link.label}
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
