/**
 * AISuggestionDiff — inline diff display for AI-suggested content rewrites.
 *
 * Shows the original content and the AI suggestion side-by-side or stacked.
 * The user can Accept the suggestion (replaces original) or Dismiss it.
 * The suggestion is inline-editable before accepting.
 *
 * Design:
 *   - Left border in accent-primary-soft to signal AI origin
 *   - ✦ icon + "AI Suggestion" label
 *   - Original text shown with subtle strikethrough
 *   - Suggested text in an editable contenteditable area
 *   - Accept / Dismiss buttons
 *
 * Used by: Phase 6 (resume section rewrites), Phase 7 (AI Assist everywhere).
 */

import { useEffect, useRef, useState } from 'react'
import { Check, X } from 'lucide-react'
import { Button } from './Button'
import styles from './AISuggestionDiff.module.css'

export interface AISuggestionDiffProps {
  /** The original content before AI rewrote it. */
  original: string
  /** The AI-suggested replacement content. */
  suggestion: string
  /** Called with the final accepted text when the user clicks Accept. */
  onAccept: (acceptedText: string) => void
  /** Called when the user clicks Dismiss. */
  onDismiss: () => void
  /** Label shown in the header. Defaults to "AI Suggestion". */
  label?: string
  /** Whether to show the original text for comparison. Defaults to true. */
  showOriginal?: boolean
}

export function AISuggestionDiff({
  original,
  suggestion,
  onAccept,
  onDismiss,
  label = 'AI Suggestion',
  showOriginal = true,
}: AISuggestionDiffProps) {
  const [editedText, setEditedText] = useState(suggestion)
  const editableRef = useRef<HTMLDivElement>(null)

  // Sync editedText when suggestion changes (e.g. re-generated)
  useEffect(() => {
    setEditedText(suggestion)
    if (editableRef.current) {
      editableRef.current.innerText = suggestion
    }
  }, [suggestion])

  function handleInput() {
    if (editableRef.current) {
      setEditedText(editableRef.current.innerText)
    }
  }

  function handleAccept() {
    onAccept(editedText)
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Escape') {
      e.preventDefault()
      onDismiss()
    }
  }

  return (
    <div className={styles.container} role="region" aria-label={label}>
      {/* Header */}
      <div className={styles.header}>
        <span className={styles.sparkle} aria-hidden="true">✦</span>
        <span className={styles.label}>{label}</span>
        <div className={styles.actions}>
          <Button
            variant="ghost"
            size="sm"
            icon={<X size={14} />}
            onClick={onDismiss}
            aria-label="Dismiss suggestion"
          >
            Dismiss
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={<Check size={14} />}
            onClick={handleAccept}
            aria-label="Accept suggestion"
          >
            Accept
          </Button>
        </div>
      </div>

      {/* Original (if provided) */}
      {showOriginal && original && (
        <div className={styles.originalSection}>
          <span className={styles.sectionLabel}>Original</span>
          <p className={styles.originalText}>{original}</p>
        </div>
      )}

      {/* Editable suggestion */}
      <div className={styles.suggestionSection}>
        {showOriginal && original && (
          <span className={styles.sectionLabel}>Suggested</span>
        )}
        <div
          ref={editableRef}
          className={styles.suggestionText}
          contentEditable
          suppressContentEditableWarning
          onInput={handleInput}
          onKeyDown={handleKeyDown}
          aria-label="Edit suggestion before accepting"
          aria-multiline="true"
          role="textbox"
        >
          {suggestion}
        </div>
        <p className={styles.hint}>Click to edit before accepting.</p>
      </div>
    </div>
  )
}
