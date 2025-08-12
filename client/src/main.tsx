import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import "./index-enhanced.css";

// Hide loading fallback when React loads
const loadingFallback = document.getElementById("loading-fallback");
if (loadingFallback) {
  loadingFallback.style.display = "none";
}

createRoot(document.getElementById("root")!).render(<App />);
