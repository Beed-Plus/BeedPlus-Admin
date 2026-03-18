import { apiFetch } from './api'

const IG = '/api/instagram'

export const instagramApi = {
  /** GET /api/instagram/profile  (auth) */
  getProfile: (token) =>
    apiFetch(`${IG}/profile`, { token }),

  /** POST /api/instagram/submit-media  (auth) */
  submitMedia: ({ mediaId, category, subCategory }, token) =>
    apiFetch(`${IG}/submit-media`, { body: { mediaId, category, subCategory }, token }),

  /** GET /api/instagram/submitted-media  (admin auth) */
  getAllSubmittedMediaForAdmin: (token) =>
    apiFetch(`${IG}/submitted-media`, { token }),

  /** GET /api/instagram/submitted-media/:id  (auth) */
  getSubmittedMedia: (id, token) =>
    apiFetch(`${IG}/submitted-media/${id}`, { token }),

  /** GET /api/instagram/admin/media/:id  (admin) — full data including dailyInsights */
  getMediaByIdForAdmin: (id, token) =>
    apiFetch(`${IG}/admin/media/${id}`, { token }),

  /** GET /api/instagram/daily-top-100  (public) */
  getDailyTop100: () =>
    apiFetch(`${IG}/daily-top-100`),

  /** GET /api/instagram/daily-top-10  (public) */
  getDailyTop10: () =>
    apiFetch(`${IG}/daily-top-10`),

  /** GET /api/instagram/daily-top-100/:category  (public) */
  getDailyTop100ByCategory: (category) =>
    apiFetch(`${IG}/daily-top-100/${category}`),

  /** GET /api/instagram/daily-top-10/:category  (public) */
  getDailyTop10ByCategory: (category) =>
    apiFetch(`${IG}/daily-top-10/${category}`),

  /** GET /api/instagram/creator-rankings  (public) */
  getCreatorRankings: () =>
    apiFetch(`${IG}/creator-rankings`),

  /** GET /api/instagram/creator-monthly-top-100  (public) */
  getCreatorMonthlyTop100: () =>
    apiFetch(`${IG}/creator-monthly-top-100`),

  /** GET /api/instagram/creator-monthly-top-10  (public) */
  getCreatorMonthlyTop10: () =>
    apiFetch(`${IG}/creator-monthly-top-10`),

  /** GET /api/instagram/top-hits  (public) */
  getTopHits: () =>
    apiFetch(`${IG}/top-hits`),

  /** POST /api/instagram/media/:mediaId/click  (public) */
  recordClick: (mediaId) =>
    apiFetch(`${IG}/media/${mediaId}/click`),

  /** POST /api/instagram/disconnect  (auth) */
  disconnect: (token) =>
    apiFetch(`${IG}/disconnect`, { body: {}, token }),
}
