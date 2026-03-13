import { apiFetch } from './api'

export const activitiesApi = {
  /** GET /api/activities?limit=N  (auth) */
  getActivities: (token, limit = 20) =>
    apiFetch(`/api/activities?limit=${limit}`, { token }),
}
