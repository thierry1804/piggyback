import { useQuery } from "@tanstack/react-query";
import { useSession } from "@/hooks/use-auth";
import { getMyGroupRole, type GroupRole } from "@/lib/supabase";

export function useGroupRole(): {
  role: GroupRole | null;
  isLoading: boolean;
  canEdit: boolean;
} {
  const { isSignedIn } = useSession();
  const { data: role, isLoading } = useQuery({
    queryKey: ["groupRole"],
    queryFn: () => getMyGroupRole(),
    enabled: !!isSignedIn,
    staleTime: 60_000,
  });
  const canEdit = role === "admin" || role === "contributor";
  return {
    role: role ?? null,
    isLoading,
    canEdit: role != null ? canEdit : true,
  };
}
