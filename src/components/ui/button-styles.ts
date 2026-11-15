// Shared button styles, usable on <button>, <a> and React Router <Link>.
//   accent    → the most important action on a screen (Search, Sign up, Track price)
//   primary   → normal confirm actions (Save, Log in)
//   secondary → neutral actions
//   ghost     → low-emphasis actions (menu links)
type Variant = 'accent' | 'primary' | 'secondary' | 'ghost'
type Size = 'sm' | 'md' | 'lg'

const base =
  'inline-flex items-center justify-center gap-2 rounded-xl font-semibold whitespace-nowrap transition duration-200 ' +
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 ' +
  'active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50'

const variants: Record<Variant, string> = {
  // Navy text on coral: contrast ratio above 7:1, easy to read.
  accent:
    'bg-accent-500 text-night-900 shadow-md shadow-accent-500/25 hover:bg-accent-400 hover:shadow-lg hover:shadow-accent-500/30',
  primary: 'bg-brand-600 text-white shadow-sm hover:bg-brand-700 hover:shadow-md',
  secondary: 'border border-line bg-surface text-ink shadow-sm hover:border-brand-200 hover:bg-surface-muted',
  ghost: 'font-medium text-ink-muted hover:bg-surface-muted hover:text-ink',
}

const sizes: Record<Size, string> = {
  sm: 'h-9 px-3.5 text-sm',
  md: 'h-11 px-5 text-sm',
  lg: 'h-12 px-6 text-base',
}

export function buttonStyles(variant: Variant = 'primary', size: Size = 'md', className = '') {
  return `${base} ${variants[variant]} ${sizes[size]} ${className}`.trim()
}
