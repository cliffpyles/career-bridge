/**
 * MSW handlers for the Dashboard domain.
 * Used in Vitest tests and offline dev mode.
 */
import { http, HttpResponse } from 'msw'
import type { DashboardSummary } from '../../types/dashboard'
import { dashboardFixture } from '../fixtures/dashboard'

let _fixture: DashboardSummary = { ...dashboardFixture }

export function resetDashboardStore(fixture: DashboardSummary = dashboardFixture) {
  _fixture = { ...fixture }
}

export const dashboardHandlers = [
  http.get('/api/dashboard', () => {
    return HttpResponse.json(_fixture)
  }),
]
