import { describe, it, expect } from 'vitest'
import { server } from '../mocks/server'
import { apiClient } from '../lib/api-client'

describe('MSW handlers', () => {
  it('server starts and stops cleanly (lifecycle managed by setup.ts)', () => {
    // If we reach here, MSW server started successfully in beforeAll
    expect(server).toBeDefined()
  })

  it('intercepts /api/health and returns ok status', async () => {
    const data = await apiClient.get<{ status: string; version: string }>('/health')
    expect(data.status).toBe('ok')
    expect(data.version).toBeDefined()
  })

  it('intercepts /api/me and returns user data', async () => {
    const data = await apiClient.get<{ id: string; email: string; name: string }>('/me')
    expect(data.id).toBeDefined()
    expect(data.email).toBeDefined()
    expect(data.name).toBeDefined()
  })
})
