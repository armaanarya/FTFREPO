'use client'

import { useId } from 'react'
import { cn } from '@/lib/utils'

/**
 * Form field primitives.
 *
 * Every control gets a real visible <label> — never a placeholder standing in
 * for one — and errors are wired through aria-describedby + aria-invalid so a
 * screen reader announces the problem when focus reaches the field, not only
 * when someone happens to read a summary at the top of the form.
 */

type BaseProps = {
  label: string
  hint?: string
  error?: string | null
  required?: boolean
}

function Wrapper({
  label,
  hint,
  error,
  required,
  controlId,
  hintId,
  errorId,
  children,
}: BaseProps & {
  controlId: string
  hintId: string
  errorId: string
  children: React.ReactNode
}) {
  return (
    <div>
      <label htmlFor={controlId} className="block text-sm font-semibold text-ink-900">
        {label}
        {required && (
          <>
            {' '}
            <span className="text-danger" aria-hidden="true">
              *
            </span>
            <span className="sr-only"> (required)</span>
          </>
        )}
      </label>
      {hint && (
        <p id={hintId} className="mt-1 text-sm text-ink-500">
          {hint}
        </p>
      )}
      <div className="mt-2">{children}</div>
      {error && (
        <p id={errorId} className="mt-2 flex items-start gap-1.5 text-sm font-medium text-danger">
          {/* Icon + text, so the error is not signalled by colour alone. */}
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="currentColor"
            aria-hidden="true"
            className="mt-0.5 shrink-0"
          >
            <path d="M8 1a7 7 0 100 14A7 7 0 008 1zm0 3.25a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0V5a.75.75 0 01.75-.75zM8 11.5a.9.9 0 110-1.8.9.9 0 010 1.8z" />
          </svg>
          {error}
        </p>
      )}
    </div>
  )
}

const CONTROL =
  'w-full min-h-[44px] rounded-ctl border bg-white px-3.5 py-2.5 text-base text-ink-900 ' +
  'placeholder:text-ink-500 transition-colors duration-150 ' +
  'disabled:bg-beige-50 disabled:text-ink-500 disabled:cursor-not-allowed'

export function TextField({
  label,
  hint,
  error,
  required,
  className,
  ...props
}: BaseProps & React.InputHTMLAttributes<HTMLInputElement>) {
  const id = useId()
  const controlId = props.id ?? `${id}-control`
  const hintId = `${id}-hint`
  const errorId = `${id}-error`

  return (
    <Wrapper
      label={label}
      hint={hint}
      error={error}
      required={required}
      controlId={controlId}
      hintId={hintId}
      errorId={errorId}
    >
      <input
        {...props}
        id={controlId}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={cn(hint && hintId, error && errorId) || undefined}
        className={cn(
          CONTROL,
          error ? 'border-danger' : 'border-line-strong',
          className,
        )}
      />
    </Wrapper>
  )
}

export function TextArea({
  label,
  hint,
  error,
  required,
  className,
  ...props
}: BaseProps & React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const id = useId()
  const controlId = props.id ?? `${id}-control`
  const hintId = `${id}-hint`
  const errorId = `${id}-error`

  return (
    <Wrapper
      label={label}
      hint={hint}
      error={error}
      required={required}
      controlId={controlId}
      hintId={hintId}
      errorId={errorId}
    >
      <textarea
        {...props}
        id={controlId}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={cn(hint && hintId, error && errorId) || undefined}
        className={cn(
          CONTROL,
          'min-h-[140px] resize-y leading-relaxed',
          error ? 'border-danger' : 'border-line-strong',
          className,
        )}
      />
    </Wrapper>
  )
}

/** Radio group rendered as a fieldset so the question is announced with options. */
export function RadioGroup<T extends string>({
  label,
  hint,
  error,
  required,
  name,
  value,
  options,
  onChange,
}: BaseProps & {
  name: string
  value: T
  options: { value: T; label: string; description?: string }[]
  onChange: (value: T) => void
}) {
  const id = useId()
  const errorId = `${id}-error`
  const hintId = `${id}-hint`

  return (
    <fieldset aria-describedby={cn(hint && hintId, error && errorId) || undefined}>
      <legend className="text-sm font-semibold text-ink-900">
        {label}
        {required && (
          <>
            {' '}
            <span className="text-danger" aria-hidden="true">
              *
            </span>
            <span className="sr-only"> (required)</span>
          </>
        )}
      </legend>
      {hint && (
        <p id={hintId} className="mt-1 text-sm text-ink-500">
          {hint}
        </p>
      )}
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        {options.map((option) => {
          const optionId = `${id}-${option.value}`
          const selected = value === option.value
          return (
            <label
              key={option.value}
              htmlFor={optionId}
              className={cn(
                'flex cursor-pointer gap-3 rounded-card border p-4 transition-colors duration-150',
                // Selection is carried by border weight + background + the radio
                // itself, not by colour alone.
                selected
                  ? 'border-green-cta bg-green-50 ring-1 ring-green-cta'
                  : 'border-line-strong bg-white hover:bg-beige-50',
              )}
            >
              <input
                type="radio"
                id={optionId}
                name={name}
                value={option.value}
                checked={selected}
                onChange={() => onChange(option.value)}
                className="mt-0.5 h-5 w-5 shrink-0 accent-[var(--green-cta)]"
              />
              <span>
                <span className="block text-sm font-semibold text-ink-900">{option.label}</span>
                {option.description && (
                  <span className="mt-0.5 block text-sm text-ink-600">{option.description}</span>
                )}
              </span>
            </label>
          )
        })}
      </div>
      {error && (
        <p id={errorId} className="mt-2 text-sm font-medium text-danger">
          {error}
        </p>
      )}
    </fieldset>
  )
}
