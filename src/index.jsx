import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import App from "./App";

const rootElement = document.getElementById("root");
if (!rootElement) {
  console.error("Root element not found!");
} else {
  try {
    const root = createRoot(rootElement);
    root.render(
      <StrictMode>
        <App />
      </StrictMode>
    );
  } catch (error) {
    console.error("Error rendering app:", error);
    rootElement.innerHTML = `<div style="color: red; padding: 20px;"><h1>Error loading app</h1><pre>${error.message}\n${error.stack}</pre></div>`;
  }
}
