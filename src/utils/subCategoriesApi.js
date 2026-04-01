import { apiFetch } from './api'

const SUB = '/api/sub-categories'

export const subCategoriesApi = {
  /** GET /api/sub-categories  (public)
   *  Optional query: ?categoryId=...
   */
  getSubCategories: (categoryId) => {
    const qs = categoryId ? `?categoryId=${categoryId}` : ''
    return apiFetch(`${SUB}${qs}`)
  },

  /** GET /api/sub-categories/:id  (public) */
  getSubCategoryById: (id) =>
    apiFetch(`${SUB}/${id}`),

  /** POST /api/sub-categories  (public) */
  createSubCategory: ({ name, categoryId }) =>
    apiFetch(SUB, { body: { name, categoryId } }),

  /** POST /api/sub-categories/find-or-create  (admin) */
  findOrCreate: ({ name, categoryId }, token) =>
    apiFetch(`${SUB}/find-or-create`, { body: { name, categoryId }, token }),

  /** PUT /api/sub-categories/:id  (public) */
  updateSubCategory: (id, data) =>
    apiFetch(`${SUB}/${id}`, { method: 'PUT', body: data }),

  /** DELETE /api/sub-categories/:id  (public) */
  deleteSubCategory: (id) =>
    apiFetch(`${SUB}/${id}`, { method: 'DELETE' }),
}
