// Shared form control styles.

const focusRing =
  'focus:border-brand-500 focus:ring-4 focus:ring-brand-500/15 focus:outline-none'

const invalid =
  'aria-[invalid=true]:border-red-400 aria-[invalid=true]:focus:border-red-500 aria-[invalid=true]:focus:ring-red-500/15'

// Text/date input with room for a leading icon.
export const inputWithIconClass =
  'h-12 w-full rounded-lg border border-line bg-surface pl-10 pr-3 text-sm text-ink ' +
  'placeholder:text-ink-subtle transition hover:border-ink-subtle/50 ' +
  'disabled:cursor-not-allowed disabled:bg-surface-muted disabled:text-ink-subtle ' +
  `${focusRing} ${invalid}`

// Plain text input (no icon).
export const inputClass =
  'h-11 w-full rounded-lg border border-line bg-surface px-3.5 text-sm text-ink ' +
  'placeholder:text-ink-subtle transition hover:border-ink-subtle/50 ' +
  'disabled:cursor-not-allowed disabled:bg-surface-muted ' +
  `${focusRing} ${invalid}`

export const selectClass =
  'h-9 rounded-lg border border-line bg-surface px-2.5 text-sm text-ink transition ' +
  `hover:border-ink-subtle/50 ${focusRing} ${invalid}`

export const labelClass = 'mb-1.5 block text-xs font-medium text-ink-muted'

export const errorTextClass = 'mt-1.5 text-xs text-red-600'

export const leadingIconClass =
  'pointer-events-none absolute top-1/2 left-3 size-4.5 -translate-y-1/2 text-ink-subtle'
