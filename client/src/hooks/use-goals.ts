import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type InsertGoal } from "@shared/routes";

export function useGoals() {
  return useQuery({
    queryKey: [api.goals.list.path],
    queryFn: async () => {
      const res = await fetch(api.goals.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch goals");
      return api.goals.list.responses[200].parse(await res.json());
    },
  });
}

export function useGoal(id: number) {
  return useQuery({
    queryKey: [api.goals.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.goals.get.path, { id });
      const res = await fetch(url, { credentials: "include" });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch goal details");
      return api.goals.get.responses[200].parse(await res.json());
    },
    enabled: !isNaN(id),
  });
}

export function useCreateGoal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertGoal) => {
      // Data is expected to be validated by the form before calling this
      // The amount should already be in cents from the UI logic
      const res = await fetch(api.goals.create.path, {
        method: api.goals.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      
      if (!res.ok) {
        if (res.status === 400) {
          const error = api.goals.create.responses[400].parse(await res.json());
          throw new Error(error.message);
        }
        throw new Error("Failed to create goal");
      }
      return api.goals.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.goals.list.path] });
    },
  });
}

export function useDeleteGoal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.goals.delete.path, { id });
      const res = await fetch(url, { 
        method: api.goals.delete.method,
        credentials: "include" 
      });
      
      if (!res.ok) {
        if (res.status === 404) throw new Error("Goal not found");
        throw new Error("Failed to delete goal");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.goals.list.path] });
    },
  });
}
