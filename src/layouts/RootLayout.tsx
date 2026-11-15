import { useEffect } from 'react'
import { Outlet, ScrollRestoration, useLocation } from 'react-router'
import Footer from '../components/layout/Footer'
import Navbar from '../components/layout/Navbar'

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

  return (
    <div className="flex min-h-svh flex-col">
      <Navbar />
      <main className="flex flex-1 flex-col">
        <Outlet />
      </main>
      <Footer />
      <ScrollRestoration />
    </div>
  )
}
