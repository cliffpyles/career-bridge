/**
 * MSW Node server — used in Vitest tests to intercept network calls
 * deterministically.
 *
 * Auto-started and auto-stopped via src/test/setup.ts.
 */
import { setupServer } from 'msw/node'
import { handlers } from './handlers'

export const server = setupServer(...handlers)
