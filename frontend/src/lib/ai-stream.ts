/**
 * SSE streaming utility for AI responses.
 * Used by Phase 6+ features.
 */

const BASE_URL = import.meta.env.VITE_API_URL ?? '/api'

export interface StreamCallbacks {
  onToken: (token: string) => void
  onComplete: (fullText: string) => void
  onError: (error: Error) => void
}

export async function streamAIResponse(
  path: string,
  body: unknown,
  callbacks: StreamCallbacks,
  authToken?: string | null,
): Promise<void> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'text/event-stream',
  }

  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`
  }

  let response: Response
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    })
  } catch (err) {
    callbacks.onError(new Error('Network error while starting AI stream'))
    return
  }

  if (!response.ok || !response.body) {
    callbacks.onError(new Error(`AI stream failed: ${response.statusText}`))
    return
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let fullText = ''
  let buffer = ''

  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() ?? ''

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6).trim()
          if (data === '[DONE]') {
            callbacks.onComplete(fullText)
            return
          }
          try {
            const parsed = JSON.parse(data) as { token?: string; text?: string }
            const token = parsed.token ?? parsed.text ?? ''
            fullText += token
            callbacks.onToken(token)
          } catch {
            // skip malformed lines
          }
        }
      }
    }
    callbacks.onComplete(fullText)
  } catch (err) {
    callbacks.onError(err instanceof Error ? err : new Error('Stream read error'))
  } finally {
    reader.releaseLock()
  }
}
