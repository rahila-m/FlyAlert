import { LoaderCircle } from 'lucide-react'

export default function PageLoader({ label = 'Loading…' }: { label?: string }) {
  return (
    <div role="status" className="flex flex-1 items-center justify-center gap-2 py-24 text-sm text-ink-muted">
      <LoaderCircle className="size-5 animate-spin text-brand-600" aria-hidden="true" />
      {label}
    </div>
  )
}
