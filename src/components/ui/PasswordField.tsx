import { Eye, EyeOff } from 'lucide-react'
import { useState, type ComponentProps } from 'react'
import TextField from './TextField'

// Password input with a show/hide button.
export default function PasswordField(props: Omit<ComponentProps<typeof TextField>, 'type' | 'trailing'>) {
  const [isVisible, setIsVisible] = useState(false)

  return (
    <TextField
      {...props}
      type={isVisible ? 'text' : 'password'}
      trailing={
        <button
          type="button"
          onClick={() => setIsVisible((visible) => !visible)}
          aria-label={isVisible ? 'Hide password' : 'Show password'}
          aria-pressed={isVisible}
          className="flex size-8 items-center justify-center rounded-md text-ink-subtle transition hover:bg-surface-muted hover:text-ink"
        >
          {isVisible ? <EyeOff className="size-4" aria-hidden="true" /> : <Eye className="size-4" aria-hidden="true" />}
        </button>
      }
    />
  )
}
