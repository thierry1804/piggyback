import { useMutation, useQueryClient } from "@tanstack/react-query";
import { localStorageService } from "@/lib/localStorage";
import { insertTransactionSchema } from "@shared/schema";
import type { z } from "zod";

type InsertTransaction = z.infer<typeof insertTransactionSchema>;

export function useCreateTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertTransaction) => {
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
      
      return transaction;
    },
    onSuccess: (_, variables) => {
      // Invalider à la fois les détails du goal spécifique et la liste principale
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      queryClient.invalidateQueries({ queryKey: ['goal', variables.goalId] });
    },
  });
}
