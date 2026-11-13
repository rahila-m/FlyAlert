import type { ReactNode } from 'react'

// Shared centered card layout for login, sign up and password pages.
export default function AuthLayout({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string
  subtitle?: string
  children: ReactNode
  footer?: ReactNode
}) {
  return (
    <section className="flex flex-1 justify-center bg-surface-muted px-4 py-12 sm:py-16">
      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-line bg-surface p-6 shadow-xl shadow-slate-900/5 sm:p-8">
          <h1 className="text-2xl font-bold tracking-tight text-ink">{title}</h1>
          {subtitle && <p className="mt-2 text-sm text-ink-muted">{subtitle}</p>}
          <div className="mt-6">{children}</div>
        </div>
        {footer && <p className="mt-6 text-center text-sm text-ink-muted">{footer}</p>}
      </div>
    </section>
  )
}
