/**
 * Job test data factories and fixtures.
 */
import type { Job, SavedJob } from '../../types/job'

let _jobCounter = 1
let _savedJobCounter = 1

export function createJob(overrides: Partial<Job> = {}): Job {
  const id = overrides.id ?? `job-${_jobCounter++}`
  return {
    id,
    title: 'Senior Software Engineer',
    company: 'Acme Corp',
    location: 'San Francisco, CA',
    remote_type: 'HYBRID',
    salary_min: 160000,
    salary_max: 220000,
    description:
      'We are looking for a Senior Software Engineer to join our team. You will build scalable systems and collaborate with a talented team.',
    url: 'https://acme.com/careers/senior-swe',
    source: 'manual',
    posted_date: '2026-03-01',
    created_at: '2026-03-01T10:00:00Z',
    match_score: 75,
    is_saved: false,
    ...overrides,
  }
}

export function createSavedJob(overrides: Partial<SavedJob> = {}): SavedJob {
  const id = overrides.id ?? `saved-${_savedJobCounter++}`
  const job = overrides.job ?? createJob({ id: `job-for-saved-${id}` })
  return {
    id,
    user_id: 'user-1',
    job_id: job.id,
    saved_at: '2026-03-05T12:00:00Z',
    notes: null,
    job: { ...job, is_saved: true },
    ...overrides,
  }
}

export const jobFixtures: Job[] = [
  createJob({
    id: 'job-fixture-1',
    title: 'Senior Frontend Engineer',
    company: 'Stripe',
    location: 'New York, NY',
    remote_type: 'REMOTE',
    salary_min: 180000,
    salary_max: 220000,
    description: `We're looking for a Senior Frontend Engineer to help build the next generation of Stripe's Dashboard. You'll work with React, TypeScript, and GraphQL to create delightful payment experiences.

**What you'll do:**
- Build and maintain complex React component systems
- Collaborate closely with product designers and backend engineers
- Own performance and accessibility of key user flows
- Mentor junior engineers and lead technical discussions

**Requirements:**
- 5+ years of frontend engineering experience
- Deep expertise in React, TypeScript, and modern CSS
- Experience with GraphQL and REST APIs
- Strong opinions on component architecture and testing`,
    url: 'https://stripe.com/jobs/senior-frontend',
    source: 'linkedin',
    posted_date: '2026-03-10',
    created_at: '2026-03-10T09:00:00Z',
    match_score: 92,
    is_saved: false,
  }),
  createJob({
    id: 'job-fixture-2',
    title: 'Staff Software Engineer, Infrastructure',
    company: 'Vercel',
    location: 'San Francisco, CA',
    remote_type: 'REMOTE',
    salary_min: 220000,
    salary_max: 280000,
    description: `Join Vercel's Infrastructure team and help build the platform that powers millions of developers worldwide. You'll work on distributed systems, edge computing, and developer tooling at massive scale.

**What you'll do:**
- Design and implement core infrastructure components
- Drive technical strategy for the platform team
- Work closely with the Open Source and DX teams

**Requirements:**
- 8+ years of software engineering experience
- Deep experience with distributed systems and cloud infrastructure
- Go, Rust, or C++ proficiency preferred
- Experience with Kubernetes and edge computing`,
    url: 'https://vercel.com/careers/staff-swe',
    source: 'company',
    posted_date: '2026-03-08',
    created_at: '2026-03-08T11:00:00Z',
    match_score: 87,
    is_saved: true,
  }),
  createJob({
    id: 'job-fixture-3',
    title: 'Principal Engineer',
    company: 'Linear',
    location: 'Remote',
    remote_type: 'REMOTE',
    salary_min: 240000,
    salary_max: 300000,
    description: `Linear is building the next-generation project management tool. We need a Principal Engineer to help shape our technical direction and build systems that are fast, reliable, and elegant.

**What you'll do:**
- Set technical direction and drive architectural decisions
- Build core product features in our React + TypeScript codebase
- Own key systems end-to-end, from design to production

**Requirements:**
- 10+ years of engineering experience
- Exceptional TypeScript and React skills
- Strong background in product engineering`,
    url: 'https://linear.app/careers',
    source: 'company',
    posted_date: '2026-03-05',
    created_at: '2026-03-05T14:00:00Z',
    match_score: 78,
    is_saved: false,
  }),
  createJob({
    id: 'job-fixture-4',
    title: 'Senior Backend Engineer, Payments',
    company: 'Plaid',
    location: 'San Francisco, CA',
    remote_type: 'HYBRID',
    salary_min: 170000,
    salary_max: 230000,
    description: `Build the financial infrastructure of the internet at Plaid. Our backend team works on highly reliable, secure APIs that connect millions of users to their financial data.

**What you'll do:**
- Build and maintain high-throughput payment processing systems
- Design APIs consumed by thousands of external developers
- Improve observability and reliability of critical services

**Requirements:**
- 4+ years of backend engineering
- Strong Python, Go, or Java skills
- Experience with financial data or payment systems a plus`,
    url: 'https://plaid.com/careers',
    source: 'linkedin',
    posted_date: '2026-03-07',
    created_at: '2026-03-07T10:00:00Z',
    match_score: 65,
    is_saved: false,
  }),
  createJob({
    id: 'job-fixture-5',
    title: 'Engineering Manager, Platform',
    company: 'Figma',
    location: 'San Francisco, CA',
    remote_type: 'HYBRID',
    salary_min: 210000,
    salary_max: 270000,
    description: `Lead a team of engineers building Figma's internal developer platform. You'll balance hands-on technical work with people management, hiring, and cross-functional leadership.

**What you'll do:**
- Manage a team of 5-8 engineers
- Drive technical strategy for the Platform org
- Partner with Product and Design to align roadmaps
- Build a strong engineering culture

**Requirements:**
- 3+ years of engineering management experience
- Strong technical background (we expect you to write code)
- Experience with platform or infrastructure engineering`,
    url: 'https://figma.com/careers/em-platform',
    source: 'company',
    posted_date: '2026-03-03',
    created_at: '2026-03-03T09:00:00Z',
    match_score: 71,
    is_saved: false,
  }),
  createJob({
    id: 'job-fixture-6',
    title: 'Senior Full-Stack Engineer',
    company: 'Notion',
    location: 'New York, NY',
    remote_type: 'HYBRID',
    salary_min: 175000,
    salary_max: 225000,
    description: `Help build the workspace that millions of teams rely on. At Notion, full-stack engineers own features end-to-end and ship work that users feel every day.

**What you'll do:**
- Build product features across our React frontend and Node.js backend
- Collaborate with Design to implement pixel-perfect UI
- Optimize performance and maintain high code quality standards

**Requirements:**
- 4+ years of full-stack experience
- React, TypeScript, Node.js expertise
- Product sense and a user-first mindset`,
    url: 'https://notion.so/careers',
    source: 'linkedin',
    posted_date: '2026-03-09',
    created_at: '2026-03-09T15:00:00Z',
    match_score: 83,
    is_saved: false,
  }),
]

export const savedJobFixtures: SavedJob[] = [
  createSavedJob({
    id: 'saved-fixture-1',
    job_id: 'job-fixture-2',
    saved_at: '2026-03-09T14:00:00Z',
    notes: 'Great compensation. Reached out to a friend at Vercel.',
    job: { ...jobFixtures[1], is_saved: true },
  }),
]
