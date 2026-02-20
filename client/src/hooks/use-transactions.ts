import { useMutation, useQueryClient } from "@tanstack/react-query";
import { localStorageService } from "@/lib/localStorage";
import { syncLocalToSupabaseIfConnected } from "@/lib/supabase";
import { useSyncFromCloud } from "@/contexts/SyncContext";
import { insertTransactionSchema } from "@shared/schema";
import type { z } from "zod";

type InsertTransaction = z.infer<typeof insertTransactionSchema>;

export function useCreateTransaction() {
  const queryClient = useQueryClient();
  const { setSyncingToCloud } = useSyncFromCloud();
  return useMutation({
    mutationFn: async (data: InsertTransaction) => {
      try {
        // Vérifier que le goal existe
        const goal = localStorageService.getGoal(data.goalId);
        if (!goal) {
          throw new Error("Goal not found");
        }

        const transaction = localStorageService.createTransaction({
          goalId: data.goalId,
          amount: data.amount,
          note: data.note || null,
        });
        
        console.log('[useCreateTransaction] Transaction created:', transaction);
        return { transaction, goalId: data.goalId };
      } catch (error) {
        console.error('[useCreateTransaction] Failed to create transaction:', error);
        throw error;
      }
    },
    onSuccess: (result) => {
      try {
        const goals = localStorageService.getGoals();
        queryClient.setQueryData(['goals'], goals);
        const updatedGoal = localStorageService.getGoal(result.goalId);
        if (updatedGoal) {
          queryClient.setQueryData(['goal', result.goalId], updatedGoal);
        }
      } catch (error) {
        console.error('[useCreateTransaction] Failed to refresh cache:', error);
      }
      setSyncingToCloud(true);
      syncLocalToSupabaseIfConnected().finally(() => setSyncingToCloud(false));
    },
    onError: (error) => {
      console.error('[useCreateTransaction] Mutation error:', error);
    },
    // Configuration pour le mode hors-ligne
    retry: false,
  });
}
