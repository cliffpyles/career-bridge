/**
 * Dashboard fixture data for tests and offline dev mode.
 *
 * Dates use relative offsets from today so tests remain valid over time.
 */
import type { DashboardSummary } from '../../types/dashboard'

function relativeDate(offsetDays: number): string {
  const d = new Date()
  d.setDate(d.getDate() + offsetDays)
  return d.toISOString().slice(0, 10)
}

export const dashboardFixture: DashboardSummary = {
  needs_attention: [
    {
      application_id: 'app-fixture-4',
      company: 'Linear',
      role: 'Senior Engineer',
      status: 'OFFER',
      next_action: 'Review and respond to offer',
      next_action_date: relativeDate(-3),
      days_until: -3,
      attention_type: 'overdue',
    },
    {
      application_id: 'app-fixture-2',
      company: 'Acme Corp',
      role: 'Staff Software Engineer',
      status: 'ONSITE',
      next_action: 'On-site visit',
      next_action_date: relativeDate(0),
      days_until: 0,
      attention_type: 'upcoming',
    },
    {
      application_id: 'app-fixture-1',
      company: 'Stripe',
      role: 'Senior Frontend Engineer',
      status: 'PHONE_SCREEN',
      next_action: 'Technical interview',
      next_action_date: relativeDate(2),
      days_until: 2,
      attention_type: 'upcoming',
    },
  ],
  active_pipeline: [
    {
      application_id: 'app-fixture-2',
      company: 'Acme Corp',
      role: 'Staff Software Engineer',
      status: 'ONSITE',
      next_action: 'On-site visit',
      next_action_date: relativeDate(0),
    },
    {
      application_id: 'app-fixture-1',
      company: 'Stripe',
      role: 'Senior Frontend Engineer',
      status: 'PHONE_SCREEN',
      next_action: 'Technical interview',
      next_action_date: relativeDate(2),
    },
    {
      application_id: 'app-fixture-4',
      company: 'Linear',
      role: 'Senior Engineer',
      status: 'OFFER',
      next_action: 'Review and respond to offer',
      next_action_date: relativeDate(-3),
    },
    {
      application_id: 'app-fixture-3',
      company: 'Figma',
      role: 'Product Engineer',
      status: 'APPLIED',
      next_action: null,
      next_action_date: null,
    },
  ],
  stats: {
    total_active: 4,
    total_archived: 1,
  },
}

export const emptyDashboardFixture: DashboardSummary = {
  needs_attention: [],
  active_pipeline: [],
  stats: {
    total_active: 0,
    total_archived: 0,
  },
}
