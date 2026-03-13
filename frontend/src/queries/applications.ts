/**
 * TanStack Query hooks for the Application domain.
 * All server state interactions go through these hooks.
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '../lib/api-client'
import type {
  Application,
  ApplicationCreate,
  ApplicationEvent,
  ApplicationEventCreate,
  ApplicationFilters,
  ApplicationUpdate,
} from '../types/application'
import { queryKeys } from './keys'

// ─── Query functions ──────────────────────────────────────────────

function buildQueryString(filters: ApplicationFilters): string {
  const params = new URLSearchParams()
  if (filters.status) params.set('status', filters.status)
  if (filters.sort) params.set('sort', filters.sort)
  if (filters.skip !== undefined) params.set('skip', String(filters.skip))
  if (filters.limit !== undefined) params.set('limit', String(filters.limit))
  const qs = params.toString()
  return qs ? `?${qs}` : ''
}

async function fetchApplications(filters: ApplicationFilters): Promise<Application[]> {
  return apiClient.get<Application[]>(`/applications${buildQueryString(filters)}`)
}

async function fetchApplication(id: string): Promise<Application> {
  return apiClient.get<Application>(`/applications/${id}`)
}

async function createApplication(data: ApplicationCreate): Promise<Application> {
  return apiClient.post<Application, ApplicationCreate>('/applications', data)
}

async function updateApplication(id: string, data: ApplicationUpdate): Promise<Application> {
  return apiClient.patch<Application, ApplicationUpdate>(`/applications/${id}`, data)
}

async function deleteApplication(id: string): Promise<void> {
  return apiClient.delete<void>(`/applications/${id}`)
}

async function fetchApplicationEvents(id: string): Promise<ApplicationEvent[]> {
  return apiClient.get<ApplicationEvent[]>(`/applications/${id}/events`)
}

async function createApplicationEvent(
  applicationId: string,
  data: ApplicationEventCreate,
): Promise<ApplicationEvent> {
  return apiClient.post<ApplicationEvent, ApplicationEventCreate>(
    `/applications/${applicationId}/events`,
    data,
  )
}

// ─── Hooks ────────────────────────────────────────────────────────

export function useApplications(filters: ApplicationFilters = {}) {
  return useQuery({
    queryKey: queryKeys.applications.list(filters as Record<string, unknown>),
    queryFn: () => fetchApplications(filters),
  })
}

export function useApplication(id: string) {
  return useQuery({
    queryKey: queryKeys.applications.detail(id),
    queryFn: () => fetchApplication(id),
    enabled: !!id,
  })
}

export function useCreateApplication() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createApplication,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.applications.lists() })
    },
  })
}

export function useUpdateApplication() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ApplicationUpdate }) =>
      updateApplication(id, data),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.applications.lists() })
      queryClient.setQueryData(queryKeys.applications.detail(updated.id), updated)
    },
  })
}

export function useDeleteApplication() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteApplication,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.applications.lists() })
    },
  })
}

export function useApplicationEvents(id: string) {
  return useQuery({
    queryKey: queryKeys.applications.events(id),
    queryFn: () => fetchApplicationEvents(id),
    enabled: !!id,
  })
}

export function useAddApplicationEvent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      applicationId,
      data,
    }: {
      applicationId: string
      data: ApplicationEventCreate
    }) => createApplicationEvent(applicationId, data),
    onSuccess: (_event, { applicationId }) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.applications.events(applicationId),
      })
    },
  })
}
