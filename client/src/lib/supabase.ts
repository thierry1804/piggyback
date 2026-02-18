import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { localStorageService, type Goal, type Transaction } from "./localStorage";

let _client: SupabaseClient | null = null;

/** Client Supabase (création paresseuse). Retourne null si les variables d'env sont absentes. */
export function getSupabase(): SupabaseClient | null {
  if (_client !== null) return _client;
  const url = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  _client = createClient(url, key);
  return _client;
}

/** @deprecated Préférer getSupabase() pour éviter une erreur au chargement si l'env manque. */
export const supabase = new Proxy({} as SupabaseClient, {
  get(_, prop) {
    const c = getSupabase();
    if (!c) return undefined;
    return (c as Record<string | symbol, unknown>)[prop];
  },
});

export interface SyncFingerprint {
  goalsCount: number;
  latestCreatedAt: string | undefined;
}

/**
 * Empreinte cloud pour le groupe : nombre de goals et date du plus récent.
 */
export async function getCloudSyncFingerprint(
  groupId: string,
  client?: SupabaseClient | null
): Promise<SyncFingerprint> {
  const c = client ?? getSupabase();
  if (!c) throw new Error("Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY");
  const { data: rows, error } = await c
    .from("goals")
    .select("createdAt")
    .eq("group_id", groupId)
    .order("createdAt", { ascending: false });
  if (error) throw error;
  const goals = (rows ?? []) as { createdAt: string }[];
  const goalsCount = goals.length;
  const latestCreatedAt = goals.length > 0 ? goals[0].createdAt : undefined;
  return { goalsCount, latestCreatedAt };
}

/**
 * Empreinte locale (count + latestCreatedAt des goals).
 */
export function getLocalSyncFingerprint(): SyncFingerprint {
  return localStorageService.getLocalSyncFingerprint();
}

/**
 * S'assure que l'utilisateur connecté a au moins un groupe.
 * Si aucun groupe : appelle la RPC create_my_group et retourne le nouveau group_id.
 * Sinon retourne le premier group_id trouvé.
 */
export async function ensureUserHasGroup(
  client?: SupabaseClient | null
): Promise<string> {
  const c = client ?? getSupabase();
  if (!c) throw new Error("Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY");
  const { data: { user } } = await c.auth.getUser();
  if (!user) throw new Error("User not authenticated");

  const { data: memberships, error: fetchError } = await c
    .from("user_groups")
    .select("group_id")
    .eq("user_id", user.id)
    .limit(1);

  if (fetchError) throw fetchError;
  if (memberships && memberships.length > 0) {
    return memberships[0].group_id as string;
  }

  const { data: newGroupId, error: rpcError } = await c.rpc(
    "create_my_group",
    { group_name: null }
  );
  if (rpcError) throw rpcError;
  if (!newGroupId) throw new Error("create_my_group did not return a group id");
  return newGroupId as string;
}

export type SyncDirection = "upload" | "download" | "skip";

/**
 * Décide de la direction de sync (upload, download ou skip) selon métadonnées et empreintes.
 */
export async function getSyncDirection(
  client?: SupabaseClient | null
): Promise<SyncDirection> {
  const c = client ?? getSupabase();
  if (!c) throw new Error("Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY");
  const groupId = await ensureUserHasGroup(c);
  const meta = localStorageService.getSyncMetadata();
  const cloud = await getCloudSyncFingerprint(groupId, c);
  const local = getLocalSyncFingerprint();

  const { lastSyncAt, lastSyncLocalGoalsCount, lastSyncCloudGoalsCount } = meta;
  const localChanged = local.goalsCount !== lastSyncLocalGoalsCount;
  const cloudChanged = cloud.goalsCount !== lastSyncCloudGoalsCount;

  if (!lastSyncAt) {
    if (cloud.goalsCount === 0 && local.goalsCount > 0) return "upload";
    if (cloud.goalsCount > 0 && local.goalsCount === 0) return "download";
    if (local.goalsCount === 0 && cloud.goalsCount === 0) return "skip";
    // Les deux non vides (ex. 2e navigateur avec démo) : privilégier le download
    // pour ne pas écraser le cloud avec les données démo du nouvel appareil.
    return "download";
  }

  if (!localChanged && !cloudChanged) return "skip";
  if (localChanged && !cloudChanged) return "upload";
  if (!localChanged && cloudChanged) return "download";
  const localDate = local.latestCreatedAt ?? "";
  const cloudDate = cloud.latestCreatedAt ?? "";
  if (localDate > cloudDate) return "upload";
  return "download";
}

/**
 * Met à jour les métadonnées de sync après une sync réussie (utilisable après sync manuelle ou après mutation).
 */
export function updateSyncMetadataAfterSuccess(
  localGoalsCount: number,
  cloudGoalsCount: number
): void {
  localStorageService.setSyncMetadata({
    lastSyncAt: new Date().toISOString(),
    lastSyncLocalGoalsCount: localGoalsCount,
    lastSyncCloudGoalsCount: cloudGoalsCount,
  });
}

/**
 * Exécute la sync selon la direction (upload / download / skip). Met à jour les métadonnées après succès.
 */
export async function runSmartSync(
  client?: SupabaseClient | null
): Promise<{ direction: SyncDirection }> {
  const c = client ?? getSupabase();
  if (!c) throw new Error("Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY");
  const direction = await getSyncDirection(c);
  if (direction === "skip") return { direction: "skip" };

  try {
    if (direction === "upload") {
      await syncLocalToSupabase(c);
      const count = localStorageService.getGoals().length;
      updateSyncMetadataAfterSuccess(count, count);
    } else {
      await syncSupabaseToLocal(c);
      const count = localStorageService.getGoals().length;
      updateSyncMetadataAfterSuccess(count, count);
    }
    return { direction };
  } catch {
    throw new Error("Sync failed");
  }
}

/**
 * Si l'utilisateur est connecté, lance un upload en arrière-plan et met à jour les métadonnées après succès.
 * À appeler après une mutation locale (création/suppression goal, création transaction, update settings).
 */
export function syncLocalToSupabaseIfConnected(): void {
  const c = getSupabase();
  if (!c) return;
  (async () => {
    try {
      const {
        data: { user },
      } = await c.auth.getUser();
      if (!user) return;
      await syncLocalToSupabase(c);
      const count = localStorageService.getGoals().length;
      updateSyncMetadataAfterSuccess(count, count);
    } catch {
      // silent: fire-and-forget
    }
  })();
}

/**
 * Synchronise les données du localStorage vers Supabase (upload).
 * Remplace les goals/transactions du groupe par les données locales (évite les doublons).
 */
export async function syncLocalToSupabase(
  client?: SupabaseClient | null
): Promise<void> {
  const c = client ?? getSupabase();
  if (!c) throw new Error("Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY");
  const groupId = await ensureUserHasGroup(c);
  const goals = localStorageService.getGoals();
  const transactions = localStorageService.getTransactions();
  const settings = localStorageService.getSettings();

  // Remplacer l'existant : supprimer les goals du groupe (cascade supprime les transactions)
  const { error: deleteError } = await c
    .from("goals")
    .delete()
    .eq("group_id", groupId);
  if (deleteError) throw deleteError;

  const localToRemoteGoalId = new Map<number, number>();

  for (const g of goals) {
    const { data: inserted, error } = await c
      .from("goals")
      .insert({
        group_id: groupId,
        name: g.name,
        description: g.description,
        targetAmount: g.targetAmount,
        currentAmount: g.currentAmount,
        icon: g.icon,
        color: g.color,
        currencyCode: g.currencyCode,
        currencySymbol: g.currencySymbol,
        createdAt: g.createdAt,
        deadline: g.deadline ?? null,
      })
      .select("id")
      .single();
    if (error) throw error;
    if (inserted?.id != null) localToRemoteGoalId.set(g.id, inserted.id as number);
  }

  for (const t of transactions) {
    const remoteGoalId = localToRemoteGoalId.get(t.goalId);
    if (remoteGoalId == null) continue;
    const { error } = await c.from("transactions").insert({
      goalId: remoteGoalId,
      amount: t.amount,
      note: t.note,
      createdAt: t.createdAt,
    });
    if (error) throw error;
  }

  const { error: settingsError } = await c
    .from("settings")
    .update({
      currencyCode: settings.currencyCode,
      currencySymbol: settings.currencySymbol,
      updatedAt: new Date().toISOString(),
    })
    .eq("id", 1);
  if (settingsError) throw settingsError;
}

/**
 * Synchronise les données de Supabase vers le localStorage (download).
 * Prérequis : session valide. Récupère goals, transactions et settings du groupe puis écrase le local.
 */
export async function syncSupabaseToLocal(
  client?: SupabaseClient | null
): Promise<void> {
  const c = client ?? getSupabase();
  if (!c) throw new Error("Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY");
  const groupId = await ensureUserHasGroup(c);

  const { data: goalsRows, error: goalsError } = await c
    .from("goals")
    .select("*")
    .eq("group_id", groupId)
    .order("createdAt", { ascending: false });
  if (goalsError) throw goalsError;
  const goals: Goal[] = (goalsRows ?? []).map((row: Record<string, unknown>) => ({
    id: row.id as number,
    name: row.name as string,
    description: (row.description as string | null) ?? null,
    targetAmount: Number(row.targetAmount),
    currentAmount: Number(row.currentAmount),
    icon: (row.icon as string) ?? "🐷",
    color: (row.color as string) ?? "blue",
    currencyCode: (row.currencyCode as string) ?? "MGA",
    currencySymbol: (row.currencySymbol as string) ?? "Ar",
    createdAt: row.createdAt != null ? String(row.createdAt) : new Date().toISOString(),
    deadline: row.deadline != null ? String(row.deadline) : null,
  }));

  const goalIds = goals.map((g) => g.id);
  let transactions: Transaction[] = [];
  if (goalIds.length > 0) {
    const { data: txRows, error: txError } = await c
      .from("transactions")
      .select("*")
      .in("goalId", goalIds);
    if (txError) throw txError;
    transactions = (txRows ?? []).map((row: Record<string, unknown>) => ({
      id: row.id as number,
      goalId: row.goalId as number,
      amount: Number(row.amount),
      note: (row.note as string | null) ?? null,
      createdAt: row.createdAt != null ? String(row.createdAt) : new Date().toISOString(),
    }));
  }

  const { data: settingsRow, error: settingsError } = await c
    .from("settings")
    .select("currencyCode, currencySymbol")
    .eq("id", 1)
    .single();
  if (settingsError) throw settingsError;
  const current = localStorageService.getSettings();
  const currencyCode = (settingsRow?.currencyCode as string) ?? current.currencyCode;
  const currencySymbol = (settingsRow?.currencySymbol as string) ?? current.currencySymbol;
  const language = current.language ?? "en";

  // Écraser explicitement le local : vider puis écrire les données cloud (évite tout merge/append)
  localStorageService.setGoals([]);
  localStorageService.setTransactions([]);
  localStorageService.setGoals(goals);
  localStorageService.setTransactions(transactions);
  localStorageService.setSettings({ currencyCode, currencySymbol, language });
}
