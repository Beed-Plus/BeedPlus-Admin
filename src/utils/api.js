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
 *
 * @param {string} path  - e.g. '/api/auth/login'
 * @param {object} opts
 * @param {any}    [opts.body]    - Will be JSON-serialised; setting this defaults method to POST.
 * @param {string} [opts.method] - HTTP method (defaults to POST when body present, GET otherwise).
 * @param {string} [opts.token]  - Bearer token appended to the Authorization header.
 */
const STORAGE_KEY = 'beedplus_admin_auth'

function getStoredToken() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY))?.token ?? null
  } catch {
    return null
  }
}

export async function apiFetch(path, { body, method, token, ...rest } = {}) {
  const resolvedMethod = method ?? (body !== undefined ? 'POST' : 'GET')

  const resolvedToken = token ?? getStoredToken()
  const headers = { 'Content-Type': 'application/json' }
  if (resolvedToken) headers['Authorization'] = `Bearer ${resolvedToken}`

  const res = await fetch(`${BASE}${path}`, {
    method: resolvedMethod,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    ...rest,
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    if (res.status === 401) window.dispatchEvent(new Event('auth:unauthorized'))
    throw new Error(data.message ?? `Request failed (${res.status})`)
  }
  return data
}
