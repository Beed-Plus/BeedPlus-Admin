import { apiFetch } from './api'

const AUTH = '/api/auth'

export const authApi = {
  /** POST /api/auth/login */
  login: (email, password) =>
    apiFetch(`${AUTH}/login`, { body: { email, password } }),

  /** POST /api/auth/signup */
  signup: (data) =>
    apiFetch(`${AUTH}/signup`, { body: data }),

  /** POST /api/auth/verify-email */
  verifyEmail: (code) =>
    apiFetch(`${AUTH}/verify-email`, { body: { code } }),

  /** POST /api/auth/forgot-password */
  forgotPassword: (email) =>
    apiFetch(`${AUTH}/forgot-password`, { body: { email } }),

  /** POST /api/auth/reset-password?token=... */
  resetPassword: (token, password) =>
    apiFetch(`${AUTH}/reset-password?token=${token}`, { body: { password } }),

  /** PUT /api/auth/instagram-connect  (auth required) */
  instagramConnect: (instagramCode, token) =>
    apiFetch(`${AUTH}/instagram-connect`, { method: 'PUT', body: { instagramCode }, token }),

  /** PUT /api/auth/approve-instagram-connect/:userId  (admin) */
  approveInstagramConnect: (userId, token) =>
    apiFetch(`${AUTH}/approve-instagram-connect/${userId}`, { method: 'PUT', token }),

  /** PUT /api/auth/reset-instagram-connect  (auth required) */
  resetInstagramConnect: (token) =>
    apiFetch(`${AUTH}/reset-instagram-connect`, { method: 'PUT', token }),
}
