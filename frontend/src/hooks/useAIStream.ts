/**
 * useAIStream — reusable hook for consuming Server-Sent Event (SSE) AI streams.
 *
 * Used by:
 *   Phase 6 — Resume generation (POST /api/ai/generate-resume)
 *   Phase 7 — AI Assist rewrite/expand/tailor (POST /api/ai/assist)
 *   Phase 9 — Interview quiz evaluation
 *
 * SSE protocol (backend emits):
 *   data: {"token": "text fragment"}    — incremental progress/content text
 *   data: {"type": "complete", ...}     — final structured result payload
 *   data: {"type": "error", "message": "..."} — generation failed
 *   data: [DONE]                        — stream end marker
 *
 * Usage:
 *   const { streamText, isStreaming, error, start, cancel } = useAIStream<ResumeCreate>({
 *     onComplete: (result) => navigate(`/resumes/${result.id}`),
 *   })
 *   await start('/ai/generate-resume', { job_description: text })
 */

import { useCallback, useRef, useState } from 'react'
import { getAuthToken } from '../lib/api-client'

const BASE_URL = import.meta.env.VITE_API_URL ?? '/api'

/** Any structured event the backend may send (beyond plain tokens). */
export interface AIStreamEvent<TResult = unknown> {
  token?: string
  text?: string
  type?: 'complete' | 'error'
  message?: string
  resume?: TResult
  [key: string]: unknown
}

export interface UseAIStreamOptions<TResult = unknown> {
  /** Called for each text token received. */
  onToken?: (token: string, fullText: string) => void
  /**
   * Called when the backend emits {"type": "complete", ...}.
   * `result` is the full event payload (minus `type`).
   */
  onComplete?: (result: TResult, fullText: string) => void
  /** Called when the backend emits {"type": "error"} or a network failure. */
  onError?: (error: Error) => void
}

export interface UseAIStreamReturn {
  /** Accumulated text from all token events so far. */
  streamText: string
  /** True while the SSE connection is open. */
  isStreaming: boolean
  /** Set when the stream fails (network error or backend error event). */
  error: Error | null
  /** Begin a new stream. Cancels any in-progress stream first. */
  start: (path: string, body: unknown) => Promise<void>
  /** Abort the current stream immediately. */
  cancel: () => void
}

export function useAIStream<TResult = unknown>(
  options: UseAIStreamOptions<TResult> = {},
): UseAIStreamReturn {
  const [streamText, setStreamText] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  // Keep latest options in a ref so callbacks don't cause re-renders or stale closures
  const optionsRef = useRef(options)
  optionsRef.current = options

  const abortRef = useRef<AbortController | null>(null)
  // Buffer for partial SSE lines between chunks
  const bufferRef = useRef('')
  // Accumulated full text across all token events
  const fullTextRef = useRef('')

  const cancel = useCallback(() => {
    abortRef.current?.abort()
    setIsStreaming(false)
  }, [])

  const start = useCallback(async (path: string, body: unknown) => {
    // Cancel any existing stream
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    setStreamText('')
    setError(null)
    setIsStreaming(true)
    fullTextRef.current = ''
    bufferRef.current = ''

    const token = getAuthToken()
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'text/event-stream',
    }
    if (token) headers['Authorization'] = `Bearer ${token}`

    let response: Response
    try {
      response = await fetch(`${BASE_URL}${path}`, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
        signal: controller.signal,
      })
    } catch (err) {
      if (controller.signal.aborted) return
      const fetchError = new Error('Network error while starting AI stream')
      setError(fetchError)
      setIsStreaming(false)
      optionsRef.current.onError?.(fetchError)
      return
    }

    if (!response.ok || !response.body) {
      const httpError = new Error(`AI stream failed: ${response.statusText}`)
      setError(httpError)
      setIsStreaming(false)
      optionsRef.current.onError?.(httpError)
      return
    }

    const reader = response.body.getReader()
    const decoder = new TextDecoder()

    try {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        bufferRef.current += decoder.decode(value, { stream: true })
        const lines = bufferRef.current.split('\n')
        bufferRef.current = lines.pop() ?? ''

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue

          const raw = line.slice(6).trim()
          if (raw === '[DONE]') {
            setIsStreaming(false)
            return
          }

          let event: AIStreamEvent<TResult>
          try {
            event = JSON.parse(raw) as AIStreamEvent<TResult>
          } catch {
            continue
          }

          if (event.type === 'error') {
            const streamError = new Error(
              event.message ?? 'An error occurred during generation',
            )
            setError(streamError)
            setIsStreaming(false)
            optionsRef.current.onError?.(streamError)
            return
          }

          if (event.type === 'complete') {
            setIsStreaming(false)
            // Pass the full event (sans `type`) as the result
            const { type: _type, ...result } = event
            optionsRef.current.onComplete?.(
              result as unknown as TResult,
              fullTextRef.current,
            )
            return
          }

          // Plain token event
          const fragment = event.token ?? event.text ?? ''
          if (fragment) {
            fullTextRef.current += fragment
            setStreamText((prev) => prev + fragment)
            optionsRef.current.onToken?.(fragment, fullTextRef.current)
          }
        }
      }
    } catch (err) {
      if (controller.signal.aborted) return
      const readError =
        err instanceof Error ? err : new Error('Stream read error')
      setError(readError)
      optionsRef.current.onError?.(readError)
    } finally {
      reader.releaseLock()
      if (!controller.signal.aborted) {
        setIsStreaming(false)
      }
    }
  }, [])

  return { streamText, isStreaming, error, start, cancel }
}
