import { apiFetch } from './api'

const COUNTRIES = '/api/countries'

export const countriesApi = {
  /** GET /api/countries  (public)
   *  Optional query: ?active=true|false
   */
  getCountries: (active) => {
    const qs = active !== undefined ? `?active=${active}` : ''
    return apiFetch(`${COUNTRIES}${qs}`)
  },

  /** GET /api/countries/:id  (public) */
  getCountryById: (id) =>
    apiFetch(`${COUNTRIES}/${id}`),

  /** POST /api/countries  (public) */
  createCountry: ({ name, code }) =>
    apiFetch(COUNTRIES, { body: { name, code } }),

  /** PUT /api/countries/:id  (public) */
  updateCountry: (id, data) =>
    apiFetch(`${COUNTRIES}/${id}`, { method: 'PUT', body: data }),

  /** DELETE /api/countries/:id  (public) */
  deleteCountry: (id) =>
    apiFetch(`${COUNTRIES}/${id}`, { method: 'DELETE' }),

  /** PATCH /api/countries/:id/suspend  (public) */
  suspendCountry: (id) =>
    apiFetch(`${COUNTRIES}/${id}/suspend`, { method: 'PATCH', body: {} }),

  /** PATCH /api/countries/:id/activate  (public) */
  activateCountry: (id) =>
    apiFetch(`${COUNTRIES}/${id}/activate`, { method: 'PATCH', body: {} }),
}
