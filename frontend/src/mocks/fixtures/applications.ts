/**
 * Application test data factories and fixtures.
 */
import type { Application, ApplicationEvent } from '../../types/application'

let _appCounter = 1
let _eventCounter = 1

export function createApplication(overrides: Partial<Application> = {}): Application {
  const id = overrides.id ?? `app-${_appCounter++}`
  return {
    id,
    user_id: 'user-1',
    company: 'Acme Corp',
    role: 'Senior Software Engineer',
    url: 'https://jobs.acme.com/senior-swe',
    status: 'APPLIED',
    applied_date: '2026-03-01',
    next_action: 'Follow up on application',
    next_action_date: '2026-03-15',
    resume_id: null,
    notes: null,
    created_at: '2026-03-01T10:00:00Z',
    updated_at: '2026-03-01T10:00:00Z',
    ...overrides,
  }
}

export function createApplicationEvent(
  overrides: Partial<ApplicationEvent> = {},
): ApplicationEvent {
  const id = overrides.id ?? `event-${_eventCounter++}`
  return {
    id,
    application_id: 'app-fixture-1',
    event_type: 'Applied',
    event_date: '2026-03-01',
    notes: 'Submitted via company portal.',
    created_at: '2026-03-01T10:00:00Z',
    ...overrides,
  }
}

export const applicationFixtures: Application[] = [
  createApplication({
    id: 'app-fixture-1',
    company: 'Stripe',
    role: 'Senior Frontend Engineer',
    url: 'https://stripe.com/jobs/senior-frontend',
    status: 'PHONE_SCREEN',
    applied_date: '2026-03-03',
    next_action: 'Technical interview',
    next_action_date: '2026-03-15',
    notes: 'Strong recruiter conversation. Team seems great.',
    created_at: '2026-03-03T09:00:00Z',
    updated_at: '2026-03-10T14:00:00Z',
  }),
  createApplication({
    id: 'app-fixture-2',
    company: 'Acme Corp',
    role: 'Staff Software Engineer',
    url: 'https://acme.com/careers/staff-swe',
    status: 'ONSITE',
    applied_date: '2026-02-28',
    next_action: 'On-site visit',
    next_action_date: '2026-03-13',
    notes: 'Two rounds done. On-site scheduled.',
    created_at: '2026-02-28T10:00:00Z',
    updated_at: '2026-03-09T11:00:00Z',
  }),
  createApplication({
    id: 'app-fixture-3',
    company: 'Figma',
    role: 'Product Engineer',
    url: 'https://figma.com/careers/product-engineer',
    status: 'APPLIED',
    applied_date: '2026-03-08',
    next_action: null,
    next_action_date: null,
    notes: null,
    created_at: '2026-03-08T15:00:00Z',
    updated_at: '2026-03-08T15:00:00Z',
  }),
  createApplication({
    id: 'app-fixture-4',
    company: 'Linear',
    role: 'Senior Engineer',
    url: 'https://linear.app/careers',
    status: 'OFFER',
    applied_date: '2026-02-15',
    next_action: 'Review and respond to offer',
    next_action_date: '2026-03-10',
    notes: 'Received offer. Evaluating.',
    created_at: '2026-02-15T12:00:00Z',
    updated_at: '2026-03-07T16:00:00Z',
  }),
  createApplication({
    id: 'app-fixture-5',
    company: 'Vercel',
    role: 'Frontend Infrastructure Engineer',
    url: 'https://vercel.com/careers',
    status: 'REJECTED',
    applied_date: '2026-02-10',
    next_action: null,
    next_action_date: null,
    notes: 'Rejected after technical round. Good feedback received.',
    created_at: '2026-02-10T09:00:00Z',
    updated_at: '2026-03-01T10:00:00Z',
  }),
]

export const applicationEventFixtures: Record<string, ApplicationEvent[]> = {
  'app-fixture-1': [
    createApplicationEvent({
      id: 'event-fixture-1-3',
      application_id: 'app-fixture-1',
      event_type: 'Phone Screen',
      event_date: '2026-03-10',
      notes:
        'Spoke with Sarah, Engineering Manager. Discussed team structure and role scope. Positive signals.',
      created_at: '2026-03-10T15:00:00Z',
    }),
    createApplicationEvent({
      id: 'event-fixture-1-2',
      application_id: 'app-fixture-1',
      event_type: 'Recruiter Call',
      event_date: '2026-03-06',
      notes: 'Quick intro call with recruiter. Role is for the Payments team.',
      created_at: '2026-03-06T11:00:00Z',
    }),
    createApplicationEvent({
      id: 'event-fixture-1-1',
      application_id: 'app-fixture-1',
      event_type: 'Applied',
      event_date: '2026-03-03',
      notes: 'Submitted via company portal. Used "Full-Stack Generalist" resume.',
      created_at: '2026-03-03T09:00:00Z',
    }),
  ],
  'app-fixture-2': [
    createApplicationEvent({
      id: 'event-fixture-2-2',
      application_id: 'app-fixture-2',
      event_type: 'Technical Interview',
      event_date: '2026-03-07',
      notes: 'Systems design round. Went well. Panel of 2 engineers.',
      created_at: '2026-03-07T14:00:00Z',
    }),
    createApplicationEvent({
      id: 'event-fixture-2-1',
      application_id: 'app-fixture-2',
      event_type: 'Applied',
      event_date: '2026-02-28',
      notes: 'Submitted through LinkedIn.',
      created_at: '2026-02-28T10:00:00Z',
    }),
  ],
  'app-fixture-3': [
    createApplicationEvent({
      id: 'event-fixture-3-1',
      application_id: 'app-fixture-3',
      event_type: 'Applied',
      event_date: '2026-03-08',
      notes: 'Applied through Figma career page.',
      created_at: '2026-03-08T15:00:00Z',
    }),
  ],
  'app-fixture-4': [
    createApplicationEvent({
      id: 'event-fixture-4-3',
      application_id: 'app-fixture-4',
      event_type: 'Offer Received',
      event_date: '2026-03-07',
      notes: 'Verbal offer: $220k base + equity. Benefits package to follow.',
      created_at: '2026-03-07T17:00:00Z',
    }),
    createApplicationEvent({
      id: 'event-fixture-4-2',
      application_id: 'app-fixture-4',
      event_type: 'Final Interview',
      event_date: '2026-03-04',
      notes: 'On-site with CTO and VP Engineering. Very positive.',
      created_at: '2026-03-04T13:00:00Z',
    }),
    createApplicationEvent({
      id: 'event-fixture-4-1',
      application_id: 'app-fixture-4',
      event_type: 'Applied',
      event_date: '2026-02-15',
      notes: 'Referred by a friend on the team.',
      created_at: '2026-02-15T12:00:00Z',
    }),
  ],
}
