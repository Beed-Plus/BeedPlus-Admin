import { useApiCall } from "./useApiCall";
import { categoriesApi } from "../utils/categoriesApi";
import { useEffect, useState } from "react";
import { subCategoriesApi } from "../utils/subCategoriesApi";

export function useCategories(token?: string) {
  const [categories, setCategories] = useState<any[]>([]);
  const [subCategories, setSubCategories] = useState<any[]>([]);

  const getCategories = useApiCall(categoriesApi.getCategories);
  const getCategoryById = useApiCall(categoriesApi.getCategoryById);
  const createCategory = useApiCall(categoriesApi.createCategory);
  const updateCategory = useApiCall(categoriesApi.updateCategory);
  const deleteCategory = useApiCall(categoriesApi.deleteCategory);
  const reorderCategory = useApiCall(categoriesApi.reorderCategories);

  const getSubCategories = useApiCall(subCategoriesApi.getSubCategories);
  const getSubCategoryById = useApiCall(subCategoriesApi.getSubCategoryById);
  const createSubCategory = useApiCall(subCategoriesApi.createSubCategory);
  const updateSubCategory = useApiCall(subCategoriesApi.updateSubCategory);
  const deleteSubCategory = useApiCall(subCategoriesApi.deleteSubCategory);
  const reorderSubCategory = useApiCall(subCategoriesApi.reorderSubCategories);

  useEffect(() => {
    getCategories.run().then((data) => {
      if (data) setCategories(data.categories);
    });
  }, [token]);
  useEffect(() => {
    getSubCategories.run().then((data) => {
      if (data) setSubCategories(data.subCategories);
    });
  }, [token]);

  const handleCreate = async (payload: any) => {
    const newCategory = await createCategory.run(payload);
    if (newCategory) setCategories((prev) => [...prev, newCategory.category]);
  };

  const handleUpdate = async (id: string, payload: any) => {
    const updated = await updateCategory.run(id, payload);
    if (updated)
      setCategories((prev) =>
        prev.map((c) => (c._id === id ? updated.category : c)),
      );
  };

  const handleDelete = async (id: string) => {
    await deleteCategory.run(id);
    setCategories((prev) => prev.filter((c) => c._id !== id));
  };
  const handleReorder = async (ids: any) => {
    const res = await reorderCategory.run(ids);
  };

  // SYB CATEGORIES
  const handleCreateSub = async (payload: any) => {
    const newCategory = await createSubCategory.run(payload);
    if (newCategory)
      setSubCategories((prev) => [...prev, newCategory.subCategory]);
  };

  const handleUpdateSub = async (id: string, payload: any) => {
    const updated = await updateSubCategory.run(id, payload);
    if (updated)
      setSubCategories((prev) =>
        prev.map((c) => (c._id === id ? updated.subCategory : c)),
      );
  };

  const handleDeleteSub = async (id: string) => {
    await deleteSubCategory.run(id);
    setSubCategories((prev) => prev.filter((c) => c._id !== id));
  };
  const handleReorderSub = async (ids: any) => {
    const res = await reorderSubCategory.run(ids);
  };

  return {
    // The cached list — the main value of using context
    categories,
    setCategories,
    subCategories,
    setSubCategories,

    // Loading/error states per action
    isLoading: getCategories.loading,
    error: getCategories.error,

    // Actions — call these anywhere in the app
    fetchCategories: getCategories.run,
    getCategoryById: getCategoryById.run,
    createCategory: handleCreate,
    updateCategory: handleUpdate,
    deleteCategory: handleDelete,
    reorderCategory: handleReorder,

    fetchSubCategories: getSubCategories.run,
    getSubCategoryById: getSubCategoryById.run,
    createSubCategory: handleCreateSub,
    updateSubCategory: handleUpdateSub,
    deleteSubCategory: handleDeleteSub,
    reorderSubCategory: handleReorderSub,
  };
}
