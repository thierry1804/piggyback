import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { localStorageService } from "./lib/localStorage";

// Vérifier que localStorage est disponible
function isLocalStorageAvailable(): boolean {
  try {
    const testKey = '__piggyback_test__';
    localStorage.setItem(testKey, 'test');
    localStorage.removeItem(testKey);
    return true;
  } catch (e) {
    console.error('[App] localStorage not available:', e);
    return false;
  }
}

// Initialiser l'application
function initializeApp(): void {
  if (!isLocalStorageAvailable()) {
    console.error('[App] localStorage is required for this app to work');
    document.getElementById("root")!.innerHTML = `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; padding: 20px; text-align: center; font-family: system-ui, sans-serif;">
        <h1 style="color: #7c3aed; margin-bottom: 16px;">Piggyback</h1>
        <p style="color: #64748b; max-width: 400px;">Cette application nécessite le stockage local pour fonctionner. Veuillez vérifier que votre navigateur autorise le stockage local et que vous n'êtes pas en mode navigation privée.</p>
      </div>
    `;
    return;
  }

  // Initialiser les données de démo si nécessaire
  try {
    localStorageService.initializeDemoData();
    console.log('[App] localStorage initialized successfully');
  } catch (e) {
    console.error('[App] Failed to initialize localStorage:', e);
  }

  // Rendre l'application
  createRoot(document.getElementById("root")!).render(<App />);
}

// Register Service Worker for offline support
function registerServiceWorker(): void {
  if (!('serviceWorker' in navigator)) {
    console.log('[App] Service Workers not supported');
    return;
  }

  // Attendre que la page soit complètement chargée
  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('[App] Service Worker registered:', registration.scope);
      
      // Vérifier les mises à jour périodiquement
      setInterval(() => {
        registration.update().catch(() => {
          // Ignorer les erreurs de mise à jour en mode hors-ligne
        });
      }, 60 * 60 * 1000); // Toutes les heures
      
      // Gérer les mises à jour
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              console.log('[App] New version available! Refresh to update.');
            }
          });
        }
      });

      // Forcer l'activation immédiate si c'est la première fois
      if (!navigator.serviceWorker.controller) {
        registration.addEventListener('activate', () => {
          console.log('[App] Service Worker activated for the first time');
        });
      }
    } catch (error) {
      console.error('[App] Service Worker registration failed:', error);
    }
  });
}

// Démarrer l'application
initializeApp();
registerServiceWorker();
