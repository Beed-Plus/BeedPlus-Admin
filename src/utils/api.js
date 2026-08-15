import * as Sentry from '@sentry/react'

const BASE = import.meta.env.VITE_API_URL ?? ''

/** Converts an Instagram CDN video URL into a same-origin proxy URL so iOS
 *  can buffer it properly via Range requests without CORS restrictions. */
export function proxyVideoUrl(url) {
  if (!url) return url
  return `${BASE}/api/proxy/video?url=${encodeURIComponent(url)}`
}

/**
 * Thin fetch wrapper.
 * - Automatically sets Content-Type and Authorization headers.
 * - Parses the JSON response and throws on non-2xx with the server's message.
 */
const STORAGE_KEY = 'beedplus_admin_auth'

const REDACTED = '[Filtered]'
const SENSITIVE_KEYS = new Set([
  'authorization',
  'token',
  'accessToken',
  'refreshToken',
  'password',
  'newPassword',
  'oldPassword',
])

const MAX_CAPTURED_BODY_LENGTH = 5000

class ApiFetchError extends Error {
  constructor(message, context) {
    super(message)
    this.name = 'ApiFetchError'
    this.context = context
    this.status = context.response?.status
    this.url = context.request.url
    this.method = context.request.method
  }
}

function redact(value) {
  if (Array.isArray(value)) return value.map(redact)
  if (!value || typeof value !== 'object') return value

  return Object.fromEntries(
    Object.entries(value).map(([key, item]) => [
      key,
      SENSITIVE_KEYS.has(key) ? REDACTED : redact(item),
    ]),
  )
}

function limitBody(value) {
  if (typeof value !== 'string') return value
  if (value.length <= MAX_CAPTURED_BODY_LENGTH) return value

  return `${value.slice(0, MAX_CAPTURED_BODY_LENGTH)}... [truncated]`
}

async function parseResponseBody(res) {
  const text = await res.text().catch(() => '')
  if (!text) return {}

  try {
    return JSON.parse(text)
  } catch {
    return text
  }
}

function getResponseMessage(body, status) {
  if (body && typeof body === 'object') {
    return body.message ?? body.error ?? `Request failed (${status})`
  }

  if (typeof body === 'string' && body.trim()) {
    return body
  }

  return `Request failed (${status})`
}

function captureApiError(error, context) {
  Sentry.withScope((scope) => {
    scope.setTag('error.source', 'apiFetch')
    scope.setTag('http.method', context.request.method)
    scope.setTag('http.status_code', context.response?.status ?? 'network_error')
    scope.setContext('api.request', context.request)
    scope.setContext('api.response', context.response)
    scope.setContext('api.browser', context.browser)
    Sentry.captureException(error)
  })
}

function getStoredToken() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY))?.token ?? null
  } catch {
    return null
  }
}

export async function apiFetch(path, {
  body,
  method,
  token,
  signal,
  ...rest
} = {}) {
  const resolvedMethod = method ?? (body !== undefined ? 'POST' : 'GET')
  const url = `${BASE}${path}`

  const resolvedToken = token ?? getStoredToken()
  const headers = { 'Content-Type': 'application/json' }
  if (resolvedToken) headers['Authorization'] = `Bearer ${resolvedToken}`

  const requestContext = {
    url,
    path,
    method: resolvedMethod,
    body: redact(body),
  }

  try {
    const res = await fetch(url, {
      method: resolvedMethod,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal,
      ...rest,
    })

    const data = await parseResponseBody(res)
    if (!res.ok) {
      if (res.status === 401) window.dispatchEvent(new Event('auth:unauthorized'))
      const message = getResponseMessage(data, res.status)
      const error = new ApiFetchError(message, {
        request: requestContext,
        response: {
          status: res.status,
          statusText: res.statusText,
          body: limitBody(redact(data)),
        },
        browser: null,
      })
      captureApiError(error, error.context)
      throw error
    }

    return data
  } catch (error) {
    if (error?.name === 'AbortError') {
      return null
    }

    if (!(error instanceof ApiFetchError)) {
      const networkError = new ApiFetchError(`Network request failed: ${resolvedMethod} ${path}`, {
        request: requestContext,
        response: null,
        browser: {
          originalErrorName: error?.name,
          originalErrorMessage: error?.message,
          online: navigator.onLine,
          userAgent: navigator.userAgent,
        },
      })
      networkError.cause = error
      captureApiError(networkError, networkError.context)
    }

    throw error
  }
}
