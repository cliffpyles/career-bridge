/**
 * Shared TypeScript types for the Job domain.
 * Mirrors the backend Pydantic schemas.
 */

export type RemoteType = 'REMOTE' | 'HYBRID' | 'ONSITE'

export const REMOTE_TYPE_LABELS: Record<RemoteType, string> = {
  REMOTE: 'Remote',
  HYBRID: 'Hybrid',
  ONSITE: 'On-site',
}

export interface Job {
  id: string
  title: string
  company: string
  location: string | null
  remote_type: RemoteType | null
  salary_min: number | null
  salary_max: number | null
  description: string | null
  url: string | null
  source: string | null
  posted_date: string | null // ISO date string YYYY-MM-DD
  created_at: string
  // Computed fields — populated by the API per authenticated user
  match_score: number | null
  is_saved: boolean
}

export interface JobCreate {
  title: string
  company: string
  location?: string | null
  remote_type?: RemoteType | null
  salary_min?: number | null
  salary_max?: number | null
  description?: string | null
  url?: string | null
  source?: string | null
  posted_date?: string | null
}

export interface SavedJob {
  id: string
  user_id: string
  job_id: string
  saved_at: string
  notes: string | null
  job: Job
}

export interface SavedJobCreate {
  job_id: string
  notes?: string | null
}

export interface JobFilters {
  q?: string
  location?: string
  remote_type?: RemoteType | ''
  salary_min?: number
  salary_max?: number
  skip?: number
  limit?: number
}

/** Threshold for match score color coding per design spec */
export function getMatchScoreVariant(score: number): 'success' | 'warning' | 'default' {
  if (score >= 85) return 'success'
  if (score >= 70) return 'warning'
  return 'default'
}

/** Format salary range as a compact string, e.g. "$180–220k" */
export function formatSalaryRange(min: number | null, max: number | null): string {
  if (!min && !max) return ''
  const fmt = (n: number) => `$${Math.round(n / 1000)}k`
  if (min && max) return `${fmt(min)}–${fmt(max)}`
  if (min) return `${fmt(min)}+`
  if (max) return `Up to ${fmt(max)}`
  return ''
}
