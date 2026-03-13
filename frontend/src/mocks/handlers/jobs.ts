/**
 * MSW handlers for the Job domain.
 * Used in Vitest tests and offline dev mode.
 */
import { http, HttpResponse } from 'msw'
import type { Job, SavedJob, SavedJobCreate } from '../../types/job'
import { createSavedJob, jobFixtures, savedJobFixtures } from '../fixtures/jobs'

// In-memory stores for test isolation
let jobStore: Job[] = [...jobFixtures]
let savedStore: SavedJob[] = [...savedJobFixtures]

export function resetJobStore(
  initialJobs: Job[] = [...jobFixtures],
  initialSaved: SavedJob[] = [...savedJobFixtures],
) {
  jobStore = [...initialJobs]
  savedStore = [...initialSaved]
}

export const jobHandlers = [
  // GET /api/jobs
  http.get('/api/jobs', ({ request }) => {
    const url = new URL(request.url)
    const q = url.searchParams.get('q')?.toLowerCase()
    const location = url.searchParams.get('location')?.toLowerCase()
    const remoteType = url.searchParams.get('remote_type')
    const salaryMin = url.searchParams.get('salary_min')
      ? Number(url.searchParams.get('salary_min'))
      : null
    const salaryMax = url.searchParams.get('salary_max')
      ? Number(url.searchParams.get('salary_max'))
      : null

    const savedIds = new Set(savedStore.map((s) => s.job_id))

    let results = jobStore.map((j) => ({ ...j, is_saved: savedIds.has(j.id) }))

    if (q) {
      results = results.filter(
        (j) =>
          j.title.toLowerCase().includes(q) ||
          j.company.toLowerCase().includes(q) ||
          (j.description?.toLowerCase().includes(q) ?? false),
      )
    }

    if (location) {
      results = results.filter((j) => j.location?.toLowerCase().includes(location))
    }

    if (remoteType) {
      results = results.filter((j) => j.remote_type === remoteType)
    }

    if (salaryMin !== null) {
      results = results.filter((j) => j.salary_max === null || (j.salary_max ?? 0) >= salaryMin)
    }

    if (salaryMax !== null) {
      results = results.filter((j) => j.salary_min === null || (j.salary_min ?? 0) <= salaryMax)
    }

    return HttpResponse.json(results)
  }),

  // GET /api/jobs/:id
  http.get('/api/jobs/:id', ({ params }) => {
    const savedIds = new Set(savedStore.map((s) => s.job_id))
    const job = jobStore.find((j) => j.id === params.id)
    if (!job) {
      return HttpResponse.json({ detail: 'Job not found' }, { status: 404 })
    }
    return HttpResponse.json({ ...job, is_saved: savedIds.has(job.id) })
  }),

  // POST /api/jobs
  http.post('/api/jobs', async ({ request }) => {
    const body = (await request.json()) as Partial<Job>
    const newJob: Job = {
      id: `job-${Date.now()}`,
      title: body.title ?? '',
      company: body.company ?? '',
      location: body.location ?? null,
      remote_type: body.remote_type ?? null,
      salary_min: body.salary_min ?? null,
      salary_max: body.salary_max ?? null,
      description: body.description ?? null,
      url: body.url ?? null,
      source: body.source ?? 'manual',
      posted_date: body.posted_date ?? null,
      created_at: new Date().toISOString(),
      match_score: null,
      is_saved: false,
    }
    jobStore.push(newJob)
    return HttpResponse.json(newJob, { status: 201 })
  }),

  // GET /api/saved-jobs
  http.get('/api/saved-jobs', () => {
    const savedIds = new Set(savedStore.map((s) => s.job_id))
    const results = savedStore.map((sv) => {
      const job = jobStore.find((j) => j.id === sv.job_id)
      return {
        ...sv,
        job: job ? { ...job, is_saved: savedIds.has(job.id) } : sv.job,
      }
    })
    return HttpResponse.json(results)
  }),

  // POST /api/saved-jobs
  http.post('/api/saved-jobs', async ({ request }) => {
    const body = (await request.json()) as SavedJobCreate
    const existing = savedStore.find((s) => s.job_id === body.job_id)
    if (existing) {
      return HttpResponse.json({ detail: 'Job is already saved' }, { status: 409 })
    }
    const job = jobStore.find((j) => j.id === body.job_id)
    if (!job) {
      return HttpResponse.json({ detail: 'Job not found' }, { status: 404 })
    }
    const newSaved = createSavedJob({
      id: `saved-${Date.now()}`,
      job_id: body.job_id,
      notes: body.notes ?? null,
      saved_at: new Date().toISOString(),
      job: { ...job, is_saved: true },
    })
    savedStore.push(newSaved)
    return HttpResponse.json(newSaved, { status: 201 })
  }),

  // DELETE /api/saved-jobs/:jobId
  http.delete('/api/saved-jobs/:jobId', ({ params }) => {
    const idx = savedStore.findIndex((s) => s.job_id === params.jobId)
    if (idx === -1) {
      return HttpResponse.json({ detail: 'Saved job not found' }, { status: 404 })
    }
    savedStore.splice(idx, 1)
    return new HttpResponse(null, { status: 204 })
  }),
]
