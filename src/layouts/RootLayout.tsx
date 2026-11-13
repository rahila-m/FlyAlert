import { Outlet, ScrollRestoration } from 'react-router'

// Shared shell for every page. The Navbar and Footer will live here,
// and <Outlet /> is replaced by the page that matches the current URL.
export default function RootLayout() {
  return (
    <div className="flex min-h-svh flex-col bg-slate-50 text-slate-900">
      <main className="flex flex-1 flex-col">
        <Outlet />
      </main>
      <ScrollRestoration />
    </div>
  )
}
