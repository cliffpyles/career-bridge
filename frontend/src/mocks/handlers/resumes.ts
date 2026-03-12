/**
 * MSW handlers for the Resume domain.
 * Used in Vitest tests and offline dev mode.
 */
import { http, HttpResponse } from 'msw'
import type { Resume, ResumeCreate, ResumeUpdate, ResumeVersion } from '../../types/resume'
import {
  createResume,
  createResumeVersion,
  resumeFixtures,
  resumeVersionFixtures,
} from '../fixtures/resumes'

// In-memory stores
let store: Resume[] = [...resumeFixtures]
let versionStore: Record<string, ResumeVersion[]> = {
  ...Object.fromEntries(
    Object.entries(resumeVersionFixtures).map(([k, v]) => [k, [...v]]),
  ),
}

export function resetResumeStore(
  initial: Resume[] = [...resumeFixtures],
  initialVersions: Record<string, ResumeVersion[]> = {},
) {
  store = [...initial]
  versionStore = {
    ...Object.fromEntries(
      Object.entries(resumeVersionFixtures).map(([k, v]) => [k, [...v]]),
    ),
    ...initialVersions,
  }
}

function addVersion(resume: Resume) {
  const v = createResumeVersion(resume.id, {
    version: resume.version,
    name: resume.name,
    sections: resume.sections,
    created_at: new Date().toISOString(),
  })
  if (!versionStore[resume.id]) versionStore[resume.id] = []
  versionStore[resume.id].unshift(v)
}

export const resumeHandlers = [
  // GET /api/resumes
  http.get('/api/resumes', () => {
    return HttpResponse.json(store)
  }),

  // GET /api/resumes/:id
  http.get('/api/resumes/:id', ({ params }) => {
    const resume = store.find((r) => r.id === params.id)
    if (!resume) {
      return HttpResponse.json({ detail: 'Resume not found' }, { status: 404 })
    }
    return HttpResponse.json(resume)
  }),

  // POST /api/resumes
  http.post('/api/resumes', async ({ request }) => {
    const body = (await request.json()) as ResumeCreate
    const newResume = createResume({
      ...body,
      id: `resume-${Date.now()}`,
      user_id: 'user-1',
      version: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    store.push(newResume)
    addVersion(newResume)
    return HttpResponse.json(newResume, { status: 201 })
  }),

  // PATCH /api/resumes/:id
  http.patch('/api/resumes/:id', async ({ params, request }) => {
    const idx = store.findIndex((r) => r.id === params.id)
    if (idx === -1) {
      return HttpResponse.json({ detail: 'Resume not found' }, { status: 404 })
    }
    const body = (await request.json()) as ResumeUpdate
    const updated: Resume = {
      ...store[idx],
      ...body,
      version: store[idx].version + 1,
      updated_at: new Date().toISOString(),
    }
    store[idx] = updated
    addVersion(updated)
    return HttpResponse.json(updated)
  }),

  // DELETE /api/resumes/:id
  http.delete('/api/resumes/:id', ({ params }) => {
    const idx = store.findIndex((r) => r.id === params.id)
    if (idx === -1) {
      return HttpResponse.json({ detail: 'Resume not found' }, { status: 404 })
    }
    store.splice(idx, 1)
    return new HttpResponse(null, { status: 204 })
  }),

  // GET /api/resumes/:id/versions
  http.get('/api/resumes/:id/versions', ({ params }) => {
    const versions = versionStore[params.id as string] ?? []
    return HttpResponse.json(versions)
  }),

  // POST /api/resumes/:resumeId/versions/:versionId/restore
  http.post('/api/resumes/:resumeId/versions/:versionId/restore', ({ params }) => {
    const idx = store.findIndex((r) => r.id === params.resumeId)
    if (idx === -1) {
      return HttpResponse.json({ detail: 'Resume not found' }, { status: 404 })
    }
    const versions = versionStore[params.resumeId as string] ?? []
    const version = versions.find((v) => v.id === params.versionId)
    if (!version) {
      return HttpResponse.json({ detail: 'Version not found' }, { status: 404 })
    }
    const restored: Resume = {
      ...store[idx],
      sections: version.sections,
      version: store[idx].version + 1,
      updated_at: new Date().toISOString(),
    }
    store[idx] = restored
    addVersion(restored)
    return HttpResponse.json(restored)
  }),

  // POST /api/resumes/:id/export
  http.post('/api/resumes/:id/export', ({ params, request }) => {
    const resume = store.find((r) => r.id === params.id)
    if (!resume) {
      return HttpResponse.json({ detail: 'Resume not found' }, { status: 404 })
    }
    const url = new URL(request.url)
    const format = url.searchParams.get('format') ?? 'pdf'

    if (format === 'pdf') {
      const stubPdf = new Uint8Array([
        0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x34,
      ])
      return new HttpResponse(stubPdf, {
        status: 200,
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="${resume.name}_v${resume.version}.pdf"`,
        },
      })
    }

    const txt = `${resume.name}\n${'─'.repeat(40)}\nExported resume plain text.\n`
    return new HttpResponse(txt, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain',
        'Content-Disposition': `attachment; filename="${resume.name}_v${resume.version}.txt"`,
      },
    })
  }),
]
