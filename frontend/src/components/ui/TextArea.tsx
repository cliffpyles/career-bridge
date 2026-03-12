import { forwardRef, type TextareaHTMLAttributes } from 'react'
import styles from './TextArea.module.css'

export interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  helperText?: string
  errorText?: string
  resize?: 'none' | 'vertical' | 'horizontal' | 'both'
}

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ label, helperText, errorText, resize = 'vertical', id, className, ...props }, ref) => {
    const textareaId = id ?? (label ? `textarea-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined)
    const hasError = !!errorText

    return (
      <div className={`${styles.wrapper} ${className ?? ''}`}>
        {label && (
          <label htmlFor={textareaId} className={styles.label}>
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          className={`${styles.textarea} ${hasError ? styles.error : ''}`}
          style={{ resize }}
          aria-describedby={
            errorText ? `${textareaId}-error` : helperText ? `${textareaId}-helper` : undefined
          }
          aria-invalid={hasError}
          {...props}
        />
        {errorText && (
          <span id={`${textareaId}-error`} className={styles.errorText} role="alert">
            {errorText}
          </span>
        )}
        {!errorText && helperText && (
          <span id={`${textareaId}-helper`} className={styles.helperText}>
            {helperText}
          </span>
        )}
      </div>
    )
  },
)

TextArea.displayName = 'TextArea'
