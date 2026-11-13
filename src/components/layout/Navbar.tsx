import { Menu, X } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router'
import { buttonStyles } from '../ui/button-styles'
import Container from '../ui/Container'
import Logo from '../ui/Logo'
import { NAV_LINKS } from './nav-links'

export default function Navbar() {
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

        <div className="hidden items-center gap-2 md:flex">
          <Link to="/login" className={buttonStyles('ghost', 'sm')}>
            Log in
          </Link>
          <Link to="/signup" className={buttonStyles('primary', 'sm')}>
            Sign up free
          </Link>
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
              <Link to="/login" onClick={closeMenu} className={buttonStyles('secondary')}>
                Log in
              </Link>
              <Link to="/signup" onClick={closeMenu} className={buttonStyles('primary')}>
                Sign up free
              </Link>
            </div>
          </Container>
        </div>
      )}
    </header>
  )
}
