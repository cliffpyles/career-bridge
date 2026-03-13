/**
 * ApplicationDetail — slide-over panel showing full application details.
 * Shows pipeline visualization, timeline, linked resume, and event entry form.
 */
import { type FormEvent, useState } from 'react'
import { ExternalLink, FileText } from 'lucide-react'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { SlideOver } from '../ui/SlideOver'
import { Skeleton } from '../ui/Skeleton'
import { TextArea } from '../ui/TextArea'
import { PipelineIndicator } from './PipelineIndicator'
import { Timeline } from './Timeline'
import {
  useApplicationEvents,
  useAddApplicationEvent,
} from '../../queries/applications'
import { useResumes } from '../../queries/resumes'
import type { Application } from '../../types/application'
import { APPLICATION_STATUS_LABELS } from '../../types/application'
import styles from './ApplicationDetail.module.css'

function formatDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00')
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

interface AddEventFormProps {
  applicationId: string
  onSuccess: () => void
}

function AddEventForm({ applicationId, onSuccess }: AddEventFormProps) {
  const [eventType, setEventType] = useState('')
  const [eventDate, setEventDate] = useState(new Date().toISOString().slice(0, 10))
  const [notes, setNotes] = useState('')
  const [error, setError] = useState<string | null>(null)

  const addEventMutation = useAddApplicationEvent()

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!eventType.trim()) {
      setError('Event type is required.')
      return
    }
    if (!eventDate) {
      setError('Date is required.')
      return
    }
    setError(null)

    try {
      await addEventMutation.mutateAsync({
        applicationId,
        data: {
          event_type: eventType.trim(),
          event_date: eventDate,
          notes: notes.trim() || null,
        },
      })
      setEventType('')
      setNotes('')
      setEventDate(new Date().toISOString().slice(0, 10))
      onSuccess()
    } catch {
      setError("Couldn't add the event. Try again.")
    }
  }

  return (
    <form onSubmit={handleSubmit} className={styles.addEventForm} noValidate>
      <h4 className={styles.addEventTitle}>Log an event</h4>
      {error && (
        <p className={styles.formError} role="alert">
          {error}
        </p>
      )}
      <div className={styles.addEventRow}>
        <Input
          label="Event type"
          value={eventType}
          onChange={(e) => {
            setEventType(e.target.value)
            if (error) setError(null)
          }}
          placeholder="e.g. Phone Screen, Technical Interview, Offer Received"
          required
        />
        <Input
          label="Date"
          type="date"
          value={eventDate}
          onChange={(e) => setEventDate(e.target.value)}
          required
        />
      </div>
      <TextArea
        label="Notes"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        rows={2}
        placeholder="What happened? Key takeaways, people met, signals received…"
      />
      <div className={styles.addEventActions}>
        <Button
          type="submit"
          variant="secondary"
          size="sm"
          loading={addEventMutation.isPending}
        >
          Log event
        </Button>
      </div>
    </form>
  )
}

interface ApplicationDetailProps {
  open: boolean
  onClose: () => void
  application: Application | null
  onEdit: (app: Application) => void
}

export function ApplicationDetail({
  open,
  onClose,
  application,
  onEdit,
}: ApplicationDetailProps) {
  const [showEventForm, setShowEventForm] = useState(false)

  const { data: events, isLoading: eventsLoading } = useApplicationEvents(
    application?.id ?? '',
  )
  const { data: resumes } = useResumes()

  const linkedResume = resumes?.find((r) => r.id === application?.resume_id)

  function handleEventAdded() {
    setShowEventForm(false)
  }

  if (!application) return null

  const hasUpcomingAction =
    application.next_action || application.next_action_date

  return (
    <SlideOver
      open={open}
      onClose={onClose}
      footer={
        <div className={styles.footer}>
          <Button variant="secondary" size="sm" onClick={onClose}>
            Close
          </Button>
          <Button variant="secondary" size="sm" onClick={() => onEdit(application)}>
            Edit
          </Button>
        </div>
      }
    >
      <div className={styles.detail}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerText}>
            <h2 className={styles.role}>{application.role}</h2>
            <p className={styles.company}>{application.company}</p>
            <p className={styles.appliedDate}>
              Applied {formatDate(application.applied_date)}
            </p>
          </div>
          {application.url && (
            <a
              href={application.url}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.externalLink}
              aria-label="Open job posting"
            >
              <ExternalLink size={15} />
              <span>View posting</span>
            </a>
          )}
        </div>

        {/* Pipeline */}
        <section className={styles.section} aria-labelledby="pipeline-heading">
          <h3 id="pipeline-heading" className={styles.sectionLabel}>
            Pipeline
          </h3>
          <PipelineIndicator status={application.status} />
        </section>

        <div className={styles.divider} aria-hidden="true" />

        {/* Next action */}
        {hasUpcomingAction && (
          <>
            <section className={styles.section} aria-labelledby="next-action-heading">
              <h3 id="next-action-heading" className={styles.sectionLabel}>
                Next action
              </h3>
              <div className={styles.nextAction}>
                {application.next_action && (
                  <p className={styles.nextActionText}>{application.next_action}</p>
                )}
                {application.next_action_date && (
                  <time
                    className={styles.nextActionDate}
                    dateTime={application.next_action_date}
                  >
                    {formatDate(application.next_action_date)}
                  </time>
                )}
              </div>
            </section>
            <div className={styles.divider} aria-hidden="true" />
          </>
        )}

        {/* Notes */}
        {application.notes && (
          <>
            <section className={styles.section} aria-labelledby="notes-heading">
              <h3 id="notes-heading" className={styles.sectionLabel}>
                Notes
              </h3>
              <p className={styles.notesText}>{application.notes}</p>
            </section>
            <div className={styles.divider} aria-hidden="true" />
          </>
        )}

        {/* Timeline */}
        <section className={styles.section} aria-labelledby="timeline-heading">
          <div className={styles.timelineHeader}>
            <h3 id="timeline-heading" className={styles.sectionLabel}>
              Timeline
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowEventForm((v) => !v)}
              aria-expanded={showEventForm}
            >
              {showEventForm ? 'Cancel' : '+ Log event'}
            </Button>
          </div>

          {showEventForm && (
            <AddEventForm
              applicationId={application.id}
              onSuccess={handleEventAdded}
            />
          )}

          {eventsLoading ? (
            <div className={styles.eventsSkeleton}>
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className={styles.skeletonEntry}>
                  <Skeleton variant="rect" style={{ width: '100%', height: '60px' }} />
                </div>
              ))}
            </div>
          ) : (
            <Timeline events={events ?? []} />
          )}
        </section>

        <div className={styles.divider} aria-hidden="true" />

        {/* Linked items */}
        <section className={styles.section} aria-labelledby="linked-heading">
          <h3 id="linked-heading" className={styles.sectionLabel}>
            Linked items
          </h3>
          {linkedResume ? (
            <div className={styles.linkedItem}>
              <FileText size={15} className={styles.linkedIcon} aria-hidden="true" />
              <span className={styles.linkedLabel}>
                Resume: {linkedResume.name} v{linkedResume.version}
              </span>
            </div>
          ) : (
            <p className={styles.noLinkedItems}>No resume linked to this application.</p>
          )}
        </section>

        {/* Status label (bottom) */}
        <div className={styles.statusFooter}>
          <span className={styles.statusLabel} data-status={application.status}>
            {APPLICATION_STATUS_LABELS[application.status]}
          </span>
        </div>
      </div>
    </SlideOver>
  )
}
