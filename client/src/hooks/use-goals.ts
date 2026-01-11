import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { localStorageService, type Goal } from "@/lib/localStorage";
import { insertGoalSchema } from "@shared/schema";
import type { z } from "zod";

type InsertGoal = z.infer<typeof insertGoalSchema>;

export function useGoals() {
  return useQuery({
    queryKey: ['goals'],
    queryFn: () => {
      try {
        localStorageService.initializeDemoData();
        return localStorageService.getGoals();
      } catch (error) {
        console.error('[useGoals] Failed to load goals:', error);
        return [];
      }
    },
    // Configuration spécifique pour le mode hors-ligne
    staleTime: Infinity,
    gcTime: Infinity,
    retry: false,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    // Toujours retourner un tableau vide par défaut
    initialData: () => {
      try {
        return localStorageService.getGoals();
      } catch {
        return [];
      }
    },
  });
}

export function useGoal(id: number) {
  return useQuery({
    queryKey: ['goal', id],
    queryFn: () => {
      try {
        const goal = localStorageService.getGoal(id);
        return goal || null;
      } catch (error) {
        console.error('[useGoal] Failed to load goal:', error);
        return null;
      }
    },
    enabled: !isNaN(id) && id > 0,
    // Configuration spécifique pour le mode hors-ligne
    staleTime: Infinity,
    gcTime: Infinity,
    retry: false,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
}

// Fonction utilitaire pour rafraîchir les données depuis localStorage
function refreshQueriesFromLocalStorage(queryClient: ReturnType<typeof useQueryClient>, goalId?: number) {
  // Mettre à jour directement les données du cache depuis localStorage (pas de refetch réseau)
  try {
    const goals = localStorageService.getGoals();
    queryClient.setQueryData(['goals'], goals);
    
    if (goalId) {
      const goal = localStorageService.getGoal(goalId);
      queryClient.setQueryData(['goal', goalId], goal || null);
    }
  } catch (error) {
    console.error('[refreshQueriesFromLocalStorage] Failed:', error);
  }
}

export function useCreateGoal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertGoal) => {
      try {
        // Utiliser la monnaie des settings
        const settings = localStorageService.getSettings();
        const goal = localStorageService.createGoal({
          name: data.name,
          description: data.description || null,
          targetAmount: data.targetAmount,
          icon: data.icon || "🐷",
          color: data.color || "blue",
          currencyCode: settings.currencyCode,
          currencySymbol: settings.currencySymbol,
          deadline: (data as any).deadline || null,
        });
        return goal;
      } catch (error) {
        console.error('[useCreateGoal] Failed to create goal:', error);
        throw error;
      }
    },
    onSuccess: () => {
      // Rafraîchir directement depuis localStorage (fonctionne hors-ligne)
      refreshQueriesFromLocalStorage(queryClient);
    },
    retry: false,
  });
}

export function useDeleteGoal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      try {
        const goal = localStorageService.getGoal(id);
        if (!goal) {
          throw new Error("Goal not found");
        }
        localStorageService.deleteGoal(id);
        return id;
      } catch (error) {
        console.error('[useDeleteGoal] Failed to delete goal:', error);
        throw error;
      }
    },
    onSuccess: (deletedId) => {
      // Rafraîchir directement depuis localStorage (fonctionne hors-ligne)
      refreshQueriesFromLocalStorage(queryClient);
      // Supprimer aussi le cache du goal spécifique
      queryClient.removeQueries({ queryKey: ['goal', deletedId] });
    },
    retry: false,
  });
}
