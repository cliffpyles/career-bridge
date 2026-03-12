/**
 * Typed API client — wraps fetch with auth headers, error handling,
 * and type inference. Used as queryFn/mutationFn by TanStack Query hooks.
 */

const BASE_URL = import.meta.env.VITE_API_URL ?? '/api'

// ─── Error types ─────────────────────────────────────────────────

export class ApiError extends Error {
  status: number
  statusText: string
  body: unknown

  constructor(status: number, statusText: string, body: unknown) {
    super(`API Error ${status}: ${statusText}`)
    this.name = 'ApiError'
    this.status = status
    this.statusText = statusText
    this.body = body
  }

  isNotFound() { return this.status === 404 }
  isUnauthorized() { return this.status === 401 }
  isForbidden() { return this.status === 403 }
  isServerError() { return this.status >= 500 }
  isClientError() { return this.status >= 400 && this.status < 500 }
}

export class NetworkError extends Error {
  constructor(cause?: unknown) {
    super("We couldn't reach the server. Check your connection and try again.")
    this.name = 'NetworkError'
    this.cause = cause
  }
}

// ─── Auth token management ────────────────────────────────────────

let authToken: string | null = null

export function setAuthToken(token: string | null): void {
  authToken = token
}

export function getAuthToken(): string | null {
  return authToken
}

// ─── Request helpers ─────────────────────────────────────────────

interface RequestOptions<TBody = unknown> {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  body?: TBody
  headers?: Record<string, string>
  signal?: AbortSignal
}

async function request<TResponse>(
  path: string,
  options: RequestOptions = {},
): Promise<TResponse> {
  const { method = 'GET', body, headers = {}, signal } = options

  const reqHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...headers,
  }

  if (authToken) {
    reqHeaders['Authorization'] = `Bearer ${authToken}`
  }

  let response: Response
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      method,
      headers: reqHeaders,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal,
    })
  } catch (err) {
    throw new NetworkError(err)
  }

  if (!response.ok) {
    let errorBody: unknown = null
    try {
      errorBody = await response.json()
    } catch {
      // non-JSON error body
    }
    throw new ApiError(response.status, response.statusText, errorBody)
  }

  // 204 No Content
  if (response.status === 204) {
    return undefined as TResponse
  }

  return response.json() as Promise<TResponse>
}

// ─── Public API ───────────────────────────────────────────────────

export const apiClient = {
  get<T>(path: string, opts?: Omit<RequestOptions, 'method' | 'body'>): Promise<T> {
    return request<T>(path, { ...opts, method: 'GET' })
  },

  post<T, B = unknown>(path: string, body?: B, opts?: Omit<RequestOptions, 'method' | 'body'>): Promise<T> {
    return request<T>(path, { ...opts, method: 'POST', body })
  },

  patch<T, B = unknown>(path: string, body?: B, opts?: Omit<RequestOptions, 'method' | 'body'>): Promise<T> {
    return request<T>(path, { ...opts, method: 'PATCH', body })
  },

  put<T, B = unknown>(path: string, body?: B, opts?: Omit<RequestOptions, 'method' | 'body'>): Promise<T> {
    return request<T>(path, { ...opts, method: 'PUT', body })
  },

  delete<T = void>(path: string, opts?: Omit<RequestOptions, 'method' | 'body'>): Promise<T> {
    return request<T>(path, { ...opts, method: 'DELETE' })
  },
}
