import { RouterProvider } from "react-router-dom";
import router from "./routes";
import { AuthProvider } from "./context/AuthContext";
import { CategoriesProvider } from "./context/CategoriesContext";

export default function App() {
  return (
    <AuthProvider>
      <CategoriesProvider>
        <RouterProvider router={router} />
      </CategoriesProvider>
    </AuthProvider>
  );
}
