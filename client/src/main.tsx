import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import "./index-enhanced.css";

console.log('🚀 MAIN: React starting to load...');
createRoot(document.getElementById("root")!).render(<App />);
