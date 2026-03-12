/**
 * MSW handlers for the Experience domain.
 * Used in Vitest tests and offline dev mode.
 */
import { http, HttpResponse } from 'msw'
import type { Experience, ExperienceCreate, ExperienceUpdate } from '../../types/experience'
import { createExperience, experienceFixtures } from '../fixtures/experiences'

// In-memory store for test isolation
let store: Experience[] = [...experienceFixtures]

export function resetExperienceStore(initial: Experience[] = [...experienceFixtures]) {
  store = [...initial]
}

export const experienceHandlers = [
  // GET /api/experiences
  http.get('/api/experiences', ({ request }) => {
    const url = new URL(request.url)
    const type = url.searchParams.get('type')
    const tag = url.searchParams.get('tag')
    const q = url.searchParams.get('q')

    let results = [...store]

    if (type) {
      results = results.filter((e) => e.type === type)
    }

    if (tag) {
      results = results.filter((e) => e.tags.includes(tag))
    }

    if (q) {
      const lower = q.toLowerCase()
      results = results.filter(
        (e) =>
          e.title.toLowerCase().includes(lower) ||
          (e.description ?? '').toLowerCase().includes(lower) ||
          (e.organization ?? '').toLowerCase().includes(lower),
      )
    }

    return HttpResponse.json(results)
  }),

  // GET /api/experiences/:id
  http.get('/api/experiences/:id', ({ params }) => {
    const exp = store.find((e) => e.id === params.id)
    if (!exp) {
      return HttpResponse.json({ detail: 'Experience not found' }, { status: 404 })
    }
    return HttpResponse.json(exp)
  }),

  // POST /api/experiences
  http.post('/api/experiences', async ({ request }) => {
    const body = (await request.json()) as ExperienceCreate
    const newExp = createExperience({
      ...body,
      id: `exp-${Date.now()}`,
      user_id: 'user-1',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      tags: body.tags ?? [],
    })
    store.push(newExp)
    return HttpResponse.json(newExp, { status: 201 })
  }),

  // PATCH /api/experiences/:id
  http.patch('/api/experiences/:id', async ({ params, request }) => {
    const idx = store.findIndex((e) => e.id === params.id)
    if (idx === -1) {
      return HttpResponse.json({ detail: 'Experience not found' }, { status: 404 })
    }
    const body = (await request.json()) as ExperienceUpdate
    const updated: Experience = {
      ...store[idx],
      ...body,
      updated_at: new Date().toISOString(),
    }
    store[idx] = updated
    return HttpResponse.json(updated)
  }),

  // DELETE /api/experiences/:id
  http.delete('/api/experiences/:id', ({ params }) => {
    const idx = store.findIndex((e) => e.id === params.id)
    if (idx === -1) {
      return HttpResponse.json({ detail: 'Experience not found' }, { status: 404 })
    }
    store.splice(idx, 1)
    return new HttpResponse(null, { status: 204 })
  }),
]
