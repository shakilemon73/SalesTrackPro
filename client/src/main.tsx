import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import "./index-enhanced.css";

console.log('🚀 MAIN: React starting to load...');

// Hide loading fallback when React loads
const loadingFallback = document.getElementById("loading-fallback");
if (loadingFallback) {
  loadingFallback.style.display = "none";
  console.log('🚀 MAIN: Loading fallback hidden, React UI should appear');
}

console.log('🚀 MAIN: Creating React root and rendering App...');
createRoot(document.getElementById("root")!).render(<App />);
