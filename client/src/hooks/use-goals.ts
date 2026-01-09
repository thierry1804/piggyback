import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { localStorageService, type Goal } from "@/lib/localStorage";
import { insertGoalSchema } from "@shared/schema";
import type { z } from "zod";

type InsertGoal = z.infer<typeof insertGoalSchema>;

export function useGoals() {
  return useQuery({
    queryKey: ['goals'],
    queryFn: () => {
      localStorageService.initializeDemoData();
      return localStorageService.getGoals();
    },
  });
}

export function useGoal(id: number) {
  return useQuery({
    queryKey: ['goal', id],
    queryFn: () => {
      const goal = localStorageService.getGoal(id);
      return goal || null;
    },
    enabled: !isNaN(id) && id > 0,
  });
}

export function useCreateGoal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertGoal) => {
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
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
    },
  });
}

export function useDeleteGoal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const goal = localStorageService.getGoal(id);
      if (!goal) {
        throw new Error("Goal not found");
      }
      localStorageService.deleteGoal(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
    },
  });
}
