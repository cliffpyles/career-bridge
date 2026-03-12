/**
 * TanStack Query hooks for the Experience domain.
 * All server state interactions go through these hooks.
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '../lib/api-client'
import type {
  Experience,
  ExperienceCreate,
  ExperienceFilters,
  ExperienceUpdate,
} from '../types/experience'
import { queryKeys } from './keys'

// ─── Query functions ──────────────────────────────────────────────

function buildQueryString(filters: ExperienceFilters): string {
  const params = new URLSearchParams()
  if (filters.type) params.set('type', filters.type)
  if (filters.tag) params.set('tag', filters.tag)
  if (filters.q) params.set('q', filters.q)
  if (filters.skip !== undefined) params.set('skip', String(filters.skip))
  if (filters.limit !== undefined) params.set('limit', String(filters.limit))
  const qs = params.toString()
  return qs ? `?${qs}` : ''
}

async function fetchExperiences(filters: ExperienceFilters): Promise<Experience[]> {
  return apiClient.get<Experience[]>(`/experiences${buildQueryString(filters)}`)
}

async function fetchExperience(id: string): Promise<Experience> {
  return apiClient.get<Experience>(`/experiences/${id}`)
}

async function createExperience(data: ExperienceCreate): Promise<Experience> {
  return apiClient.post<Experience, ExperienceCreate>('/experiences', data)
}

async function updateExperience(id: string, data: ExperienceUpdate): Promise<Experience> {
  return apiClient.patch<Experience, ExperienceUpdate>(`/experiences/${id}`, data)
}

async function deleteExperience(id: string): Promise<void> {
  return apiClient.delete<void>(`/experiences/${id}`)
}

// ─── Hooks ────────────────────────────────────────────────────────

export function useExperiences(filters: ExperienceFilters = {}) {
  return useQuery({
    queryKey: queryKeys.experiences.list(filters as Record<string, unknown>),
    queryFn: () => fetchExperiences(filters),
  })
}

export function useExperience(id: string) {
  return useQuery({
    queryKey: queryKeys.experiences.detail(id),
    queryFn: () => fetchExperience(id),
    enabled: !!id,
  })
}

export function useCreateExperience() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createExperience,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.experiences.lists() })
    },
  })
}

export function useUpdateExperience() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ExperienceUpdate }) =>
      updateExperience(id, data),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.experiences.lists() })
      queryClient.setQueryData(queryKeys.experiences.detail(updated.id), updated)
    },
  })
}

export function useDeleteExperience() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteExperience,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.experiences.lists() })
    },
  })
}
