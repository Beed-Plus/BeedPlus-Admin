import { apiFetch } from './api'

const CAT = '/api/categories'

export const categoriesApi = {
  /** GET /api/categories  (public) */
  getCategories: () =>
    apiFetch(CAT),

  /** GET /api/categories/:id  (public) */
  getCategoryById: (id) =>
    apiFetch(`${CAT}/${id}`),

  /** POST /api/categories  (public) */
  createCategory: ({ name, primaryColor, secondaryColor }) =>
    apiFetch(CAT, { body: { name, primaryColor, secondaryColor } }),

  /** PUT /api/categories/:id  (public) */
  updateCategory: (id, data) =>
    apiFetch(`${CAT}/${id}`, { method: 'PUT', body: data }),

  /** DELETE /api/categories/:id  (public) */
  deleteCategory: (id) =>
    apiFetch(`${CAT}/${id}`, { method: 'DELETE' }),

  /** PUT /api/categories/reorder  — ids in desired order */
  reorderCategories: (ids) =>
    apiFetch(`${CAT}/reorder`, { method: 'PUT', body: { ids } }),
}
