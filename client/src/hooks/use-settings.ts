import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { localStorageService, type Settings } from "@/lib/localStorage";
import { syncLocalToSupabaseIfConnected } from "@/lib/supabase";
import { useSyncFromCloud } from "@/contexts/SyncContext";

const defaultSettings: Settings = {
  currencyCode: 'MGA',
  currencySymbol: 'Ar',
  language: 'en',
  plan: 'free',
};

export function useSettings() {
  return useQuery({
    queryKey: ['settings'],
    queryFn: () => {
      try {
        return localStorageService.getSettings();
      } catch (error) {
        console.error('[useSettings] Failed to load settings:', error);
        return defaultSettings;
      }
    },
    // Configuration spécifique pour le mode hors-ligne
    staleTime: Infinity,
    gcTime: Infinity,
    retry: false,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    // Retourner les settings par défaut si rien n'est disponible
    initialData: () => {
      try {
        return localStorageService.getSettings();
      } catch {
        return defaultSettings;
      }
    },
  });
}

export function useUpdateSettings() {
  const queryClient = useQueryClient();
  const { setSyncingToCloud } = useSyncFromCloud();
  return useMutation({
    mutationFn: async (settings: Settings) => {
      localStorageService.setSettings(settings);
      return settings;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      setSyncingToCloud(true);
      syncLocalToSupabaseIfConnected().finally(() => setSyncingToCloud(false));
    },
  });
}
