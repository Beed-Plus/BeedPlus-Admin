const BASE = import.meta.env.VITE_API_URL ?? ''

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
export async function apiFetch(path, { body, method, token, ...rest } = {}) {
  const resolvedMethod = method ?? (body !== undefined ? 'POST' : 'GET')

  const headers = { 'Content-Type': 'application/json' }
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(`${BASE}${path}`, {
    method: resolvedMethod,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    ...rest,
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.message ?? `Request failed (${res.status})`)
  return data
}
