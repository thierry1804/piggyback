import { useState, useEffect } from "react";
import { Link } from "wouter";
import { ArrowLeft, Save, Globe, Cloud, CloudDownload, Loader2, LogOut, Crown } from "lucide-react";
import { useSettings, useUpdateSettings } from "@/hooks/use-settings";
import { useLanguage } from "@/hooks/use-language";
import { useToast } from "@/hooks/use-toast";
import { useSession, useSignOut } from "@/hooks/use-auth";
import { AuthDialog } from "@/components/AuthDialog";
import { syncLocalToSupabase, syncSupabaseToLocal, updateSyncMetadataAfterSuccess, runSmartSync, resetSyncMetadataAfterLogin, upgradeGroupToPremium } from "@/lib/supabase";
import { useSyncFromCloud } from "@/contexts/SyncContext";
import { localStorageService } from "@/lib/localStorage";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { languages, type Language } from "@/lib/i18n";
import { useGroupRole } from "@/hooks/use-group-role";
import { getMyGroupId, getGroupMembers, inviteToGroup } from "@/lib/supabase";
import { getBasePath } from "@/lib/basePath";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export default function Settings() {
  const { data: settings, isLoading } = useSettings();
  const { mutate: updateSettings, isPending } = useUpdateSettings();
  const { t } = useLanguage();
  const { toast } = useToast();
  const { user, isSignedIn, isLoading: authLoading } = useSession();
  const { signOut } = useSignOut();
  const { isSyncingFromCloud, setSyncingFromCloud } = useSyncFromCloud();
  const queryClient = useQueryClient();
  const { role } = useGroupRole();
  const { data: groupId } = useQuery({
    queryKey: ["myGroupId"],
    queryFn: () => getMyGroupId(),
    enabled: isSignedIn && settings?.plan === "premium",
  });
  const { data: members } = useQuery({
    queryKey: ["groupMembers", groupId],
    queryFn: () => getGroupMembers(groupId!),
    enabled: !!groupId,
  });
  const roleLabel =
    role === "admin"
      ? t.settings.roleAdmin
      : role === "contributor"
        ? t.settings.roleContributor
        : role === "observer"
          ? t.settings.roleObserver
          : null;
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [upgradePending, setUpgradePending] = useState(false);
  const [upgradeError, setUpgradeError] = useState<string | null>(null);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [invitePending, setInvitePending] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"admin" | "contributor" | "observer">("contributor");
  const [generatedInviteLink, setGeneratedInviteLink] = useState<string | null>(null);
  const [syncPending, setSyncPending] = useState(false);
  const [downloadPending, setDownloadPending] = useState(false);

  const [currencyCode, setCurrencyCode] = useState(settings?.currencyCode || "MGA");
  const [currencySymbol, setCurrencySymbol] = useState(settings?.currencySymbol || "Ar");
  const [language, setLanguage] = useState<Language>(settings?.language || "en");

  const handleSync = async () => {
    setSyncPending(true);
    try {
      await syncLocalToSupabase();
      const count = localStorageService.getGoals().length;
      updateSyncMetadataAfterSuccess(count, count);
      toast({
        title: t.settings.syncSuccess,
      });
    } catch (err) {
      toast({
        title: t.settings.syncError,
        description: err instanceof Error ? err.message : String(err),
        variant: "destructive",
      });
    } finally {
      setSyncPending(false);
    }
  };

  const handleDownload = async () => {
    setDownloadPending(true);
    setSyncingFromCloud(true);
    try {
      await syncSupabaseToLocal();
      const count = localStorageService.getGoals().length;
      updateSyncMetadataAfterSuccess(count, count);
      queryClient.invalidateQueries({ queryKey: ["goals"] });
      queryClient.invalidateQueries({ queryKey: ["settings"] });
      toast({
        title: t.settings.syncDownloadSuccess,
      });
    } catch (err) {
      toast({
        title: t.settings.syncError,
        description: err instanceof Error ? err.message : String(err),
        variant: "destructive",
      });
    } finally {
      setDownloadPending(false);
      setSyncingFromCloud(false);
    }
  };

  // Mettre à jour les états quand les settings changent
  useEffect(() => {
    if (settings) {
      setCurrencyCode(settings.currencyCode);
      setCurrencySymbol(settings.currencySymbol);
      setLanguage(settings.language || "en");
    }
  }, [settings]);

  // Ouvrir la modal upgrade si l'utilisateur arrive depuis la landing avec ?upgrade=1
  useEffect(() => {
    const params = new URLSearchParams(typeof window !== "undefined" ? window.location.search : "");
    if (params.get("upgrade") === "1") {
      setUpgradeModalOpen(true);
      if (typeof window !== "undefined" && window.history.replaceState) {
        const url = new URL(window.location.href);
        url.searchParams.delete("upgrade");
        window.history.replaceState({}, "", url.pathname + url.search || url.pathname);
      }
    }
  }, []);

  const handleInviteGenerate = async () => {
    if (!groupId) return;
    setInvitePending(true);
    setGeneratedInviteLink(null);
    try {
      const { token } = await inviteToGroup(groupId, inviteEmail, inviteRole, 7);
      const base = typeof window !== "undefined" ? window.location.origin + getBasePath() : "";
      setGeneratedInviteLink(`${base}/app/join?token=${encodeURIComponent(token)}`);
      queryClient.invalidateQueries({ queryKey: ["groupMembers", groupId] });
    } catch (err) {
      toast({
        title: t.settings.error,
        description: err instanceof Error ? err.message : String(err),
        variant: "destructive",
      });
    } finally {
      setInvitePending(false);
    }
  };

  const handleUpgradeSimulate = async () => {
    setUpgradePending(true);
    setUpgradeError(null);
    try {
      await upgradeGroupToPremium();
      setSyncingFromCloud(true);
      await syncSupabaseToLocal();
      const count = localStorageService.getGoals().length;
      updateSyncMetadataAfterSuccess(count, count);
      queryClient.invalidateQueries({ queryKey: ["goals"] });
      queryClient.invalidateQueries({ queryKey: ["settings"] });
      toast({ title: t.settings.upgradeSuccess });
      setUpgradeModalOpen(false);
    } catch (err) {
      const e = err as Error & { code?: string; details?: string; hint?: string };
      const detail = [e.message, e.code, e.details, e.hint].filter(Boolean).join(" · ");
      setUpgradeError(detail);
      toast({
        title: t.settings.error,
        description: detail,
        variant: "destructive",
      });
    } finally {
      setUpgradePending(false);
      setSyncingFromCloud(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(
      { currencyCode, currencySymbol, language },
      {
        onSuccess: () => {
          toast({
            title: t.settings.savedTitle,
            description: t.settings.savedDescription,
          });
        },
        onError: (err) => {
          toast({
            title: t.settings.error,
            description: err.message,
            variant: "destructive",
          });
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="pt-12 pb-8 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <Link href="/app" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6">
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">{t.settings.backToDashboard}</span>
        </Link>
        <div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-foreground mb-2">{t.settings.title}</h1>
          <p className="text-lg text-muted-foreground font-medium">{t.settings.subtitle}</p>
        </div>
      </header>

      <main className="px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        {isSyncingFromCloud && (
          <div className="mb-6 flex items-center gap-3 px-4 py-3 rounded-xl bg-primary/10 border border-primary/20 text-primary">
            <Loader2 className="w-5 h-5 animate-spin shrink-0" />
            <p className="text-sm font-medium">{t.settings.loadingFromCloud}</p>
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Language Settings */}
          <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-xl shadow-black/5 border border-border/50">
            <div className="flex items-center gap-3 mb-2">
              <Globe className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-bold text-foreground font-display">{t.settings.language}</h2>
            </div>
            <p className="text-muted-foreground mb-6">
              {t.settings.languageDescription}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => setLanguage(lang.code)}
                  className={`
                    flex items-center gap-3 p-4 rounded-xl border-2 transition-all
                    ${language === lang.code 
                      ? 'border-primary bg-primary/5 ring-4 ring-primary/10' 
                      : 'border-border hover:border-primary/50 hover:bg-muted/30'
                    }
                  `}
                >
                  <span className="text-2xl">{lang.flag}</span>
                  <span className="font-semibold text-foreground">{lang.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Currency Settings */}
          <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-xl shadow-black/5 border border-border/50">
            <h2 className="text-2xl font-bold text-foreground mb-2 font-display">{t.settings.currency}</h2>
            <p className="text-muted-foreground mb-6">
              {t.settings.currencyDescription}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground/80 font-display">
                  {t.settings.currencyCode}
                </label>
                <input
                  type="text"
                  value={currencyCode}
                  onChange={(e) => setCurrencyCode(e.target.value.toUpperCase())}
                  placeholder="MGA"
                  className="w-full px-4 py-3 rounded-xl bg-background border-2 border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
                  required
                />
                <p className="text-xs text-muted-foreground">e.g., MGA, USD, EUR</p>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground/80 font-display">
                  {t.settings.currencySymbol}
                </label>
                <input
                  type="text"
                  value={currencySymbol}
                  onChange={(e) => setCurrencySymbol(e.target.value)}
                  placeholder="Ar"
                  className="w-full px-4 py-3 rounded-xl bg-background border-2 border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
                  required
                />
                <p className="text-xs text-muted-foreground">e.g., Ar, $, €</p>
              </div>
            </div>
          </div>

          {/* Plan actuel / Upgrade Premium */}
          <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-xl shadow-black/5 border border-border/50">
            <div className="flex items-center gap-3 mb-2">
              <Crown className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-bold text-foreground font-display">{t.settings.currentPlan}</h2>
            </div>
            <p className="text-muted-foreground mb-4">
              {settings?.plan === "premium"
                ? t.landing.planPremium
                : t.landing.planFree}
            </p>
            {settings?.plan !== "premium" && isSignedIn && (
              <Button
                type="button"
                variant="default"
                onClick={() => setUpgradeModalOpen(true)}
                className="rounded-xl"
              >
                {t.settings.upgradeToPremium}
              </Button>
            )}
            {settings?.plan === "premium" && isSignedIn && roleLabel && (
              <div className="mt-4 pt-4 border-t border-border/50">
                <p className="text-sm font-medium text-foreground mb-1">{t.settings.yourRole}</p>
                <p className="text-muted-foreground text-sm">{roleLabel}</p>
                {members && members.length > 0 && (
                  <>
                    <p className="text-sm font-medium text-foreground mt-3 mb-1">{t.settings.members}</p>
                    <ul className="text-muted-foreground text-sm list-disc list-inside">
                      {members.map((m, i) => (
                        <li key={m.user_id + i}>
                          {m.role === "admin"
                            ? t.settings.roleAdmin
                            : m.role === "contributor"
                              ? t.settings.roleContributor
                              : t.settings.roleObserver}
                        </li>
                      ))}
                    </ul>
                  </>
                )}
                {role === "admin" && (
                  <div className="mt-4">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="rounded-xl"
                      onClick={() => {
                        setInviteModalOpen(true);
                        setGeneratedInviteLink(null);
                      }}
                    >
                      {t.settings.inviteMember}
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Invite dialog (Premium admin) */}
          <Dialog open={inviteModalOpen} onOpenChange={setInviteModalOpen}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>{t.settings.inviteMember}</DialogTitle>
                <DialogDescription>
                  Generate a link to add a member to your group. Share the link securely.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div>
                  <label className="text-sm font-medium mb-1 block">Email (optional)</label>
                  <input
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background"
                    placeholder="member@example.com"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Role</label>
                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value as "admin" | "contributor" | "observer")}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background"
                  >
                    <option value="admin">{t.settings.roleAdmin}</option>
                    <option value="contributor">{t.settings.roleContributor}</option>
                    <option value="observer">{t.settings.roleObserver}</option>
                  </select>
                </div>
                {generatedInviteLink && (
                  <div className="p-3 rounded-lg bg-muted text-sm break-all">
                    {generatedInviteLink}
                  </div>
                )}
                <div className="flex gap-2">
                  <Button onClick={handleInviteGenerate} disabled={invitePending} className="rounded-xl">
                    {invitePending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Generate link"}
                  </Button>
                  <Button variant="outline" onClick={() => setInviteModalOpen(false)} className="rounded-xl">
                    {t.settings.cancelButton}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Synchronisation */}
          <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-xl shadow-black/5 border border-border/50">
            <div className="flex items-center gap-3 mb-2">
              <Cloud className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-bold text-foreground font-display">{t.settings.syncTitle}</h2>
            </div>
            <p className="text-muted-foreground mb-6">
              {t.settings.syncDescription}
            </p>
            {!authLoading && (
              <>
                {!isSignedIn ? (
                  <div className="space-y-4">
                    <p className="text-foreground/90">{t.settings.syncInvite}</p>
                    <button
                      type="button"
                      onClick={() => setAuthDialogOpen(true)}
                      className="px-6 py-3 rounded-xl font-semibold text-white bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25 transition-all"
                    >
                      {t.auth.signIn} / {t.auth.signUp}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      {t.settings.connectedAs} <span className="font-medium text-foreground">{user?.email ?? ""}</span>
                    </p>
                    <div className="flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={handleSync}
                        disabled={syncPending || downloadPending}
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white bg-primary hover:bg-primary/90 disabled:opacity-50 transition-all"
                      >
                        {syncPending ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            {t.settings.syncing}
                          </>
                        ) : (
                          <>
                            <Cloud className="w-4 h-4" />
                            {t.settings.syncButton}
                          </>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={handleDownload}
                        disabled={syncPending || downloadPending}
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-primary border-2 border-primary bg-primary/5 hover:bg-primary/10 disabled:opacity-50 transition-all"
                      >
                        {downloadPending ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            {t.settings.syncDownloading}
                          </>
                        ) : (
                          <>
                            <CloudDownload className="w-4 h-4" />
                            {t.settings.syncDownload}
                          </>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={async () => {
                          await signOut();
                          resetSyncMetadataAfterLogin();
                        }}
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-foreground/70 hover:bg-muted transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        {t.settings.signOut}
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-3">
            <Link
              href="/app"
              className="px-6 py-3 rounded-xl font-semibold text-foreground/70 hover:bg-muted transition-colors"
            >
              {t.settings.cancelButton}
            </Link>
            <button
              type="submit"
              disabled={isPending}
              className="px-6 py-3 rounded-xl font-semibold text-white bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25 hover:shadow-primary/40 transform active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none flex items-center gap-2"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {t.settings.saving}
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  {t.settings.saveButton}
                </>
              )}
            </button>
          </div>
        </form>

        <Dialog open={upgradeModalOpen} onOpenChange={(open) => { setUpgradeModalOpen(open); if (!open) setUpgradeError(null); }}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{t.settings.upgradeModalTitle}</DialogTitle>
              <DialogDescription>{t.settings.upgradeModalDescription}</DialogDescription>
            </DialogHeader>
            {upgradeError && (
              <pre data-upgrade-error className="text-left text-sm text-destructive bg-muted p-3 rounded overflow-auto max-h-32">
                {upgradeError}
              </pre>
            )}
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => { setUpgradeModalOpen(false); setUpgradeError(null); }}>
                {t.settings.cancelButton}
              </Button>
              <Button onClick={handleUpgradeSimulate} disabled={upgradePending}>
                {upgradePending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ...
                  </>
                ) : (
                  t.settings.upgradeModalSimulate
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <AuthDialog
          open={authDialogOpen}
          onOpenChange={setAuthDialogOpen}
          onSuccess={async () => {
            try {
              resetSyncMetadataAfterLogin();
              setSyncingFromCloud(true);
              await runSmartSync();
              queryClient.invalidateQueries({ queryKey: ["goals"] });
              queryClient.invalidateQueries({ queryKey: ["settings"] });
            } catch {
              // silent; useAutoSync may retry
            } finally {
              setSyncingFromCloud(false);
            }
          }}
        />
      </main>
    </div>
  );
}
