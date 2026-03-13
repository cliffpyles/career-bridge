/**
 * JobDetail — full job detail panel shown in the split-view right pane.
 * Displays full job description, match score, and action buttons.
 */
import {
  ArrowUpRight,
  Bookmark,
  BookmarkCheck,
  Briefcase,
  Building2,
  Calendar,
  DollarSign,
  MapPin,
} from 'lucide-react'
import { useNavigate } from 'react-router'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { Skeleton } from '../ui/Skeleton'
import type { Job } from '../../types/job'
import {
  REMOTE_TYPE_LABELS,
  formatSalaryRange,
  getMatchScoreVariant,
} from '../../types/job'
import styles from './JobDetail.module.css'

interface JobDetailProps {
  job: Job
  onSave?: (job: Job) => void
  onUnsave?: (job: Job) => void
  isSavePending?: boolean
}

function formatPostedDate(dateStr: string | null): string {
  if (!dateStr) return ''
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}

function formatDescription(text: string): string[] {
  // Split on double newlines to get paragraphs
  return text.split(/\n\n+/).filter(Boolean)
}

function renderParagraphs(description: string) {
  const paragraphs = formatDescription(description)
  return paragraphs.map((para, i) => {
    // Treat lines starting with ** as bold headings
    if (para.startsWith('**') && para.endsWith('**')) {
      return (
        <h4 key={i} className={styles.sectionHeading}>
          {para.replace(/\*\*/g, '')}
        </h4>
      )
    }
    // Treat lines starting with - as list items
    const lines = para.split('\n')
    const isList = lines.every((l) => l.startsWith('-'))
    if (isList) {
      return (
        <ul key={i} className={styles.list}>
          {lines.map((line, j) => (
            <li key={j} className={styles.listItem}>
              {line.replace(/^-\s*/, '')}
            </li>
          ))}
        </ul>
      )
    }
    return (
      <p key={i} className={styles.paragraph}>
        {para}
      </p>
    )
  })
}

export function JobDetail({ job, onSave, onUnsave, isSavePending = false }: JobDetailProps) {
  const navigate = useNavigate()
  const salaryRange = formatSalaryRange(job.salary_min, job.salary_max)
  const scoreVariant =
    job.match_score !== null ? getMatchScoreVariant(job.match_score) : 'default'

  function handleStartApplication() {
    navigate('/applications', {
      state: {
        prefill: {
          company: job.company,
          role: job.title,
          url: job.url ?? '',
        },
      },
    })
  }

  function handleGenerateResume() {
    navigate('/resumes', {
      state: {
        generateFor: {
          description: job.description ?? '',
          jobTitle: job.title,
          company: job.company,
        },
      },
    })
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h2 className={styles.title}>{job.title}</h2>
          <div className={styles.company}>
            <Building2 size={15} className={styles.metaIcon} aria-hidden="true" />
            <span>{job.company}</span>
          </div>
        </div>

        {job.match_score !== null && (
          <div className={styles.matchScore} aria-label={`Match score: ${job.match_score}%`}>
            <Badge variant={scoreVariant} size="md" className={styles.matchBadge}>
              {job.match_score}% match
            </Badge>
          </div>
        )}
      </div>

      {/* Meta row */}
      <div className={styles.metaRow}>
        {job.location && (
          <span className={styles.metaItem}>
            <MapPin size={14} aria-hidden="true" />
            {job.location}
          </span>
        )}
        {job.remote_type && (
          <span className={styles.metaItem}>
            <Briefcase size={14} aria-hidden="true" />
            {REMOTE_TYPE_LABELS[job.remote_type]}
          </span>
        )}
        {salaryRange && (
          <span className={styles.metaItem}>
            <DollarSign size={14} aria-hidden="true" />
            {salaryRange}
          </span>
        )}
        {job.posted_date && (
          <span className={styles.metaItem}>
            <Calendar size={14} aria-hidden="true" />
            Posted {formatPostedDate(job.posted_date)}
          </span>
        )}
      </div>

      {/* Action buttons */}
      <div className={styles.actions}>
        <Button
          variant="primary"
          size="sm"
          onClick={handleStartApplication}
        >
          Start Application
        </Button>

        <Button
          variant="secondary"
          size="sm"
          onClick={handleGenerateResume}
        >
          Generate Resume
        </Button>

        <Button
          variant={job.is_saved ? 'ghost' : 'secondary'}
          size="sm"
          icon={job.is_saved ? <BookmarkCheck size={15} /> : <Bookmark size={15} />}
          onClick={() => (job.is_saved ? onUnsave?.(job) : onSave?.(job))}
          disabled={isSavePending}
          aria-pressed={job.is_saved}
          aria-label={job.is_saved ? 'Unsave job' : 'Save job'}
        >
          {job.is_saved ? 'Saved' : 'Save'}
        </Button>

        {job.url && (
          <a
            href={job.url}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.externalLink}
            aria-label="Open full job posting"
          >
            <ArrowUpRight size={15} aria-hidden="true" />
            View posting
          </a>
        )}
      </div>

      <hr className={styles.divider} aria-hidden="true" />

      {/* Job description */}
      {job.description ? (
        <div className={styles.description} aria-label="Job description">
          {renderParagraphs(job.description)}
        </div>
      ) : (
        <p className={styles.noDescription}>No description available.</p>
      )}
    </div>
  )
}

export function JobDetailSkeleton() {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <Skeleton height={28} width="70%" />
          <Skeleton height={18} width="40%" style={{ marginTop: 8 }} />
        </div>
        <Skeleton height={26} width={90} />
      </div>
      <div className={styles.metaRow}>
        <Skeleton height={16} width={120} />
        <Skeleton height={16} width={80} />
        <Skeleton height={16} width={100} />
      </div>
      <div className={styles.actions}>
        <Skeleton height={34} width={140} />
        <Skeleton height={34} width={140} />
        <Skeleton height={34} width={80} />
      </div>
      <hr className={styles.divider} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <Skeleton height={16} />
        <Skeleton height={16} width="90%" />
        <Skeleton height={16} width="80%" />
        <Skeleton height={16} />
        <Skeleton height={16} width="85%" />
      </div>
    </div>
  )
}
