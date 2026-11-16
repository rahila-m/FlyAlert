import { useEffect } from 'react'
import { Outlet, ScrollRestoration, useLocation } from 'react-router'
import Footer from '../components/layout/Footer'
import Navbar from '../components/layout/Navbar'
import TakeoffTransition from '../components/layout/TakeoffTransition'
import AssistantWidget from '../features/assistant/AssistantWidget'

// Scrolls to the section in the URL hash (e.g. /#faq) after navigation,
// including when coming from another page. `key` changes on every navigation,
// so clicking the same link twice scrolls again.
function useScrollToHash() {
  const { hash, key } = useLocation()

  useEffect(() => {
    if (!hash) return
    document.getElementById(decodeURIComponent(hash.slice(1)))?.scrollIntoView()
  }, [hash, key])
}

// Shared shell for every page: Navbar on top, Footer at the bottom,
// and <Outlet /> is replaced by the page that matches the current URL.
export default function RootLayout() {
  useScrollToHash()
  const { pathname } = useLocation()

  return (
    <div className="flex min-h-svh flex-col">
      <Navbar />
      {/* `key` replays the fade-in each time the page (path) changes. */}
      <main key={pathname} className="flex flex-1 animate-page-in flex-col">
        <Outlet />
      </main>
      <Footer />
      <TakeoffTransition />
      <AssistantWidget />
      <ScrollRestoration />
    </div>
  )
}
