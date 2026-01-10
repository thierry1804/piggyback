import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { localStorageService } from "./lib/localStorage";

// Initialiser les données de démo si nécessaire
localStorageService.initializeDemoData();

// Register Service Worker for offline support
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('[App] Service Worker registered:', registration.scope);
        
        // Check for updates periodically
        setInterval(() => {
          registration.update();
        }, 60 * 60 * 1000); // Check every hour
        
        // Handle updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // New content is available, show update notification
                console.log('[App] New version available! Refresh to update.');
              }
            });
          }
        });
      })
      .catch((error) => {
        console.error('[App] Service Worker registration failed:', error);
      });
  });
}

createRoot(document.getElementById("root")!).render(<App />);
