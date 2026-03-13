/**
 * AIGenerationOverlay — full-overlay progress display during AI generation.
 *
 * Shows streaming progress text with a "Thinking…" pulse animation and a
 * cancel button. Respects prefers-reduced-motion.
 *
 * Used by: Phase 6 (resume generation), Phase 9 (quiz evaluation).
 */

import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'
import { Button } from './Button'
import styles from './AIGenerationOverlay.module.css'

export interface AIGenerationOverlayProps {
  /** Whether the overlay is visible. */
  open: boolean
  /** Accumulated streaming text to display. */
  streamText: string
  /** Called when the user clicks Cancel. */
  onCancel: () => void
  /** Optional heading shown above the progress log. Defaults to "Generating…" */
  title?: string
}

export function AIGenerationOverlay({
  open,
  streamText,
  onCancel,
  title = 'Generating…',
}: AIGenerationOverlayProps) {
  const logRef = useRef<HTMLDivElement>(null)

  // Auto-scroll progress log as tokens arrive
  useEffect(() => {
    const el = logRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [streamText])

  if (!open) return null

  return (
    <div
      className={styles.backdrop}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div className={styles.panel}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.titleRow}>
            <span className={styles.sparkle} aria-hidden="true">✦</span>
            <h2 className={styles.title}>{title}</h2>
          </div>
          <Button
            variant="ghost"
            size="sm"
            icon={<X size={16} />}
            onClick={onCancel}
            aria-label="Cancel generation"
          />
        </div>

        {/* Progress indicator */}
        <div className={styles.thinkingRow} aria-live="polite" aria-atomic="false">
          <span className={styles.thinkingDot} aria-hidden="true" />
          <span className={styles.thinkingDot} aria-hidden="true" />
          <span className={styles.thinkingDot} aria-hidden="true" />
          <span className={styles.thinkingLabel}>Thinking</span>
        </div>

        {/* Streaming log */}
        {streamText && (
          <div
            ref={logRef}
            className={styles.log}
            aria-live="polite"
            aria-atomic="false"
          >
            <pre className={styles.logText}>{streamText}</pre>
          </div>
        )}

        {/* Footer */}
        <div className={styles.footer}>
          <Button variant="secondary" size="sm" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  )
}
