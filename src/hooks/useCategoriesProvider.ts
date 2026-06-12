import { useContext } from "react";
import {
  CategoriesContext,
  CategoriesContextType,
} from "../context/CategoriesContext";

export const useCategoriesProvider = (): CategoriesContextType => {
  const context = useContext(CategoriesContext);
  if (!context)
    throw new Error(
      "useCategoriesContext must be used within CategoriesProvider",
    );
  return context;
};
