/**
 * MSW handlers for the Application domain.
 * Used in Vitest tests and offline dev mode.
 */
import { http, HttpResponse } from 'msw'
import type {
  Application,
  ApplicationCreate,
  ApplicationEvent,
  ApplicationEventCreate,
  ApplicationUpdate,
} from '../../types/application'
import {
  applicationEventFixtures,
  applicationFixtures,
  createApplication,
  createApplicationEvent,
} from '../fixtures/applications'

// In-memory stores for test isolation
let store: Application[] = [...applicationFixtures]
let eventStore: Record<string, ApplicationEvent[]> = Object.fromEntries(
  Object.entries(applicationEventFixtures).map(([k, v]) => [k, [...v]]),
)

export function resetApplicationStore(
  initial: Application[] = [...applicationFixtures],
  initialEvents: Record<string, ApplicationEvent[]> = Object.fromEntries(
    Object.entries(applicationEventFixtures).map(([k, v]) => [k, [...v]]),
  ),
) {
  store = [...initial]
  eventStore = Object.fromEntries(Object.entries(initialEvents).map(([k, v]) => [k, [...v]]))
}

export const applicationHandlers = [
  // GET /api/applications
  http.get('/api/applications', ({ request }) => {
    const url = new URL(request.url)
    const status = url.searchParams.get('status')
    const sort = url.searchParams.get('sort') ?? 'recent'

    let results = [...store]

    if (status) {
      results = results.filter((a) => a.status === status)
    }

    if (sort === 'next_action') {
      results = results.sort((a, b) => {
        if (!a.next_action_date && !b.next_action_date) return 0
        if (!a.next_action_date) return 1
        if (!b.next_action_date) return -1
        return a.next_action_date.localeCompare(b.next_action_date)
      })
    } else {
      results = results.sort((a, b) => b.updated_at.localeCompare(a.updated_at))
    }

    return HttpResponse.json(results)
  }),

  // GET /api/applications/:id
  http.get('/api/applications/:id', ({ params }) => {
    // Must not match /api/applications/:id/events
    const app = store.find((a) => a.id === params.id)
    if (!app) {
      return HttpResponse.json({ detail: 'Application not found' }, { status: 404 })
    }
    return HttpResponse.json(app)
  }),

  // POST /api/applications
  http.post('/api/applications', async ({ request }) => {
    const body = (await request.json()) as ApplicationCreate
    const newApp = createApplication({
      ...body,
      id: `app-${Date.now()}`,
      user_id: 'user-1',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    store.push(newApp)
    return HttpResponse.json(newApp, { status: 201 })
  }),

  // PATCH /api/applications/:id
  http.patch('/api/applications/:id', async ({ params, request }) => {
    const idx = store.findIndex((a) => a.id === params.id)
    if (idx === -1) {
      return HttpResponse.json({ detail: 'Application not found' }, { status: 404 })
    }
    const body = (await request.json()) as ApplicationUpdate
    const updated: Application = {
      ...store[idx],
      ...body,
      updated_at: new Date().toISOString(),
    }
    store[idx] = updated
    return HttpResponse.json(updated)
  }),

  // DELETE /api/applications/:id
  http.delete('/api/applications/:id', ({ params }) => {
    const idx = store.findIndex((a) => a.id === params.id)
    if (idx === -1) {
      return HttpResponse.json({ detail: 'Application not found' }, { status: 404 })
    }
    store.splice(idx, 1)
    return new HttpResponse(null, { status: 204 })
  }),

  // GET /api/applications/:id/events
  http.get('/api/applications/:id/events', ({ params }) => {
    const app = store.find((a) => a.id === params.id)
    if (!app) {
      return HttpResponse.json({ detail: 'Application not found' }, { status: 404 })
    }
    const events = eventStore[params.id as string] ?? []
    return HttpResponse.json(events)
  }),

  // POST /api/applications/:id/events
  http.post('/api/applications/:id/events', async ({ params, request }) => {
    const app = store.find((a) => a.id === params.id)
    if (!app) {
      return HttpResponse.json({ detail: 'Application not found' }, { status: 404 })
    }
    const body = (await request.json()) as ApplicationEventCreate
    const newEvent = createApplicationEvent({
      event_type: body.event_type,
      event_date: body.event_date,
      notes: body.notes ?? null,
      id: `event-${Date.now()}`,
      application_id: params.id as string,
      created_at: new Date().toISOString(),
    })
    const appId = params.id as string
    if (!eventStore[appId]) {
      eventStore[appId] = []
    }
    eventStore[appId].unshift(newEvent)
    return HttpResponse.json(newEvent, { status: 201 })
  }),
]
