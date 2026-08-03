import { apiFetch } from './api'

const WL = '/api/scenes?limit=100'

export const scenesApi = {
  /** GET /api/scenes  (admin) */
  getScenes: (token, { category, country } = {}) => {
    const qs = new URLSearchParams()
    if (category) qs.set('category', category)
    if (country)  qs.set('country',  country)
    const q = qs.toString()
    return apiFetch(`${WL}${q ? `?${q}` : ''}`, { token })
  },

  /** POST /api/scenes  (admin) */
  updateScene: (id, inScenes, token) =>
    apiFetch(`${WL}`, { body: {id, inScenes}, method: "PUT", token }),
}
