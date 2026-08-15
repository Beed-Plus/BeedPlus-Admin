import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./sentry.js";
import "./index.css";
import App from "./App.jsx";
import * as Sentry from "@sentry/react";

const container = document.getElementById("root");
const root = createRoot(container, {
  onCaughtError: Sentry.reactErrorHandler(),
  onUncaughtError: Sentry.reactErrorHandler(),
  onRecoverableError: Sentry.reactErrorHandler(),
});

root.render(
  <StrictMode>
    <App />
  </StrictMode>,
);
