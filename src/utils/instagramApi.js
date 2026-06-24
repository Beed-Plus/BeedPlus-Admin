import { apiFetch } from "./api";

const IG = "/api/instagram";

export const instagramApi = {
  /** GET /api/instagram/profile  (auth) */
  getProfile: (token) => apiFetch(`${IG}/profile`, { token }),

  /** POST /api/instagram/submit-media  (auth) */
  submitMedia: ({ mediaId, category, subCategory }, token) =>
    apiFetch(`${IG}/submit-media`, {
      body: { mediaId, category, subCategory },
      token,
    }),

  /** GET /api/instagram/submitted-media  (admin auth) */
  getAllSubmittedMediaForAdmin: (token) =>
    apiFetch(`${IG}/submitted-media`, { token }),

  /** GET /api/instagram/submitted-media/:id  (auth) */
  getSubmittedMedia: (id, token) =>
    apiFetch(`${IG}/submitted-media/${id}`, { token }),

  /** GET /api/instagram/media/:id/stats  (auth) */
  getMediaStats: (id, token) => apiFetch(`${IG}/media/${id}/stats`, { token }),

  /** GET /api/instagram/admin/media/:id  (admin) — full data including dailyInsights */
  getMediaByIdForAdmin: (id, token) =>
    apiFetch(`${IG}/admin/media/${id}`, { token }),

  /** PATCH /api/instagram/admin/media/:id/category  (admin) */
  updateMediaCategory: (id, { category, subCategory }, token) =>
    apiFetch(`${IG}/admin/media/${id}/category`, {
      method: "PATCH",
      body: { category, subCategory },
      token,
    }),

  /** GET /api/instagram/daily-top-100  (public) */
  getDailyTop100: () => apiFetch(`${IG}/daily-top-100`),

  /** GET /api/instagram/ranking-dates  (public) */
  getRankingDates: () => apiFetch(`${IG}/ranking-dates`),

  /** GET /api/instagram/rankings-by-date/:date  (public) */
  getRankingsByDate: (date) => apiFetch(`${IG}/rankings-by-date/${date}`),

  /** GET /api/instagram/daily-top-10  (public) */
  getDailyTop10: () => apiFetch(`${IG}/daily-top-10`),

  /** GET /api/instagram/daily-top-100/:category  (public) */
  getDailyTop100ByCategory: (category) =>
    apiFetch(`${IG}/daily-top-100/${category}`),

  /** GET /api/instagram/daily-top-10/:category  (public) */
  getDailyTop10ByCategory: (category) =>
    apiFetch(`${IG}/daily-top-10/${category}`),

  /** GET /api/instagram/creator-rankings  (public) */
  getCreatorRankings: () => apiFetch(`${IG}/creator-rankings`),

  /** GET /api/instagram/creator-monthly-top-100  (public) */
  getCreatorMonthlyTop100: () => apiFetch(`${IG}/rankings/creator`),

  /** GET /api/instagram/creator-monthly-top-10  (public) */
  getCreatorMonthlyTop10: () => apiFetch(`${IG}/rankings/creator`),

  /** GET /api/instagram/top-hits  (public) */
  getTopHits: () => apiFetch(`${IG}/top-hits`),

  /** POST /api/instagram/media/:mediaId/click  (public) */
  recordClick: (mediaId) => apiFetch(`${IG}/media/${mediaId}/click`),

  /** GET /api/instagram/media-chart  (public) — all media with daily_reach > 0 */
  getMediaChart: () => apiFetch(`${IG}/rankings/media`),

  /** GET /api/instagram/rankings/media?country=&category=  (public) */
  getMediaChartFiltered: ({ country, category } = {}) => {
    const qs = new URLSearchParams();
    if (country) qs.set("country", country);
    if (category) qs.set("category", category);
    const q = qs.toString();
    return apiFetch(`${IG}/rankings/media${q ? `?${q}` : ""}`);
  },

  /** GET /api/instagram/media-chart/:date  (public) */
  getMediaChartByDate: (date) => apiFetch(`${IG}/media-chart/${date}`),

  /** GET /api/instagram/oembed?url=...  (public) */
  getOembed: (url) => apiFetch(`${IG}/oembed?url=${encodeURIComponent(url)}`),

  /** POST /api/instagram/disconnect  (auth) */
  disconnect: (token) => apiFetch(`${IG}/disconnect`, { body: {}, token }),

  /** GET /api/instagram/watch-feed?page=1&limit=20  (public) */
  getWatchFeed: ({ page = 1, limit = 20 } = {}) =>
    apiFetch(`${IG}/watch-feed?page=${page}&limit=${limit}`),

  // ─── Pending media review ──────────────────────────────────────────────────

  /** GET /api/instagram/admin/pending-media?status=pending  (admin) */
  getPendingMediaForAdmin: (token, status = "pending") =>
    apiFetch(`${IG}/admin/pending-media?status=${status}`, { token }),

  /** POST /api/instagram/admin/pending-media/:id/approve  (admin) */
  approvePendingMedia: (id, { category, subCategory } = {}, token) =>
    apiFetch(`${IG}/admin/pending-media/${id}/approve`, {
      body: { category, subCategory },
      token,
    }),

  /** POST /api/instagram/admin/pending-media/:id/reject  (admin) */
  rejectPendingMedia: (id, { reason } = {}, token) =>
    apiFetch(`${IG}/admin/pending-media/${id}/reject`, {
      method: "POST",
      body: { reason },
      token,
    }),

  // ─── Admin creator media tools ─────────────────────────────────────────────

  /** GET /api/instagram/admin/user/:userId/instagram-media  (admin) */
  adminGetUserInstagramMedia: (userId, token, { after, limit } = {}) => {
    const qs = new URLSearchParams();
    if (after) qs.set("after", after);
    if (limit) qs.set("limit", limit);
    const q = qs.toString();
    return apiFetch(
      `${IG}/admin/user/${userId}/instagram-media${q ? `?${q}` : ""}`,
      { token },
    );
  },

  /** POST /api/instagram/admin/direct-submit  (admin) */
  adminDirectSubmit: ({ userId, mediaId, category, subCategory }, token) =>
    apiFetch(`${IG}/admin/direct-submit`, {
      body: { userId, mediaId, category, subCategory },
      token,
    }),
};
