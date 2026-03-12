/**
 * Centralized query key factory.
 * All TanStack Query cache keys are defined here for consistent invalidation.
 *
 * Usage:
 *   queryClient.invalidateQueries({ queryKey: queryKeys.experiences.all() })
 *   queryClient.invalidateQueries({ queryKey: queryKeys.experiences.detail(id) })
 */

export const queryKeys = {
  // ─── Health ──────────────────────────────────────────────────────
  health: {
    all: () => ['health'] as const,
  },

  // ─── Auth / Current user ─────────────────────────────────────────
  auth: {
    me: () => ['auth', 'me'] as const,
  },

  // ─── Experiences (Phase 2) ────────────────────────────────────────
  experiences: {
    all: () => ['experiences'] as const,
    lists: () => [...queryKeys.experiences.all(), 'list'] as const,
    list: (filters?: Record<string, unknown>) =>
      [...queryKeys.experiences.lists(), filters ?? {}] as const,
    details: () => [...queryKeys.experiences.all(), 'detail'] as const,
    detail: (id: string) => [...queryKeys.experiences.details(), id] as const,
  },

  // ─── Resumes (Phase 3) ────────────────────────────────────────────
  resumes: {
    all: () => ['resumes'] as const,
    lists: () => [...queryKeys.resumes.all(), 'list'] as const,
    list: () => [...queryKeys.resumes.lists()] as const,
    details: () => [...queryKeys.resumes.all(), 'detail'] as const,
    detail: (id: string) => [...queryKeys.resumes.details(), id] as const,
    versions: (id: string) => [...queryKeys.resumes.detail(id), 'versions'] as const,
  },

  // ─── Applications (Phase 4) ──────────────────────────────────────
  applications: {
    all: () => ['applications'] as const,
    lists: () => [...queryKeys.applications.all(), 'list'] as const,
    list: (filters?: Record<string, unknown>) =>
      [...queryKeys.applications.lists(), filters ?? {}] as const,
    details: () => [...queryKeys.applications.all(), 'detail'] as const,
    detail: (id: string) => [...queryKeys.applications.details(), id] as const,
    events: (id: string) => [...queryKeys.applications.detail(id), 'events'] as const,
  },

  // ─── Dashboard (Phase 5) ─────────────────────────────────────────
  dashboard: {
    all: () => ['dashboard'] as const,
    summary: () => [...queryKeys.dashboard.all(), 'summary'] as const,
  },

  // ─── Jobs (Phase 8) ──────────────────────────────────────────────
  jobs: {
    all: () => ['jobs'] as const,
    lists: () => [...queryKeys.jobs.all(), 'list'] as const,
    list: (filters?: Record<string, unknown>) =>
      [...queryKeys.jobs.lists(), filters ?? {}] as const,
    details: () => [...queryKeys.jobs.all(), 'detail'] as const,
    detail: (id: string) => [...queryKeys.jobs.details(), id] as const,
  },

  savedJobs: {
    all: () => ['saved-jobs'] as const,
    list: () => [...queryKeys.savedJobs.all(), 'list'] as const,
  },

  // ─── Alerts (Phase 10) ───────────────────────────────────────────
  alerts: {
    all: () => ['alerts'] as const,
    list: () => [...queryKeys.alerts.all(), 'list'] as const,
  },

  notifications: {
    all: () => ['notifications'] as const,
    list: () => [...queryKeys.notifications.all(), 'list'] as const,
    unreadCount: () => [...queryKeys.notifications.all(), 'unread-count'] as const,
  },

  // ─── Interview Prep (Phase 9) ─────────────────────────────────────
  interviewPreps: {
    all: () => ['interview-preps'] as const,
    lists: () => [...queryKeys.interviewPreps.all(), 'list'] as const,
    list: () => [...queryKeys.interviewPreps.lists()] as const,
    details: () => [...queryKeys.interviewPreps.all(), 'detail'] as const,
    detail: (id: string) => [...queryKeys.interviewPreps.details(), id] as const,
  },
}
