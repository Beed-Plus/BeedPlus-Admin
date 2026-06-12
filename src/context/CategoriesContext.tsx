import { createContext, useContext } from "react";
import { useCategories } from "../hooks/useCategories";
import { useAuth } from "../hooks/useAuth";

export type CategoriesContextType = ReturnType<typeof useCategories>;

export const CategoriesContext = createContext<CategoriesContextType | null>(
  null,
);

export const CategoriesProvider = ({ children }: any) => {
  const {auth} = useAuth()
  const categoriesValue = useCategories(auth?.token);
  return (
    <CategoriesContext.Provider value={categoriesValue}>
      {children}
    </CategoriesContext.Provider>
  );
};

