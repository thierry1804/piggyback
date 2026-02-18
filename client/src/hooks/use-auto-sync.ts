import { useRef, useEffect } from "react";
import { useLocation } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { getSupabase, runSmartSync } from "@/lib/supabase";
import { useSession } from "@/hooks/use-auth";

/**
 * Lance une smart sync une seule fois par session connectée lorsqu'on est dans /app.
 * Réinitialise le flag quand l'utilisateur se déconnecte.
 */
export function useAutoSync(): void {
  const location = useLocation();
  const { isSignedIn, isLoading: authLoading } = useSession();
  const queryClient = useQueryClient();
  const hasAutoSyncedThisSession = useRef(false);

  useEffect(() => {
    if (!isSignedIn) {
      hasAutoSyncedThisSession.current = false;
      return;
    }
  }, [isSignedIn]);

  useEffect(() => {
    const isInApp = location[0].startsWith("/app");
    const authReady = !authLoading && isSignedIn;
    if (!isInApp || !authReady || hasAutoSyncedThisSession.current) return;
    const client = getSupabase();
    if (!client) return;

    let cancelled = false;
    (async () => {
      try {
        await runSmartSync(client);
        if (cancelled) return;
        hasAutoSyncedThisSession.current = true;
        queryClient.invalidateQueries({ queryKey: ["goals"] });
        queryClient.invalidateQueries({ queryKey: ["settings"] });
      } catch {
        // silent: do not update ref so next entry can retry
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [location, isSignedIn, authLoading, queryClient]);
}
