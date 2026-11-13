import { CircleAlert, CircleCheck } from 'lucide-react'
import type { ReactNode } from 'react'

// Message box shown at the top of a form (errors or confirmations).
export default function FormAlert({
  variant,
  children,
}: {
  variant: 'error' | 'success'
  children: ReactNode
}) {
  const isError = variant === 'error'
  const Icon = isError ? CircleAlert : CircleCheck
  return (
    <div
      role={isError ? 'alert' : 'status'}
      className={`flex gap-2.5 rounded-lg border p-3 text-sm ${
        isError
          ? 'border-red-200 bg-red-50 text-red-800'
          : 'border-emerald-200 bg-emerald-50 text-emerald-800'
      }`}
    >
      <Icon className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
      <div>{children}</div>
    </div>
  )
}
