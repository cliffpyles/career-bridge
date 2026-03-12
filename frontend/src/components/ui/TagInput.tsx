/**
 * TagInput — reusable chip-style tag input component.
 * Enter or comma to add a tag. Backspace removes the last tag.
 * Used on ExperienceForm (Phase 2) and extended in later phases.
 */
import { type KeyboardEvent, useRef, useState } from 'react'
import { X } from 'lucide-react'
import styles from './TagInput.module.css'

export interface TagInputProps {
  value: string[]
  onChange: (tags: string[]) => void
  label?: string
  helperText?: string
  errorText?: string
  placeholder?: string
  disabled?: boolean
  maxTags?: number
  id?: string
}

export function TagInput({
  value,
  onChange,
  label,
  helperText,
  errorText,
  placeholder = 'Add a tag…',
  disabled = false,
  maxTags,
  id,
}: TagInputProps) {
  const [inputValue, setInputValue] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const inputId = id ?? (label ? `taginput-${label.toLowerCase().replace(/\s+/g, '-')}` : 'taginput')
  const hasError = !!errorText
  const atMax = maxTags !== undefined && value.length >= maxTags

  function addTag(raw: string) {
    const tag = raw.trim().toLowerCase()
    if (!tag || value.includes(tag) || atMax) return
    onChange([...value, tag])
  }

  function removeTag(tag: string) {
    onChange(value.filter((t) => t !== tag))
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if ((e.key === 'Enter' || e.key === ',') && inputValue) {
      e.preventDefault()
      addTag(inputValue)
      setInputValue('')
    } else if (e.key === 'Backspace' && !inputValue && value.length > 0) {
      removeTag(value[value.length - 1])
    }
  }

  function handleBlur() {
    if (inputValue.trim()) {
      addTag(inputValue)
      setInputValue('')
    }
  }

  return (
    <div className={styles.wrapper}>
      {label && (
        <label htmlFor={inputId} className={styles.label}>
          {label}
        </label>
      )}

      <div
        className={[styles.field, hasError && styles.fieldError, disabled && styles.fieldDisabled]
          .filter(Boolean)
          .join(' ')}
        onClick={() => inputRef.current?.focus()}
        role="group"
        aria-labelledby={label ? `${inputId}-label` : undefined}
      >
        {value.map((tag) => (
          <span key={tag} className={styles.tag}>
            {tag}
            {!disabled && (
              <button
                type="button"
                className={styles.tagRemove}
                onClick={(e) => {
                  e.stopPropagation()
                  removeTag(tag)
                }}
                aria-label={`Remove tag ${tag}`}
              >
                <X size={12} />
              </button>
            )}
          </span>
        ))}

        {!atMax && (
          <input
            ref={inputRef}
            id={inputId}
            className={styles.input}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
            placeholder={value.length === 0 ? placeholder : ''}
            disabled={disabled}
            aria-describedby={
              errorText
                ? `${inputId}-error`
                : helperText
                  ? `${inputId}-helper`
                  : undefined
            }
            aria-invalid={hasError}
          />
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
}
