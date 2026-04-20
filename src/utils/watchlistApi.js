import { apiFetch } from './api'

const WL = '/api/watchlist'

export const watchlistApi = {
  /** GET /api/watchlist  (admin) */
  getWatchlist: (token, { category, country } = {}) => {
    const qs = new URLSearchParams()
    if (category) qs.set('category', category)
    if (country)  qs.set('country',  country)
    const q = qs.toString()
    return apiFetch(`${WL}${q ? `?${q}` : ''}`, { token })
  },

  /** POST /api/watchlist/:mediaId  (admin) */
  addToWatchlist: (mediaId, token) =>
    apiFetch(`${WL}/${mediaId}`, { body: {}, token }),

  /** DELETE /api/watchlist/:mediaId  (admin) */
  removeFromWatchlist: (mediaId, token) =>
    apiFetch(`${WL}/${mediaId}`, { method: 'DELETE', token }),
}
