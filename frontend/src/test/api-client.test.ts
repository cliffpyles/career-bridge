import { describe, it, expect, afterEach } from 'vitest'
import { http, HttpResponse } from 'msw'
import { server } from '../mocks/server'
import { apiClient, ApiError, setAuthToken, getAuthToken } from '../lib/api-client'

describe('apiClient', () => {
  afterEach(() => {
    setAuthToken(null)
  })

  describe('GET requests', () => {
    it('fetches data successfully', async () => {
      const data = await apiClient.get<{ status: string }>('/health')
      expect(data.status).toBe('ok')
    })

    it('throws ApiError on 4xx response', async () => {
      server.use(
        http.get('/api/not-found', () => HttpResponse.json({ detail: 'Not found' }, { status: 404 })),
      )
      await expect(apiClient.get('/not-found')).rejects.toThrow(ApiError)
    })

    it('sets error status on ApiError', async () => {
      server.use(
        http.get('/api/forbidden', () => HttpResponse.json({ detail: 'Forbidden' }, { status: 403 })),
      )
      try {
        await apiClient.get('/forbidden')
      } catch (e) {
        expect(e).toBeInstanceOf(ApiError)
        expect((e as ApiError).status).toBe(403)
        expect((e as ApiError).isForbidden()).toBe(true)
      }
    })

    it('throws ApiError on 5xx response', async () => {
      server.use(
        http.get('/api/broken', () => HttpResponse.json({ detail: 'Server error' }, { status: 500 })),
      )
      try {
        await apiClient.get('/broken')
      } catch (e) {
        expect(e).toBeInstanceOf(ApiError)
        expect((e as ApiError).isServerError()).toBe(true)
      }
    })
  })

  describe('POST requests', () => {
    it('sends JSON body', async () => {
      let receivedBody: unknown
      server.use(
        http.post('/api/test-post', async ({ request }) => {
          receivedBody = await request.json()
          return HttpResponse.json({ created: true })
        }),
      )
      await apiClient.post('/test-post', { name: 'Test' })
      expect(receivedBody).toEqual({ name: 'Test' })
    })
  })

  describe('Auth token', () => {
    it('injects auth header when token is set', async () => {
      let receivedAuth: string | null = null
      server.use(
        http.get('/api/me', ({ request }) => {
          receivedAuth = request.headers.get('Authorization')
          return HttpResponse.json({ id: '1' })
        }),
      )
      setAuthToken('my-test-token')
      await apiClient.get('/me')
      expect(receivedAuth).toBe('Bearer my-test-token')
    })

    it('does not inject header when no token', async () => {
      let receivedAuth: string | null = 'initial'
      server.use(
        http.get('/api/me', ({ request }) => {
          receivedAuth = request.headers.get('Authorization')
          return HttpResponse.json({ id: '1' })
        }),
      )
      setAuthToken(null)
      await apiClient.get('/me')
      expect(receivedAuth).toBeNull()
    })

    it('get/setAuthToken work correctly', () => {
      setAuthToken('token-123')
      expect(getAuthToken()).toBe('token-123')
      setAuthToken(null)
      expect(getAuthToken()).toBeNull()
    })
  })

  describe('ApiError properties', () => {
    it('identifies 404 as not found', () => {
      const err = new ApiError(404, 'Not Found', {})
      expect(err.isNotFound()).toBe(true)
      expect(err.isUnauthorized()).toBe(false)
    })

    it('identifies 401 as unauthorized', () => {
      const err = new ApiError(401, 'Unauthorized', {})
      expect(err.isUnauthorized()).toBe(true)
    })

    it('identifies 500+ as server error', () => {
      const err = new ApiError(500, 'Internal Server Error', {})
      expect(err.isServerError()).toBe(true)
      expect(err.isClientError()).toBe(false)
    })
  })
})
