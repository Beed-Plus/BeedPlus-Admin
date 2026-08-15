import { RouterProvider } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import * as Sentry from "@sentry/react";
import router from "./routes";
import { AuthProvider } from "./context/AuthContext";
import { CategoriesProvider } from "./context/CategoriesContext";

export default function App() {
  return (
    <>
      <Toaster position="top-right" reverseOrder={false} />
      <AuthProvider>
        <CategoriesProvider>
          <Sentry.ErrorBoundary
            fallback={
              <div className="flex min-h-screen items-center justify-center bg-white px-6 text-center text-[#2F3134] dark:bg-gray-950 dark:text-white">
                <div>
                  <h1 className="text-xl font-semibold">Something went wrong</h1>
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    The error has been reported. Refresh the page to try again.
                  </p>
                </div>
              </div>
            }
          >
            <RouterProvider router={router} />
          </Sentry.ErrorBoundary>
        </CategoriesProvider>
      </AuthProvider>
    </>
  );
}
