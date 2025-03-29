import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { CookiesProvider } from "react-cookie";
import { Toaster } from "react-hot-toast";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <CookiesProvider>
      <App />
      <Toaster />
    </CookiesProvider>
  </StrictMode>
);
