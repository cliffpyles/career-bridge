/**
 * Shared TypeScript types for the Application domain.
 * Mirrors the backend Pydantic schemas.
 */

export type ApplicationStatus =
  | 'APPLIED'
  | 'PHONE_SCREEN'
  | 'TECHNICAL'
  | 'ONSITE'
  | 'OFFER'
  | 'ACCEPTED'
  | 'REJECTED'

export const APPLICATION_STATUSES: ApplicationStatus[] = [
  'APPLIED',
  'PHONE_SCREEN',
  'TECHNICAL',
  'ONSITE',
  'OFFER',
  'ACCEPTED',
  'REJECTED',
]

export const APPLICATION_STATUS_LABELS: Record<ApplicationStatus, string> = {
  APPLIED: 'Applied',
  PHONE_SCREEN: 'Phone Screen',
  TECHNICAL: 'Technical',
  ONSITE: 'On-site',
  OFFER: 'Offer',
  ACCEPTED: 'Accepted',
  REJECTED: 'Rejected',
}

/** Statuses that represent an active / in-progress pipeline (not terminal) */
export const ACTIVE_STATUSES: ApplicationStatus[] = [
  'APPLIED',
  'PHONE_SCREEN',
  'TECHNICAL',
  'ONSITE',
  'OFFER',
]

/** Terminal statuses */
export const TERMINAL_STATUSES: ApplicationStatus[] = ['ACCEPTED', 'REJECTED']

/** Pipeline stages shown in the step indicator (excludes terminal states) */
export const PIPELINE_STAGES: ApplicationStatus[] = [
  'APPLIED',
  'PHONE_SCREEN',
  'TECHNICAL',
  'ONSITE',
  'OFFER',
]

export interface Application {
  id: string
  user_id: string
  company: string
  role: string
  url: string | null
  status: ApplicationStatus
  applied_date: string // ISO date string YYYY-MM-DD
  next_action: string | null
  next_action_date: string | null
  resume_id: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface ApplicationCreate {
  company: string
  role: string
  url?: string | null
  status?: ApplicationStatus
  applied_date: string
  next_action?: string | null
  next_action_date?: string | null
  resume_id?: string | null
  notes?: string | null
}

export interface ApplicationUpdate {
  company?: string
  role?: string
  url?: string | null
  status?: ApplicationStatus
  applied_date?: string
  next_action?: string | null
  next_action_date?: string | null
  resume_id?: string | null
  notes?: string | null
}

export interface ApplicationFilters {
  status?: ApplicationStatus | ''
  sort?: 'recent' | 'next_action'
  skip?: number
  limit?: number
}

export interface ApplicationEvent {
  id: string
  application_id: string
  event_type: string
  event_date: string // ISO date string YYYY-MM-DD
  notes: string | null
  created_at: string
}

export interface ApplicationEventCreate {
  event_type: string
  event_date: string
  notes?: string | null
}
