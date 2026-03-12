/**
 * Resume test data factories.
 */
import type { Resume, ResumeSection, ResumeVersion } from '../../types/resume'

let _counter = 1

export function createResume(overrides: Partial<Resume> = {}): Resume {
  const id = overrides.id ?? `resume-${_counter++}`
  return {
    id,
    user_id: 'user-1',
    name: 'Full-Stack Generalist',
    version: 1,
    sections: defaultResumeSections(),
    created_at: '2026-02-01T10:00:00Z',
    updated_at: '2026-03-08T14:30:00Z',
    ...overrides,
  }
}

export function createResumeVersion(
  resumeId: string,
  overrides: Partial<ResumeVersion> = {},
): ResumeVersion {
  return {
    id: `rv-${_counter++}`,
    resume_id: resumeId,
    version: 1,
    name: 'Full-Stack Generalist',
    sections: defaultResumeSections(),
    created_at: '2026-02-01T10:00:00Z',
    ...overrides,
  }
}

function defaultResumeSections(): ResumeSection[] {
  return [
    {
      type: 'header',
      name: 'Alex Johnson',
      email: 'alex@example.com',
      phone: '555-0123',
      location: 'San Francisco, CA',
      website: 'alexjohnson.dev',
      linkedin: 'linkedin.com/in/alexjohnson',
    },
    {
      type: 'summary',
      content:
        'Full-stack engineer with 8 years of experience building scalable web applications. ' +
        'Specializes in React, TypeScript, and Python. Passionate about developer experience and product quality.',
    },
    {
      type: 'experience',
      entries: [
        {
          id: 'exp-entry-1',
          title: 'Senior Frontend Engineer',
          company: 'Stripe',
          location: 'Remote',
          start_date: '2022-03',
          end_date: undefined,
          current: true,
          bullets: [
            'Led the frontend platform team of 6 engineers, delivering a shared design system adopted by 40+ engineers.',
            'Reduced Time to Interactive by 35% through code splitting and lazy loading.',
            'Architected the new Payments Dashboard, serving 500k+ merchants.',
          ],
          experience_id: 'exp-fixture-2',
        },
        {
          id: 'exp-entry-2',
          title: 'Software Engineer',
          company: 'Acme Corp',
          location: 'San Francisco, CA',
          start_date: '2019-06',
          end_date: '2022-02',
          current: false,
          bullets: [
            'Redesigned the checkout flow, reducing cart abandonment by 23% and adding $2M ARR.',
            'Built a real-time analytics dashboard serving 10k daily active users.',
          ],
          experience_id: 'exp-fixture-1',
        },
      ],
    },
    {
      type: 'projects',
      entries: [
        {
          id: 'proj-entry-1',
          name: 'Career Bridge',
          description:
            'A career transition management app with AI-powered resume generation, application tracking, and interview prep.',
          technologies: ['React', 'TypeScript', 'FastAPI', 'PostgreSQL'],
          url: 'github.com/alexjohnson/career-bridge',
          bullets: [
            'Built a split-view resume editor with live preview and PDF export.',
            'Implemented AI-powered tailoring using OpenAI and Anthropic APIs.',
          ],
          experience_id: undefined,
        },
      ],
    },
    {
      type: 'skills',
      categories: [
        {
          name: 'Frontend',
          skills: ['React', 'TypeScript', 'CSS Modules', 'Vite', 'TanStack Query'],
        },
        {
          name: 'Backend',
          skills: ['Python', 'FastAPI', 'PostgreSQL', 'Redis', 'SQLModel'],
        },
        {
          name: 'Infrastructure',
          skills: ['GKE', 'Docker', 'Nix', 'GitHub Actions', 'Google Cloud'],
        },
      ],
    },
    {
      type: 'education',
      entries: [
        {
          id: 'edu-entry-1',
          institution: 'University of California, Berkeley',
          degree: 'B.S.',
          field: 'Electrical Engineering and Computer Science',
          start_date: '2013',
          end_date: '2017',
          gpa: '3.7',
          notes: undefined,
        },
      ],
    },
  ]
}

export const resumeFixtures: Resume[] = [
  createResume({
    id: 'resume-fixture-1',
    name: 'Full-Stack Generalist',
    version: 3,
    updated_at: '2026-03-08T14:30:00Z',
  }),
  createResume({
    id: 'resume-fixture-2',
    name: 'Frontend Specialist',
    version: 2,
    updated_at: '2026-02-20T09:15:00Z',
    sections: [
      { type: 'header', name: 'Alex Johnson', email: 'alex@example.com' },
      {
        type: 'summary',
        content:
          'Frontend-focused engineer specializing in React, TypeScript, and design systems. ' +
          'Strong track record of improving performance and developer experience.',
      },
      { type: 'experience', entries: [] },
      { type: 'projects', entries: [] },
      {
        type: 'skills',
        categories: [
          { name: 'Frontend', skills: ['React', 'TypeScript', 'CSS', 'Vite'] },
        ],
      },
      { type: 'education', entries: [] },
    ],
  }),
  createResume({
    id: 'resume-fixture-3',
    name: 'Engineering Manager',
    version: 1,
    updated_at: '2026-02-15T16:00:00Z',
    sections: [
      { type: 'header', name: 'Alex Johnson', email: 'alex@example.com' },
      {
        type: 'summary',
        content:
          'Experienced engineering leader with a track record of building and scaling high-performing teams.',
      },
      { type: 'experience', entries: [] },
      { type: 'projects', entries: [] },
      { type: 'skills', categories: [] },
      { type: 'education', entries: [] },
    ],
  }),
]

export const resumeVersionFixtures: Record<string, ResumeVersion[]> = {
  'resume-fixture-1': [
    createResumeVersion('resume-fixture-1', {
      id: 'rv-fixture-1-3',
      version: 3,
      name: 'Full-Stack Generalist',
      created_at: '2026-03-08T14:30:00Z',
    }),
    createResumeVersion('resume-fixture-1', {
      id: 'rv-fixture-1-2',
      version: 2,
      name: 'Full-Stack Generalist',
      created_at: '2026-02-20T11:00:00Z',
    }),
    createResumeVersion('resume-fixture-1', {
      id: 'rv-fixture-1-1',
      version: 1,
      name: 'Full-Stack Generalist',
      created_at: '2026-02-01T10:00:00Z',
    }),
  ],
}
