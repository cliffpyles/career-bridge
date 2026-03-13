/**
 * TanStack Query hooks for the Job domain.
 * All server state interactions go through these hooks.
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '../lib/api-client'
import type { Job, JobCreate, JobFilters, SavedJob, SavedJobCreate } from '../types/job'
import { queryKeys } from './keys'

// ─── Query functions ──────────────────────────────────────────────

function buildQueryString(filters: JobFilters): string {
  const params = new URLSearchParams()
  if (filters.q) params.set('q', filters.q)
  if (filters.location) params.set('location', filters.location)
  if (filters.remote_type) params.set('remote_type', filters.remote_type)
  if (filters.salary_min !== undefined) params.set('salary_min', String(filters.salary_min))
  if (filters.salary_max !== undefined) params.set('salary_max', String(filters.salary_max))
  if (filters.skip !== undefined) params.set('skip', String(filters.skip))
  if (filters.limit !== undefined) params.set('limit', String(filters.limit))
  const qs = params.toString()
  return qs ? `?${qs}` : ''
}

async function fetchJobs(filters: JobFilters): Promise<Job[]> {
  return apiClient.get<Job[]>(`/jobs${buildQueryString(filters)}`)
}

async function fetchJob(id: string): Promise<Job> {
  return apiClient.get<Job>(`/jobs/${id}`)
}

async function createJob(data: JobCreate): Promise<Job> {
  return apiClient.post<Job, JobCreate>('/jobs', data)
}

async function fetchSavedJobs(): Promise<SavedJob[]> {
  return apiClient.get<SavedJob[]>('/saved-jobs')
}

async function saveJob(data: SavedJobCreate): Promise<SavedJob> {
  return apiClient.post<SavedJob, SavedJobCreate>('/saved-jobs', data)
}

async function unsaveJob(jobId: string): Promise<void> {
  return apiClient.delete<void>(`/saved-jobs/${jobId}`)
}

// ─── Hooks ────────────────────────────────────────────────────────

export function useJobs(filters: JobFilters = {}) {
  return useQuery({
    queryKey: queryKeys.jobs.list(filters as Record<string, unknown>),
    queryFn: () => fetchJobs(filters),
  })
}

export function useJob(id: string) {
  return useQuery({
    queryKey: queryKeys.jobs.detail(id),
    queryFn: () => fetchJob(id),
    enabled: !!id,
  })
}

export function useCreateJob() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createJob,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.jobs.lists() })
    },
  })
}

export function useSavedJobs() {
  return useQuery({
    queryKey: queryKeys.savedJobs.list(),
    queryFn: fetchSavedJobs,
  })
}

export function useSaveJob() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: saveJob,
    onSuccess: () => {
      // Invalidate both job lists (is_saved changes) and saved-jobs list
      queryClient.invalidateQueries({ queryKey: queryKeys.jobs.all() })
      queryClient.invalidateQueries({ queryKey: queryKeys.savedJobs.all() })
    },
  })
}

export function useUnsaveJob() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: unsaveJob,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.jobs.all() })
      queryClient.invalidateQueries({ queryKey: queryKeys.savedJobs.all() })
    },
  })
}
