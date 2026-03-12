/**
 * Experience test data factories.
 */
import type { Experience, ExperienceType } from '../../types/experience'

let _counter = 1

export function createExperience(overrides: Partial<Experience> = {}): Experience {
  const id = overrides.id ?? `exp-${_counter++}`
  return {
    id,
    user_id: 'user-1',
    type: 'PROJECT' as ExperienceType,
    title: 'Sample Project',
    organization: 'Acme Corp',
    start_date: '2024-01-01',
    end_date: '2024-06-30',
    description: 'Led a team of 3 engineers to redesign the checkout flow. Reduced cart abandonment by 23%.',
    impact_metrics: '23% reduction in cart abandonment, +$2M ARR',
    tags: ['react', 'typescript'],
    created_at: '2026-01-15T10:00:00Z',
    updated_at: '2026-02-01T10:00:00Z',
    ...overrides,
  }
}

export const experienceFixtures: Experience[] = [
  createExperience({
    id: 'exp-fixture-1',
    type: 'PROJECT',
    title: 'Redesigned checkout flow',
    organization: 'Acme Corp',
    description: 'Reduced cart abandonment by 23%. Led a team of 3 engineers. React, TypeScript, A/B testing.',
    tags: ['react', 'typescript', 'a/b testing'],
  }),
  createExperience({
    id: 'exp-fixture-2',
    type: 'ROLE',
    title: 'Senior Frontend Engineer',
    organization: 'Stripe',
    start_date: '2022-03-01',
    end_date: '2025-01-01',
    description: 'Led the frontend platform team. Built the design system used by 40+ engineers.',
    tags: ['leadership', 'react', 'design systems'],
  }),
  createExperience({
    id: 'exp-fixture-3',
    type: 'SKILL',
    title: 'System Design',
    organization: null,
    start_date: null,
    end_date: null,
    description: 'Distributed systems, microservices, event-driven architecture.',
    impact_metrics: null,
    tags: ['architecture', 'distributed systems'],
  }),
  createExperience({
    id: 'exp-fixture-4',
    type: 'ACHIEVEMENT',
    title: 'Reduced page load time by 60%',
    organization: 'Acme Corp',
    description: 'Through code splitting, lazy loading, and CDN optimization.',
    impact_metrics: '60% load time reduction, +15 NPS points',
    tags: ['performance', 'optimization'],
  }),
  createExperience({
    id: 'exp-fixture-5',
    type: 'CERTIFICATION',
    title: 'AWS Solutions Architect Associate',
    organization: 'Amazon Web Services',
    start_date: '2023-06-01',
    end_date: null,
    description: 'SAA-C03 certification covering core AWS services and architecture patterns.',
    tags: ['aws', 'cloud'],
  }),
]
