/**
 * Shared test data factories.
 * Each factory returns a fully-formed fixture with sensible defaults.
 */

export interface UserFixture {
  id: string
  email: string
  name: string
  created_at: string
}

export function createUser(overrides: Partial<UserFixture> = {}): UserFixture {
  return {
    id: 'user-1',
    email: 'test@example.com',
    name: 'Test User',
    created_at: '2026-01-01T00:00:00Z',
    ...overrides,
  }
}
