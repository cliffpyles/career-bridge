import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react'
import styles from './Input.module.css'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  helperText?: string
  errorText?: string
  leadingIcon?: ReactNode
  trailingIcon?: ReactNode
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, helperText, errorText, leadingIcon, trailingIcon, id, className, ...props }, ref) => {
    const inputId = id ?? (label ? `input-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined)
    const hasError = !!errorText

    return (
      <div className={`${styles.wrapper} ${className ?? ''}`}>
        {label && (
          <label htmlFor={inputId} className={styles.label}>
            {label}
          </label>
        )}
        <div className={`${styles.inputWrapper} ${hasError ? styles.error : ''}`}>
          {leadingIcon && (
            <span className={`${styles.icon} ${styles.iconLeading}`} aria-hidden="true">
              {leadingIcon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            className={`${styles.input} ${leadingIcon ? styles.hasLeadingIcon : ''} ${trailingIcon ? styles.hasTrailingIcon : ''}`}
            aria-describedby={
              errorText ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined
            }
            aria-invalid={hasError}
            {...props}
          />
          {trailingIcon && (
            <span className={`${styles.icon} ${styles.iconTrailing}`} aria-hidden="true">
              {trailingIcon}
            </span>
          )}
        </div>
        {errorText && (
          <span id={`${inputId}-error`} className={styles.errorText} role="alert">
            {errorText}
          </span>
        )}
        {!errorText && helperText && (
          <span id={`${inputId}-helper`} className={styles.helperText}>
            {helperText}
          </span>
        )}
      </div>
    )
  },
)

Input.displayName = 'Input'
