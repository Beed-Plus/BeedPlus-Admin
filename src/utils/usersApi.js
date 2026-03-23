import { apiFetch } from './api'

const USERS = '/api/users'

export const usersApi = {
  /** GET /api/users  (admin)
   *  Query params: page, limit, category, country, isVerified, approvalStatus
   */
  getUsers: ({ page = 1, limit = 20, category, country, isVerified, approvalStatus, search } = {}, token) => {
    const params = new URLSearchParams({ page, limit })
    if (category)       params.set('category', category)
    if (country)        params.set('country', country)
    if (isVerified !== undefined) params.set('isVerified', isVerified)
    if (approvalStatus) params.set('approvalStatus', approvalStatus)
    if (search)         params.set('search', search)
    return apiFetch(`${USERS}?${params}`, { token })
  },

  /** GET /api/users/me  (auth) */
  getMe: (token) =>
    apiFetch(`${USERS}/me`, { token }),

  /** PUT /api/users/me  (auth) */
  updateMe: (data, token) =>
    apiFetch(`${USERS}/me`, { method: 'PUT', body: data, token }),

  /** PUT /api/users/change-password  (auth) */
  changePassword: (currentPassword, newPassword, token) =>
    apiFetch(`${USERS}/change-password`, { method: 'PUT', body: { currentPassword, newPassword }, token }),

  /** GET /api/users/:id  (admin) */
  getUserById: (id, token) =>
    apiFetch(`${USERS}/${id}`, { token }),

  /** PUT /api/users/:id/role  (admin)
   *  role: "user" | "admin" | "campaign_manager" | "super_admin"
   */
  updateUserRole: (id, role, token) =>
    apiFetch(`${USERS}/${id}/role`, { method: 'PUT', body: { role }, token }),

  /** DELETE /api/users/:id  (admin) */
  deleteUser: (id, token) =>
    apiFetch(`${USERS}/${id}`, { method: 'DELETE', token }),

  /** PUT /api/auth/approve-instagram-connect/:userId  (admin) */
  approveUser: (id, token) =>
    apiFetch(`/api/auth/approve-instagram-connect/${id}`, { method: 'PUT', token }),

  /** PATCH /api/users/:id/category  (admin) — accepts category and/or country */
  updateUserCategory: (id, { category, country }, token) =>
    apiFetch(`${USERS}/${id}/category`, { method: 'PATCH', body: { category, country }, token }),
}
