import { useEffect } from "react";
import * as Sentry from "@sentry/react";
import {
  isRouteErrorResponse,
  useLocation,
  useRouteError,
} from "react-router-dom";

export default function RouteErrorBoundary() {
  const error = useRouteError();
  const location = useLocation();

  useEffect(() => {
    Sentry.withScope((scope) => {
      scope.setTag("error.boundary", "react-router");
      scope.setContext("route", {
        pathname: location.pathname,
        search: location.search,
      });

      if (isRouteErrorResponse(error)) {
        scope.setContext("route_error_response", {
          status: error.status,
          statusText: error.statusText,
          data: error.data,
        });
        Sentry.captureException(new Error(`Route error ${error.status}: ${error.statusText}`));
        return;
      }

      Sentry.captureException(error);
    });
  }, [error, location.pathname, location.search]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-6 text-center text-[#2F3134] dark:bg-gray-950 dark:text-white">
      <div>
        <h1 className="text-xl font-semibold">Page failed to load</h1>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          The error has been reported. Refresh the page to try again.
        </p>
      </div>
    </div>
  );
}

