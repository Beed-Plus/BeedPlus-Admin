import { useApiCall } from './useApiCall'
import { categoriesApi } from '../utils/categoriesApi'

export function useCategories() {
  const getCategories   = useApiCall(categoriesApi.getCategories)
  const getCategoryById = useApiCall(categoriesApi.getCategoryById)
  const createCategory  = useApiCall(categoriesApi.createCategory)
  const updateCategory  = useApiCall(categoriesApi.updateCategory)
  const deleteCategory  = useApiCall(categoriesApi.deleteCategory)

  return {
    getCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory,
  }
}
