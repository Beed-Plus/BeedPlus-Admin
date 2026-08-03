import { createContext, useContext } from "react";
import { useCategories } from "../hooks/useCategories";
import { AuthContext } from "./AuthContext";

export type CategoriesContextType = ReturnType<typeof useCategories>;

export const CategoriesContext = createContext<CategoriesContextType | null>(
  null,
);

export const CategoriesProvider = ({ children }: any) => {
  const authContext = useContext(AuthContext) as { auth?: { token?: string } } | null;
  const token = authContext?.auth?.token;
  const categoriesValue = useCategories(token);

  return (
    <CategoriesContext.Provider value={categoriesValue}>
      {children}
    </CategoriesContext.Provider>
  );
};

