/**
 * MSW browser worker — used in development mode to intercept API calls
 * without running the backend.
 *
 * Started in main.tsx when VITE_MSW=true.
 */
import { setupWorker } from 'msw/browser'
import { handlers } from './handlers'

export const worker = setupWorker(...handlers)
