import { useRef, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { getSupabase, runSmartSync } from "@/lib/supabase";
import { useSession } from "@/hooks/use-auth";
import { useSyncFromCloud } from "@/contexts/SyncContext";

/**
 * Lance une smart sync une seule fois par session connectée, au chargement (ou rechargement) de la page.
 * Si l'utilisateur est connecté, la sync s'exécute dès que l'auth est prête, quelle que soit la route.
 * Réinitialise le flag quand l'utilisateur se déconnecte.
 */
export function useAutoSync(): void {
  const { isSignedIn, isLoading: authLoading } = useSession();
  const queryClient = useQueryClient();
  const { setSyncingFromCloud } = useSyncFromCloud();
  const hasAutoSyncedThisSession = useRef(false);

  useEffect(() => {
    if (!isSignedIn) {
      hasAutoSyncedThisSession.current = false;
      return;
    }
  }, [isSignedIn]);

  useEffect(() => {
    const authReady = !authLoading && isSignedIn;
    if (!authReady || hasAutoSyncedThisSession.current) return;
    const client = getSupabase();
    if (!client) return;

    let cancelled = false;
    (async () => {
      try {
        setSyncingFromCloud(true);
        await runSmartSync(client);
        if (cancelled) return;
        hasAutoSyncedThisSession.current = true;
        queryClient.invalidateQueries({ queryKey: ["goals"] });
        queryClient.invalidateQueries({ queryKey: ["settings"] });
      } catch {
        // silent: do not update ref so next entry can retry
      } finally {
        if (!cancelled) setSyncingFromCloud(false);
      }
    })();
    return () => {
      cancelled = true;
      setSyncingFromCloud(false);
    };
  }, [isSignedIn, authLoading, queryClient, setSyncingFromCloud]);
}
