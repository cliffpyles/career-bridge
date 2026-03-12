/**
 * ExperienceCard — displays a single experience library entry.
 * Reuses Card and Badge from the UI component library.
 */
import { Briefcase, Award, Star, GraduationCap, Zap, MoreHorizontal, Pencil } from 'lucide-react'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'
import type { Experience, ExperienceType } from '../../types/experience'
import { EXPERIENCE_TYPE_LABELS } from '../../types/experience'
import styles from './ExperienceCard.module.css'

function ExperienceTypeIcon({ type }: { type: ExperienceType }) {
  const iconProps = { size: 14, 'aria-hidden': true }
  switch (type) {
    case 'PROJECT':
      return <Zap {...iconProps} />
    case 'ROLE':
      return <Briefcase {...iconProps} />
    case 'SKILL':
      return <Star {...iconProps} />
    case 'ACHIEVEMENT':
      return <Award {...iconProps} />
    case 'CERTIFICATION':
      return <GraduationCap {...iconProps} />
  }
}

function formatDateRange(start: string | null, end: string | null): string {
  if (!start && !end) return ''
  const fmt = (d: string) => {
    const [year] = d.split('-')
    return year
  }
  if (start && end) return `${fmt(start)} – ${fmt(end)}`
  if (start) return `${fmt(start)} – Present`
  if (end) return fmt(end)
  return ''
}

export interface ExperienceCardProps {
  experience: Experience
  onEdit: (experience: Experience) => void
  onDelete: (experience: Experience) => void
}

export function ExperienceCard({ experience, onEdit, onDelete }: ExperienceCardProps) {
  const dateRange = formatDateRange(experience.start_date, experience.end_date)

  return (
    <Card hoverable className={styles.card} data-testid="experience-card">
      <div className={styles.header}>
        <div className={styles.typeBadgeRow}>
          <span className={styles.typeBadge}>
            <ExperienceTypeIcon type={experience.type} />
            {EXPERIENCE_TYPE_LABELS[experience.type]}
          </span>
        </div>

        <div className={styles.actions}>
          <Button
            variant="ghost"
            size="sm"
            icon={<Pencil size={14} />}
            onClick={() => onEdit(experience)}
            aria-label={`Edit ${experience.title}`}
          />
          <Button
            variant="ghost"
            size="sm"
            icon={<MoreHorizontal size={14} />}
            onClick={() => onDelete(experience)}
            aria-label={`Delete ${experience.title}`}
            data-testid="experience-delete-btn"
          />
        </div>
      </div>

      <h3 className={styles.title}>{experience.title}</h3>

      {(experience.organization || dateRange) && (
        <p className={styles.meta}>
          {experience.organization && (
            <span className={styles.organization}>{experience.organization}</span>
          )}
          {experience.organization && dateRange && (
            <span className={styles.metaSeparator} aria-hidden="true">·</span>
          )}
          {dateRange && <span className={styles.dateRange}>{dateRange}</span>}
        </p>
      )}

      {experience.description && (
        <p className={styles.description}>{experience.description}</p>
      )}

      {experience.impact_metrics && (
        <p className={styles.impact}>{experience.impact_metrics}</p>
      )}

      {experience.tags.length > 0 && (
        <div className={styles.tags} role="list" aria-label="Tags">
          {experience.tags.map((tag) => (
            <Badge key={tag} variant="default" size="sm" role="listitem">
              {tag}
            </Badge>
          ))}
        </div>
      )}
    </Card>
  )
}
