import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { localStorageService, type Settings } from "@/lib/localStorage";

export function useSettings() {
  return useQuery({
    queryKey: ['settings'],
    queryFn: () => localStorageService.getSettings(),
  });
}

export function useUpdateSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (settings: Settings) => {
      localStorageService.setSettings(settings);
      return settings;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      // Invalider aussi les goals pour qu'ils se mettent à jour avec la nouvelle monnaie
      queryClient.invalidateQueries({ queryKey: ['goals'] });
    },
  });
}
