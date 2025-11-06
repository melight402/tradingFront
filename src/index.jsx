import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import App from "./App";

const rootElement = document.getElementById("root");
if (!rootElement) {
  void 0;
} else {
  try {
    const root = createRoot(rootElement);
    root.render(
      <StrictMode>
        <App />
      </StrictMode>
    );
  } catch (error) {
    rootElement.innerHTML = `<div style="color: red; padding: 20px;"><h1>Error loading app</h1><pre>${error.message}\n${error.stack}</pre></div>`;
  }
}
