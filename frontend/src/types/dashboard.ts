/**
 * Shared TypeScript types for the Dashboard domain.
 * Mirrors the backend Pydantic schemas.
 */

import type { ApplicationStatus } from './application'

export type AttentionType = 'overdue' | 'upcoming'

export interface AttentionItem {
  application_id: string
  company: string
  role: string
  status: ApplicationStatus
  next_action: string | null
  next_action_date: string | null // ISO date string YYYY-MM-DD
  days_until: number // negative = overdue
  attention_type: AttentionType
}

export interface PipelineItem {
  application_id: string
  company: string
  role: string
  status: ApplicationStatus
  next_action: string | null
  next_action_date: string | null
}

export interface DashboardStats {
  total_active: number
  total_archived: number
}

export interface DashboardSummary {
  needs_attention: AttentionItem[]
  active_pipeline: PipelineItem[]
  stats: DashboardStats
}
