/**
 * TanStack Query hooks for the Dashboard domain.
 */
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '../lib/api-client'
import type { DashboardSummary } from '../types/dashboard'
import { queryKeys } from './keys'

async function fetchDashboard(): Promise<DashboardSummary> {
  return apiClient.get<DashboardSummary>('/dashboard')
}

export function useDashboard() {
  return useQuery({
    queryKey: queryKeys.dashboard.summary(),
    queryFn: fetchDashboard,
  })
}
