import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { useProjectStore } from "./store/projectStore";

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Root element #root not found");

// Dev-помощник для ручного QA: snapshot состояния store прямо из консоли.
if (import.meta.env.DEV) {
  (window as unknown as { __store: typeof useProjectStore }).__store = useProjectStore;
}

createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
