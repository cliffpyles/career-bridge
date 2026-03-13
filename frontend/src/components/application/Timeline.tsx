/**
 * Timeline — reverse-chronological event log for an application.
 * Each entry shows date, event type, and editable notes.
 * Reusable for Phase 9 (interview prep notes timeline).
 */
import type { ApplicationEvent } from '../../types/application'
import styles from './Timeline.module.css'

interface TimelineProps {
  events: ApplicationEvent[]
  className?: string
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00')
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function Timeline({ events, className }: TimelineProps) {
  if (events.length === 0) {
    return (
      <div className={[styles.empty, className ?? ''].join(' ')}>
        <p className={styles.emptyText}>No events logged yet.</p>
      </div>
    )
  }

  return (
    <ol
      className={[styles.timeline, className ?? ''].join(' ')}
      aria-label="Application timeline"
    >
      {events.map((event, index) => (
        <li key={event.id} className={styles.entry}>
          {/* Timeline track */}
          <div className={styles.track} aria-hidden="true">
            <div className={styles.dot} />
            {index < events.length - 1 && <div className={styles.line} />}
          </div>

          {/* Entry content */}
          <div className={styles.content}>
            <div className={styles.header}>
              <span className={styles.eventType}>{event.event_type}</span>
              <time
                className={styles.date}
                dateTime={event.event_date}
                aria-label={`Date: ${formatDate(event.event_date)}`}
              >
                {formatDate(event.event_date)}
              </time>
            </div>
            {event.notes && (
              <p className={styles.notes}>{event.notes}</p>
            )}
          </div>
        </li>
      ))}
    </ol>
  )
}
