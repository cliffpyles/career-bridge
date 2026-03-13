/**
 * MSW handlers for AI endpoints (Phase 6+).
 * Simulates SSE streaming for the resume generation endpoint.
 *
 * Used in Vitest tests and offline dev mode.
 */
import { http, HttpResponse } from 'msw'
import type { ResumeSection } from '../../types/resume'

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function encode(text: string): Uint8Array {
  return new TextEncoder().encode(text)
}

function sseToken(text: string): string {
  return `data: ${JSON.stringify({ token: text })}\n\n`
}

function sseEvent(payload: Record<string, unknown>): string {
  return `data: ${JSON.stringify(payload)}\n\n`
}

function defaultAISections(): ResumeSection[] {
  return [
    {
      type: 'header',
      name: 'Your Name',
      email: 'your.email@example.com',
      phone: '555-0100',
      location: 'Remote',
    },
    {
      type: 'summary',
      content:
        'Experienced professional with a track record of delivering impactful results in fast-paced environments. ' +
        'Skilled in building scalable systems and collaborating with cross-functional teams.',
    },
    {
      type: 'experience',
      entries: [
        {
          id: 'ai-exp-entry-1',
          title: 'Senior Engineer',
          company: 'Previous Company',
          location: 'Remote',
          start_date: '2021-01',
          current: true,
          bullets: [
            'Led development of core platform features used by 100k+ users.',
            'Reduced infrastructure costs by 30% through architectural improvements.',
          ],
        },
      ],
    },
    {
      type: 'projects',
      entries: [],
    },
    {
      type: 'skills',
      categories: [
        { name: 'Languages', skills: ['TypeScript', 'Python', 'Go'] },
        { name: 'Tools', skills: ['React', 'FastAPI', 'PostgreSQL', 'Redis'] },
      ],
    },
    {
      type: 'education',
      entries: [],
    },
  ]
}

export const aiHandlers = [
  /**
   * POST /api/ai/generate-resume
   *
   * Simulates the SSE streaming response:
   *   1. Progress token events
   *   2. A 'complete' event with a generated resume
   *   3. [DONE]
   *
   * In tests, pass `x-msw-simulate-error: true` to get an error event stream.
   */
  http.post('/api/ai/generate-resume', async ({ request }) => {
    const simulateError = request.headers.get('x-msw-simulate-error') === 'true'

    const stream = new ReadableStream({
      async start(controller) {
        if (simulateError) {
          controller.enqueue(
            encode(
              sseEvent({
                type: 'error',
                message: 'AI provider is not configured for testing.',
              }),
            ),
          )
          controller.enqueue(encode('data: [DONE]\n\n'))
          controller.close()
          return
        }

        await sleep(30)
        controller.enqueue(encode(sseToken('Analyzing your experience library…\n')))

        await sleep(30)
        controller.enqueue(
          encode(sseToken('Selecting the most relevant experiences for this role…\n')),
        )

        await sleep(30)
        controller.enqueue(encode(sseToken('Found 3 relevant experiences. Building your tailored resume…\n')))

        await sleep(30)
        controller.enqueue(encode(sseToken('Done. Opening your resume…\n')))

        controller.enqueue(
          encode(
            sseEvent({
              type: 'complete',
              resume: {
                name: 'AI-Generated Resume',
                sections: defaultAISections(),
              },
            }),
          ),
        )

        controller.enqueue(encode('data: [DONE]\n\n'))
        controller.close()
      },
    })

    return new HttpResponse(stream, {
      status: 200,
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
      },
    })
  }),
]
