/**
 * ResumeCard — displays a single resume in the library grid.
 */
import { FileText, Pencil, Trash2 } from 'lucide-react'
import { useNavigate } from 'react-router'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'
import type { Resume } from '../../types/resume'
import styles from './ResumeCard.module.css'

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export interface ResumeCardProps {
  resume: Resume
  onDelete: (resume: Resume) => void
}

export function ResumeCard({ resume, onDelete }: ResumeCardProps) {
  const navigate = useNavigate()

  return (
    <Card
      hoverable
      className={styles.card}
      data-testid="resume-card"
      onClick={() => navigate(`/resumes/${resume.id}`)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          navigate(`/resumes/${resume.id}`)
        }
      }}
    >
      <div className={styles.iconArea}>
        <FileText size={32} className={styles.icon} aria-hidden />
      </div>

      <div className={styles.body}>
        <h3 className={styles.name}>{resume.name}</h3>
        <p className={styles.meta}>
          <span className={styles.version}>v{resume.version}</span>
          <span className={styles.separator} aria-hidden>·</span>
          <span className={styles.date}>{formatDate(resume.updated_at)}</span>
        </p>
      </div>

      <div className={styles.actions} onClick={(e) => e.stopPropagation()}>
        <Button
          variant="secondary"
          size="sm"
          icon={<Pencil size={14} />}
          onClick={() => navigate(`/resumes/${resume.id}`)}
          aria-label={`Edit ${resume.name}`}
        >
          Edit
        </Button>
        <Button
          variant="ghost"
          size="sm"
          icon={<Trash2 size={14} />}
          onClick={() => onDelete(resume)}
          aria-label={`Delete ${resume.name}`}
          data-testid="resume-delete-btn"
        />
      </div>
    </Card>
  )
}
