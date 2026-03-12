import { http, HttpResponse } from 'msw'

export const healthHandlers = [
  http.get('/api/health', () => {
    return HttpResponse.json({
      status: 'ok',
      version: '0.1.0',
      timestamp: new Date().toISOString(),
    })
  }),

  http.get('/api/me', () => {
    return HttpResponse.json({
      id: 'stub-user-id',
      email: 'user@example.com',
      name: 'Cliff',
      created_at: '2026-01-01T00:00:00Z',
    })
  }),
]
