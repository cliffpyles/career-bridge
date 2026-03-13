/**
 * JobCard — compact card for the job results list.
 * Displays role, company, salary, remote type, and match score.
 * Supports selected/active state for the split-view panel.
 */
import { Bookmark, BookmarkCheck, Building2, MapPin } from 'lucide-react'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import type { Job } from '../../types/job'
import { REMOTE_TYPE_LABELS, formatSalaryRange, getMatchScoreVariant } from '../../types/job'
import styles from './JobCard.module.css'

interface JobCardProps {
  job: Job
  isSelected?: boolean
  onSelect: (job: Job) => void
  onSave?: (job: Job) => void
  onUnsave?: (job: Job) => void
  isSavePending?: boolean
}

export function JobCard({
  job,
  isSelected = false,
  onSelect,
  onSave,
  onUnsave,
  isSavePending = false,
}: JobCardProps) {
  const salaryRange = formatSalaryRange(job.salary_min, job.salary_max)
  const scoreVariant =
    job.match_score !== null ? getMatchScoreVariant(job.match_score) : 'default'

  function handleSaveClick(e: React.MouseEvent) {
    e.stopPropagation()
    if (job.is_saved) {
      onUnsave?.(job)
    } else {
      onSave?.(job)
    }
  }

  return (
    <button
      className={[styles.card, isSelected ? styles.selected : ''].filter(Boolean).join(' ')}
      onClick={() => onSelect(job)}
      aria-pressed={isSelected}
      aria-label={`${job.title} at ${job.company}`}
    >
      <div className={styles.header}>
        <div className={styles.titleGroup}>
          <h3 className={styles.title}>{job.title}</h3>
          <div className={styles.meta}>
            <Building2 size={13} className={styles.metaIcon} aria-hidden="true" />
            <span className={styles.company}>{job.company}</span>
            {job.location && (
              <>
                <span className={styles.metaSep} aria-hidden="true">·</span>
                <MapPin size={13} className={styles.metaIcon} aria-hidden="true" />
                <span>{job.location}</span>
              </>
            )}
          </div>
        </div>

        <button
          className={[styles.saveBtn, job.is_saved ? styles.saveBtnActive : '']
            .filter(Boolean)
            .join(' ')}
          onClick={handleSaveClick}
          disabled={isSavePending}
          aria-label={job.is_saved ? 'Unsave job' : 'Save job'}
          aria-pressed={job.is_saved}
        >
          {job.is_saved ? (
            <BookmarkCheck size={16} aria-hidden="true" />
          ) : (
            <Bookmark size={16} aria-hidden="true" />
          )}
        </button>
      </div>

      <div className={styles.footer}>
        <div className={styles.tags}>
          {job.remote_type && (
            <Badge variant="default" size="sm">
              {REMOTE_TYPE_LABELS[job.remote_type]}
            </Badge>
          )}
          {salaryRange && (
            <span className={styles.salary}>{salaryRange}</span>
          )}
        </div>

        {job.match_score !== null && (
          <Badge variant={scoreVariant} size="sm" className={styles.scoreBadge}>
            {job.match_score}% match
          </Badge>
        )}
      </div>
    </button>
  )
}
