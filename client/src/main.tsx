import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { localStorageService } from "./lib/localStorage";

// Initialiser les données de démo si nécessaire
localStorageService.initializeDemoData();

createRoot(document.getElementById("root")!).render(<App />);
