import { useApiCall } from './useApiCall'
import { subCategoriesApi } from '../utils/subCategoriesApi'

export function useSubCategories() {
  const getSubCategories   = useApiCall(subCategoriesApi.getSubCategories)
  const getSubCategoryById = useApiCall(subCategoriesApi.getSubCategoryById)
  const createSubCategory  = useApiCall(subCategoriesApi.createSubCategory)
  const findOrCreate       = useApiCall(subCategoriesApi.findOrCreate)
  const updateSubCategory  = useApiCall(subCategoriesApi.updateSubCategory)
  const deleteSubCategory  = useApiCall(subCategoriesApi.deleteSubCategory)

  return {
    getSubCategories,
    getSubCategoryById,
    createSubCategory,
    findOrCreate,
    updateSubCategory,
    deleteSubCategory,
  }
}
