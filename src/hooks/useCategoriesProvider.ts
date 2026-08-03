import { useContext } from "react";
import {
  CategoriesContext,
  CategoriesContextType,
} from "../context/CategoriesContext";

export const useCategoriesProvider = (): CategoriesContextType => {
  const context = useContext(CategoriesContext);

  if (!context) {
    return {
      categories: [],
      setCategories: () => undefined,
      subCategories: [],
      setSubCategories: () => undefined,
      isLoading: false,
      error: null,
      fetchCategories: async () => undefined,
      getCategoryById: async () => undefined,
      createCategory: async () => undefined,
      updateCategory: async () => undefined,
      deleteCategory: async () => undefined,
      reorderCategory: async () => undefined,
      fetchSubCategories: async () => undefined,
      getSubCategoryById: async () => undefined,
      createSubCategory: async () => undefined,
      updateSubCategory: async () => undefined,
      deleteSubCategory: async () => undefined,
      reorderSubCategory: async () => undefined,
    } as unknown as CategoriesContextType;
  }

  return context;
};
