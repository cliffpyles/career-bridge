/**
 * Tests for useAIStream hook.
 *
 * Covers:
 *  - Tokens accumulate in streamText
 *  - onToken callback fires for each fragment
 *  - onComplete fires with the result payload on 'complete' event
 *  - onError fires on 'error' event
 *  - cancel() aborts an in-progress stream
 *  - isStreaming lifecycle (true while streaming, false after)
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { server } from '../../mocks/server'
import { useAIStream } from '../../hooks/useAIStream'

// Helper to build a ReadableStream that emits SSE lines
function makeSSEStream(lines: string[]): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder()
  return new ReadableStream({
    start(controller) {
      for (const line of lines) {
        controller.enqueue(encoder.encode(line))
      }
      controller.close()
    },
  })
}

describe('useAIStream', () => {
  beforeEach(() => {
    // Reset to default MSW handlers between tests
    server.resetHandlers()
  })

  // ── Token accumulation ────────────────────────────────────────────────────

  it('accumulates tokens into streamText', async () => {
    server.use(
      http.post('/api/ai/generate-resume', () => {
        const stream = makeSSEStream([
          'data: {"token": "Hello "}\n\n',
          'data: {"token": "world"}\n\n',
          'data: [DONE]\n\n',
        ])
        return new HttpResponse(stream, {
          headers: { 'Content-Type': 'text/event-stream' },
        })
      }),
    )

    const { result } = renderHook(() => useAIStream())

    await act(async () => {
      await result.current.start('/ai/generate-resume', { job_description: 'test' })
    })

    expect(result.current.streamText).toBe('Hello world')
    expect(result.current.isStreaming).toBe(false)
    expect(result.current.error).toBeNull()
  })

  // ── onToken callback ──────────────────────────────────────────────────────

  it('calls onToken for each fragment', async () => {
    server.use(
      http.post('/api/ai/generate-resume', () => {
        const stream = makeSSEStream([
          'data: {"token": "foo"}\n\n',
          'data: {"token": "bar"}\n\n',
          'data: [DONE]\n\n',
        ])
        return new HttpResponse(stream, {
          headers: { 'Content-Type': 'text/event-stream' },
        })
      }),
    )

    const tokens: string[] = []
    const { result } = renderHook(() =>
      useAIStream({ onToken: (t) => tokens.push(t) }),
    )

    await act(async () => {
      await result.current.start('/ai/generate-resume', { job_description: 'test' })
    })

    expect(tokens).toEqual(['foo', 'bar'])
  })

  // ── onComplete ────────────────────────────────────────────────────────────

  it('calls onComplete with result payload on complete event', async () => {
    const resumePayload = { name: 'AI-Generated Resume', sections: [] }

    server.use(
      http.post('/api/ai/generate-resume', () => {
        const stream = makeSSEStream([
          'data: {"token": "Thinking..."}\n\n',
          `data: ${JSON.stringify({ type: 'complete', resume: resumePayload })}\n\n`,
          'data: [DONE]\n\n',
        ])
        return new HttpResponse(stream, {
          headers: { 'Content-Type': 'text/event-stream' },
        })
      }),
    )

    const completeSpy = vi.fn()
    const { result } = renderHook(() =>
      useAIStream({ onComplete: completeSpy }),
    )

    await act(async () => {
      await result.current.start('/ai/generate-resume', { job_description: 'test' })
    })

    expect(completeSpy).toHaveBeenCalledOnce()
    const [callArg] = completeSpy.mock.calls[0]
    expect(callArg.resume).toEqual(resumePayload)
  })

  // ── onError on error event ────────────────────────────────────────────────

  it('calls onError and sets error state on error event', async () => {
    server.use(
      http.post('/api/ai/generate-resume', () => {
        const stream = makeSSEStream([
          'data: {"type": "error", "message": "AI provider not configured."}\n\n',
          'data: [DONE]\n\n',
        ])
        return new HttpResponse(stream, {
          headers: { 'Content-Type': 'text/event-stream' },
        })
      }),
    )

    const errorSpy = vi.fn()
    const { result } = renderHook(() =>
      useAIStream({ onError: errorSpy }),
    )

    await act(async () => {
      await result.current.start('/ai/generate-resume', { job_description: 'test' })
    })

    expect(errorSpy).toHaveBeenCalledOnce()
    expect(result.current.error).not.toBeNull()
    expect(result.current.error?.message).toContain('AI provider not configured')
    expect(result.current.isStreaming).toBe(false)
  })

  // ── isStreaming lifecycle ─────────────────────────────────────────────────

  it('sets isStreaming=false after stream completes', async () => {
    server.use(
      http.post('/api/ai/generate-resume', () => {
        const stream = makeSSEStream([
          'data: {"token": "done"}\n\n',
          'data: [DONE]\n\n',
        ])
        return new HttpResponse(stream, {
          headers: { 'Content-Type': 'text/event-stream' },
        })
      }),
    )

    const { result } = renderHook(() => useAIStream())

    await act(async () => {
      await result.current.start('/ai/generate-resume', { job_description: 'test' })
    })

    await waitFor(() => {
      expect(result.current.isStreaming).toBe(false)
    })
  })

  // ── Cancel ────────────────────────────────────────────────────────────────

  it('cancel() stops the stream and sets isStreaming=false', async () => {
    // Long-running stream that we'll cancel
    server.use(
      http.post('/api/ai/generate-resume', () => {
        // Return a stream that never closes (simulates slow network)
        const stream = new ReadableStream({
          start() {
            // Never enqueues or closes; simulates a hanging stream
          },
        })
        return new HttpResponse(stream, {
          headers: { 'Content-Type': 'text/event-stream' },
        })
      }),
    )

    const { result } = renderHook(() => useAIStream())

    // Start without awaiting (it will hang)
    act(() => {
      void result.current.start('/ai/generate-resume', { job_description: 'test' })
    })

    // Cancel immediately
    act(() => {
      result.current.cancel()
    })

    await waitFor(() => {
      expect(result.current.isStreaming).toBe(false)
    })
  })

  // ── Network error ─────────────────────────────────────────────────────────

  it('sets error on network failure', async () => {
    server.use(
      http.post('/api/ai/generate-resume', () => {
        return HttpResponse.error()
      }),
    )

    const errorSpy = vi.fn()
    const { result } = renderHook(() => useAIStream({ onError: errorSpy }))

    await act(async () => {
      await result.current.start('/ai/generate-resume', { job_description: 'test' })
    })

    expect(errorSpy).toHaveBeenCalled()
    expect(result.current.isStreaming).toBe(false)
  })

  // ── Reset on new start ────────────────────────────────────────────────────

  it('resets streamText and error on each new start()', async () => {
    server.use(
      http.post('/api/ai/generate-resume', () => {
        const stream = makeSSEStream([
          'data: {"token": "new content"}\n\n',
          'data: [DONE]\n\n',
        ])
        return new HttpResponse(stream, {
          headers: { 'Content-Type': 'text/event-stream' },
        })
      }),
    )

    const { result } = renderHook(() => useAIStream())

    // First run
    await act(async () => {
      await result.current.start('/ai/generate-resume', { job_description: 'first' })
    })
    expect(result.current.streamText).toBe('new content')

    // Second run — streamText should reset
    await act(async () => {
      await result.current.start('/ai/generate-resume', { job_description: 'second' })
    })
    // After second run, streamText should only have the new content (same handler)
    expect(result.current.streamText).toBe('new content')
    expect(result.current.error).toBeNull()
  })
})
