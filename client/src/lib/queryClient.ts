import { QueryClient } from "@tanstack/react-query";

/**
 * Configuration optimisée pour une application 100% hors-ligne
 * Toutes les données sont stockées dans localStorage, pas de requêtes réseau
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Pas de refetch automatique - les données sont locales
      refetchInterval: false,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: false,
      
      // Les données sont toujours fraîches (stockage local)
      staleTime: Infinity,
      gcTime: Infinity, // Garder les données en cache indéfiniment
      
      // Pas de retry - localStorage est synchrone et ne fail pas
      retry: false,
      
      // Gestion d'erreur silencieuse pour le mode hors-ligne
      throwOnError: false,
      
      // Activer les queries par défaut
      enabled: true,
      
      // Pas de suspense pour éviter les problèmes de chargement
      suspense: false,
      
      // Comportement réseau - toujours exécuter les queries (données locales)
      networkMode: 'always',
    },
    mutations: {
      // Pas de retry pour les mutations
      retry: false,
      
      // Toujours exécuter les mutations (données locales)
      networkMode: 'always',
      
      // Gestion d'erreur silencieuse
      throwOnError: false,
    },
  },
});
