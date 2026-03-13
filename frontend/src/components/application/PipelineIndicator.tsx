/**
 * PipelineIndicator — horizontal step indicator for job application pipeline stages.
 * Shows completed stages as filled, current stage highlighted, future stages hollow.
 * Reusable across the application detail view and dashboard.
 */
import type { ApplicationStatus } from '../../types/application'
import {
  APPLICATION_STATUS_LABELS,
  PIPELINE_STAGES,
  TERMINAL_STATUSES,
} from '../../types/application'
import styles from './PipelineIndicator.module.css'

interface PipelineIndicatorProps {
  status: ApplicationStatus
  /** Compact mode — smaller, fewer labels. Used in list rows and dashboard cards. */
  compact?: boolean
  className?: string
}

function getStageIndex(status: ApplicationStatus): number {
  return PIPELINE_STAGES.indexOf(status)
}

export function PipelineIndicator({ status, compact = false, className }: PipelineIndicatorProps) {
  const isTerminal = TERMINAL_STATUSES.includes(status)
  const currentIndex = getStageIndex(status)

  return (
    <div
      className={[styles.pipeline, compact ? styles.compact : '', className ?? ''].join(' ')}
      role="list"
      aria-label={`Application pipeline: ${APPLICATION_STATUS_LABELS[status]}`}
    >
      {PIPELINE_STAGES.map((stage, index) => {
        const isCompleted = isTerminal ? true : index < currentIndex
        const isCurrent = !isTerminal && index === currentIndex
        const isFuture = !isTerminal && index > currentIndex

        return (
          <div key={stage} className={styles.stageWrapper} role="listitem">
            <div className={styles.stepRow}>
              {/* Connector line (before the dot, except first) */}
              {index > 0 && (
                <div
                  className={[
                    styles.connector,
                    isCompleted || isCurrent ? styles.connectorFilled : styles.connectorEmpty,
                  ].join(' ')}
                  aria-hidden="true"
                />
              )}

              {/* Stage dot */}
              <div
                className={[
                  styles.dot,
                  isCompleted ? styles.dotCompleted : '',
                  isCurrent ? styles.dotCurrent : '',
                  isFuture ? styles.dotFuture : '',
                ].join(' ')}
                aria-label={
                  isCompleted
                    ? `${APPLICATION_STATUS_LABELS[stage]} (completed)`
                    : isCurrent
                      ? `${APPLICATION_STATUS_LABELS[stage]} (current)`
                      : APPLICATION_STATUS_LABELS[stage]
                }
              >
                {isCompleted && (
                  <svg
                    width="8"
                    height="8"
                    viewBox="0 0 8 8"
                    fill="none"
                    aria-hidden="true"
                    className={styles.checkmark}
                  >
                    <path
                      d="M1.5 4L3 5.5L6.5 2"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </div>
            </div>

            {/* Stage label */}
            {!compact && (
              <span
                className={[
                  styles.label,
                  isCurrent ? styles.labelCurrent : '',
                  isFuture ? styles.labelFuture : '',
                ].join(' ')}
                aria-hidden="true"
              >
                {APPLICATION_STATUS_LABELS[stage]}
              </span>
            )}
          </div>
        )
      })}

      {/* Terminal state badge */}
      {isTerminal && (
        <div className={styles.terminalBadge} data-status={status}>
          {APPLICATION_STATUS_LABELS[status]}
        </div>
      )}
    </div>
  )
}
