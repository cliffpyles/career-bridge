/**
 * TanStack Query hooks for the Resume domain.
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '../lib/api-client'
import type {
  Resume,
  ResumeCreate,
  ResumeUpdate,
  ResumeVersion,
} from '../types/resume'
import { queryKeys } from './keys'

// ── Query functions ───────────────────────────────────────────────────────

async function fetchResumes(): Promise<Resume[]> {
  return apiClient.get<Resume[]>('/resumes')
}

async function fetchResume(id: string): Promise<Resume> {
  return apiClient.get<Resume>(`/resumes/${id}`)
}

async function createResume(data: ResumeCreate): Promise<Resume> {
  return apiClient.post<Resume, ResumeCreate>('/resumes', data)
}

async function updateResume(id: string, data: ResumeUpdate): Promise<Resume> {
  return apiClient.patch<Resume, ResumeUpdate>(`/resumes/${id}`, data)
}

async function deleteResume(id: string): Promise<void> {
  return apiClient.delete<void>(`/resumes/${id}`)
}

async function fetchResumeVersions(resumeId: string): Promise<ResumeVersion[]> {
  return apiClient.get<ResumeVersion[]>(`/resumes/${resumeId}/versions`)
}

async function restoreResumeVersion(
  resumeId: string,
  versionId: string,
): Promise<Resume> {
  return apiClient.post<Resume, Record<string, never>>(
    `/resumes/${resumeId}/versions/${versionId}/restore`,
    {},
  )
}

async function exportResume(
  resumeId: string,
  format: 'pdf' | 'txt',
): Promise<Blob> {
  const response = await fetch(`/api/resumes/${resumeId}/export?format=${format}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${localStorage.getItem('auth_token') ?? ''}` },
  })
  if (!response.ok) {
    throw new Error(`Export failed: ${response.statusText}`)
  }
  return response.blob()
}

// ── Hooks ─────────────────────────────────────────────────────────────────

export function useResumes() {
  return useQuery({
    queryKey: queryKeys.resumes.list(),
    queryFn: fetchResumes,
  })
}

export function useResume(id: string) {
  return useQuery({
    queryKey: queryKeys.resumes.detail(id),
    queryFn: () => fetchResume(id),
    enabled: !!id,
  })
}

export function useCreateResume() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createResume,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.resumes.lists() })
    },
  })
}

export function useUpdateResume() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ResumeUpdate }) =>
      updateResume(id, data),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.resumes.lists() })
      queryClient.setQueryData(queryKeys.resumes.detail(updated.id), updated)
      // Invalidate versions since a new one was created
      queryClient.invalidateQueries({ queryKey: queryKeys.resumes.versions(updated.id) })
    },
  })
}

export function useDeleteResume() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteResume,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.resumes.lists() })
    },
  })
}

export function useResumeVersions(resumeId: string) {
  return useQuery({
    queryKey: queryKeys.resumes.versions(resumeId),
    queryFn: () => fetchResumeVersions(resumeId),
    enabled: !!resumeId,
  })
}

export function useRestoreResumeVersion() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ resumeId, versionId }: { resumeId: string; versionId: string }) =>
      restoreResumeVersion(resumeId, versionId),
    onSuccess: (restored) => {
      queryClient.setQueryData(queryKeys.resumes.detail(restored.id), restored)
      queryClient.invalidateQueries({ queryKey: queryKeys.resumes.versions(restored.id) })
      queryClient.invalidateQueries({ queryKey: queryKeys.resumes.lists() })
    },
  })
}

export function useExportResume() {
  return useMutation({
    mutationFn: ({ id, format }: { id: string; format: 'pdf' | 'txt' }) =>
      exportResume(id, format),
  })
}
