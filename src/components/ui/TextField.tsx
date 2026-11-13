import { useId, type InputHTMLAttributes, type ReactNode } from 'react'
import { errorTextClass, inputClass, labelClass } from './form-styles'

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
  hint?: string
  // Element shown inside the input on the right (e.g. a show/hide password button).
  trailing?: ReactNode
  labelAction?: ReactNode // e.g. a "Forgot password?" link next to the label
}

export default function TextField({
  label,
  error,
  hint,
  trailing,
  labelAction,
  id,
  className = '',
  ...inputProps
}: TextFieldProps) {
  const generatedId = useId()
  const inputId = id ?? generatedId
  const messageId = `${inputId}-message`
  const message = error ?? hint

  return (
    <div className={className}>
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={inputId} className={`${labelClass} text-sm`}>
          {label}
        </label>
        {labelAction}
      </div>
      <div className="relative">
        <input
          id={inputId}
          aria-invalid={error ? true : undefined}
          aria-describedby={message ? messageId : undefined}
          className={`${inputClass} ${trailing ? 'pr-11' : ''}`}
          {...inputProps}
        />
        {trailing && <div className="absolute inset-y-0 right-0 flex items-center pr-1.5">{trailing}</div>}
      </div>
      {message && (
        <p id={messageId} className={error ? errorTextClass : 'mt-1.5 text-xs text-ink-subtle'}>
          {message}
        </p>
      )}
    </div>
  )
}
