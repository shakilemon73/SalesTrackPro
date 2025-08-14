import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import "./index-enhanced.css";

console.log('🚀 MAIN: React starting to load...');

// Force cache clear for development
if (import.meta.env.DEV) {
  console.log('🔄 DEV: Forcing cache refresh');
  // Clear any cached modules
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(registrations => {
      registrations.forEach(registration => registration.unregister());
    });
  }
}

createRoot(document.getElementById("root")!).render(<App />);
