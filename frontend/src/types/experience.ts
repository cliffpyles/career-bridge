/**
 * Shared TypeScript types for the Experience domain.
 * Mirrors the backend Pydantic schemas.
 */

export type ExperienceType =
  | 'PROJECT'
  | 'ROLE'
  | 'SKILL'
  | 'ACHIEVEMENT'
  | 'CERTIFICATION'

export const EXPERIENCE_TYPES: ExperienceType[] = [
  'PROJECT',
  'ROLE',
  'SKILL',
  'ACHIEVEMENT',
  'CERTIFICATION',
]

export const EXPERIENCE_TYPE_LABELS: Record<ExperienceType, string> = {
  PROJECT: 'Project',
  ROLE: 'Role',
  SKILL: 'Skill',
  ACHIEVEMENT: 'Achievement',
  CERTIFICATION: 'Certification',
}

export interface Experience {
  id: string
  user_id: string
  type: ExperienceType
  title: string
  organization: string | null
  start_date: string | null  // ISO date string YYYY-MM-DD
  end_date: string | null
  description: string | null
  impact_metrics: string | null
  tags: string[]
  created_at: string
  updated_at: string
}

export interface ExperienceCreate {
  type: ExperienceType
  title: string
  organization?: string | null
  start_date?: string | null
  end_date?: string | null
  description?: string | null
  impact_metrics?: string | null
  tags?: string[]
}

export interface ExperienceUpdate {
  type?: ExperienceType
  title?: string
  organization?: string | null
  start_date?: string | null
  end_date?: string | null
  description?: string | null
  impact_metrics?: string | null
  tags?: string[]
}

export interface ExperienceFilters {
  type?: ExperienceType | ''
  tag?: string
  q?: string
  skip?: number
  limit?: number
}
