import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type InsertTransaction } from "@shared/routes";

export function useCreateTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertTransaction) => {
      const res = await fetch(api.transactions.create.path, {
        method: api.transactions.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });

      if (!res.ok) {
        if (res.status === 400) {
          const error = api.transactions.create.responses[400].parse(await res.json());
          throw new Error(error.message);
        }
        if (res.status === 404) {
          throw new Error("Goal not found");
        }
        throw new Error("Failed to record transaction");
      }
      return api.transactions.create.responses[201].parse(await res.json());
    },
    onSuccess: (_, variables) => {
      // Invalidate both the specific goal detail and the main list (for totals)
      queryClient.invalidateQueries({ queryKey: [api.goals.list.path] });
      queryClient.invalidateQueries({ queryKey: ["/api/goals/:id", variables.goalId] });
    },
  });
}
