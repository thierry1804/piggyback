import { Link, useRoute, useLocation } from "wouter";
import { useGoal, useDeleteGoal } from "@/hooks/use-goals";
import { TransactionDialog } from "@/components/TransactionDialog";
import { ProgressBar } from "@/components/ProgressBar";
import { 
  ArrowLeft, 
  Trash2, 
  Loader2, 
  TrendingUp, 
  TrendingDown, 
  Calendar,
  AlertCircle,
  Lightbulb,
  FileDown
} from "lucide-react";
import { useState } from "react";
import { format, isPast, differenceInDays } from "date-fns";
import { calculateSavingsAdvice } from "@/lib/utils";
import { motion } from "framer-motion";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { useSettings } from "@/hooks/use-settings";
import { useLanguage } from "@/hooks/use-language";
import { useSyncFromCloud } from "@/contexts/SyncContext";
import { useGroupRole } from "@/hooks/use-group-role";
import { useSession } from "@/hooks/use-auth";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getGoalEvents, closeGoal } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { exportGoalToPdf, exportGoalToExcel } from "@/lib/exportGoal";
import { createGoalShareLink } from "@/lib/supabase";
import { getBasePath } from "@/lib/basePath";

export default function GoalDetails() {
  const [, params] = useRoute("/app/goal/:id");
  const id = parseInt(params?.id || "0");
  const [, setLocation] = useLocation();
  const { data: goal, isLoading, isError } = useGoal(id);
  const { mutate: deleteGoal } = useDeleteGoal();
  const { data: settings } = useSettings();
  const { isSyncingFromCloud } = useSyncFromCloud();
  const { canEdit, role } = useGroupRole();
  const { isSignedIn } = useSession();
  const { t } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { setSyncingFromCloud } = useSyncFromCloud();
  const currencySymbol = settings?.currencySymbol || "Ar";
  const [closePending, setClosePending] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [shareLink, setShareLink] = useState<string | null>(null);
  const [sharePending, setSharePending] = useState(false);
  const { data: events } = useQuery({
    queryKey: ["goalEvents", id],
    queryFn: () => getGoalEvents(id),
    enabled: isSignedIn && settings?.plan === "premium",
  });
  const eventLabel = (eventType: string) => {
    if (eventType === "goal_created") return t.goalDetails.eventGoalCreated;
    if (eventType === "goal_updated") return t.goalDetails.eventGoalUpdated;
    if (eventType === "transaction_added") return t.goalDetails.eventTransactionAdded;
    if (eventType === "goal_closed") return t.goalDetails.closeGoal;
    return eventType;
  };
  const handleCreateShareLink = () => {
    setSharePending(true);
    setShareLink(null);
    createGoalShareLink(id, 7)
      .then(({ token: t }) => {
        const base = typeof window !== "undefined" ? window.location.origin + getBasePath() : "";
        setShareLink(`${base}/share/${t}`);
      })
      .catch((err) => {
        toast({
          title: t.settings.error,
          description: err instanceof Error ? err.message : String(err),
          variant: "destructive",
        });
      })
      .finally(() => setSharePending(false));
  };
  const handleCopyShareLink = () => {
    if (shareLink) {
      navigator.clipboard.writeText(shareLink);
      toast({ title: t.goalDetails.shareLinkCopied });
    }
  };
  const handleCloseGoal = () => {
    setClosePending(true);
    closeGoal(id)
      .then(async () => {
        const { syncSupabaseToLocal } = await import("@/lib/supabase");
        setSyncingFromCloud(true);
        await syncSupabaseToLocal();
        setSyncingFromCloud(false);
        queryClient.invalidateQueries({ queryKey: ["goals"] });
        queryClient.invalidateQueries({ queryKey: ["goal", id] });
        toast({ title: t.goalDetails.closeGoal });
      })
      .catch((err) => {
        toast({
          title: t.settings.error,
          description: err instanceof Error ? err.message : String(err),
          variant: "destructive",
        });
      })
      .finally(() => setClosePending(false));
  };
  
  const [transactionModal, setTransactionModal] = useState<{
    open: boolean;
    type: "deposit" | "withdraw";
  }>({ open: false, type: "deposit" });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isError || !goal) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <AlertCircle className="w-12 h-12 text-destructive mb-4 opacity-20" />
        <h1 className="text-2xl font-bold mb-2">{t.goalDetails.goalNotFound}</h1>
        <Link href="/app" className="text-primary hover:underline font-medium">{t.goalDetails.returnHome}</Link>
      </div>
    );
  }

  const handleDelete = () => {
    deleteGoal(id, {
      onSuccess: () => {
        // Navigation côté client pour ne pas interrompre la sync cloud (window.location aurait rechargé la page)
        setLocation("/app");
      }
    });
  };

  const percentage = Math.min(100, (goal.currentAmount / goal.targetAmount) * 100);
  const deadlineDate = goal.deadline ? new Date(goal.deadline) : null;
  const isOverdue = deadlineDate ? isPast(deadlineDate) : false;
  const daysRemaining = deadlineDate ? differenceInDays(deadlineDate, new Date()) : null;
  const savingsAdvice = calculateSavingsAdvice(
    goal.currentAmount,
    goal.targetAmount,
    goal.deadline,
    currencySymbol
  );
  
  // Sort transactions by date desc
  const transactions = [...(goal.transactions || [])].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {isSyncingFromCloud && (
          <div className="mb-6 flex items-center gap-3 px-4 py-3 rounded-xl bg-primary/10 border border-primary/20 text-primary">
            <Loader2 className="w-5 h-5 animate-spin shrink-0" />
            <p className="text-sm font-medium">{t.settings.loadingFromCloud}</p>
          </div>
        )}
        {goal.closedAt && (
          <div className="mb-6 flex items-center gap-3 px-4 py-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p className="text-sm font-medium">
              {t.goalDetails.goalClosedAt} {format(new Date(goal.closedAt), "MMM d, yyyy")}
            </p>
          </div>
        )}
        {/* Nav */}
        <div className="flex items-center justify-between mb-8">
          <Link href="/app" className="
            inline-flex items-center gap-2 text-muted-foreground font-medium
            hover:text-foreground transition-colors px-3 py-2 rounded-lg hover:bg-muted/50
          ">
            <ArrowLeft className="w-5 h-5" />
            {t.goalDetails.backToDashboard}
          </Link>

          {canEdit && !goal.closedAt && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors">
                <Trash2 className="w-5 h-5" />
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent className="rounded-2xl">
              <AlertDialogHeader>
                <AlertDialogTitle>{t.goalDetails.deleteGoal}</AlertDialogTitle>
                <AlertDialogDescription>
                  {t.goalDetails.deleteWarning} "{goal.name}" {t.goalDetails.deleteWarning2}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="rounded-xl">{t.goalDetails.cancel}</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90 rounded-xl">
                  {t.goalDetails.deleteButton}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          )}
        </div>

        {/* Hero Card */}
        <div className="bg-white rounded-2xl sm:rounded-[2rem] p-5 sm:p-10 shadow-xl shadow-black/5 border border-border/50 mb-6 sm:mb-10 overflow-hidden relative">
          <div className="flex flex-col md:flex-row gap-6 sm:gap-8 items-start md:items-center relative z-10">
            <div className={cn(
              "w-20 h-20 sm:w-24 sm:h-24 rounded-2xl sm:rounded-3xl flex items-center justify-center text-4xl sm:text-5xl shadow-inner",
              `bg-${goal.color || "blue"}-50`
            )}>
              {goal.icon}
            </div>
            
            <div className="flex-1 w-full">
              <h1 className="text-2xl sm:text-4xl font-bold font-display mb-2">{goal.name}</h1>
              <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-2 mb-6">
                <span className="text-4xl sm:text-5xl font-bold font-mono tracking-tight text-foreground break-all">
                  {currencySymbol}{(goal.currentAmount / 100).toLocaleString()}
                </span>
                <span className="text-lg sm:text-xl text-muted-foreground font-medium">
                  {t.common.of} {currencySymbol}{(goal.targetAmount / 100).toLocaleString()}
                </span>
              </div>
              
              <ProgressBar 
                current={goal.currentAmount} 
                target={goal.targetAmount} 
                color={goal.color || "blue"} 
                size="lg"
                showText={false}
                currencySymbol={currencySymbol}
              />
              <div className="mt-2 flex items-center justify-between">
                <div className={cn(
                  "flex items-center gap-2 text-xs sm:text-sm font-medium",
                  isOverdue ? "text-destructive" : daysRemaining !== null && daysRemaining <= 7 ? "text-orange-600" : "text-muted-foreground"
                )}>
                  {deadlineDate && (
                    <>
                      <Calendar className="w-4 h-4" />
                      <span>
                        {isOverdue 
                          ? `${t.goalCard.overdueBy} ${Math.abs(daysRemaining || 0)} ${t.goalCard.days}`
                          : daysRemaining === 0
                          ? t.goalCard.dueToday
                          : daysRemaining === 1
                          ? t.goalCard.dueTomorrow
                          : daysRemaining !== null
                          ? `${t.goalCard.dueIn} ${daysRemaining} ${t.goalCard.days}`
                          : ""
                        }
                      </span>
                      <span className="text-muted-foreground/60">
                        ({format(deadlineDate, "MMM d, yyyy")})
                      </span>
                    </>
                  )}
                </div>
                <div className="text-right font-medium text-xs sm:text-sm text-muted-foreground">
                  {percentage.toFixed(1)}% {t.goalDetails.completed}
                </div>
              </div>
              
              {savingsAdvice && !isOverdue && (
                <div className="mt-4 p-4 rounded-xl bg-primary/5 border border-primary/10">
                  <div className="flex items-start gap-3">
                    <Lightbulb className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-foreground mb-1">{t.goalDetails.savingsTip}</p>
                      <p className="text-sm text-foreground/80 leading-relaxed">
                        {savingsAdvice.advice}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          {canEdit && !goal.closedAt && (
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-8 sm:mt-10">
            <button
              onClick={() => setTransactionModal({ open: true, type: "deposit" })}
              className="flex-1 py-3.5 sm:py-4 px-6 rounded-xl sm:rounded-2xl bg-primary text-white font-bold text-base sm:text-lg shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
            >
              {t.goalDetails.addSavings}
            </button>
            <button
              onClick={() => setTransactionModal({ open: true, type: "withdraw" })}
              className="flex-1 py-3.5 sm:py-4 px-6 rounded-xl sm:rounded-2xl bg-white border-2 border-border text-foreground font-bold text-base sm:text-lg hover:bg-muted/30 hover:border-muted-foreground/20 transition-all duration-200"
            >
              {t.goalDetails.withdraw}
            </button>
          </div>
          )}
          {settings?.plan === "premium" && canEdit && !goal.closedAt && isSignedIn && (
            <div className="mt-6">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <button
                    type="button"
                    disabled={closePending}
                    className="text-sm text-muted-foreground hover:text-foreground underline disabled:opacity-50"
                  >
                    {closePending ? (
                      <Loader2 className="w-4 h-4 animate-spin inline mr-1" />
                    ) : null}
                    {t.goalDetails.closeGoal}
                  </button>
                </AlertDialogTrigger>
                <AlertDialogContent className="rounded-2xl">
                  <AlertDialogHeader>
                    <AlertDialogTitle>{t.goalDetails.closeGoal}</AlertDialogTitle>
                    <AlertDialogDescription>{t.goalDetails.closeGoalConfirm}</AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="rounded-xl">{t.goalDetails.cancel}</AlertDialogCancel>
                    <AlertDialogAction onClick={handleCloseGoal} className="rounded-xl">
                      {t.goalDetails.closeGoal}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )}
        </div>

        {settings?.plan === "premium" && (
          <div className="flex flex-wrap gap-2 mb-6">
            <button
              type="button"
              onClick={() => exportGoalToPdf(goal, currencySymbol)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-border bg-white text-sm font-medium hover:bg-muted/50"
            >
              <FileDown className="w-4 h-4" />
              {t.goalDetails.exportPdf}
            </button>
            <button
              type="button"
              onClick={() => exportGoalToExcel(goal, currencySymbol)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-border bg-white text-sm font-medium hover:bg-muted/50"
            >
              <FileDown className="w-4 h-4" />
              {t.goalDetails.exportExcel}
            </button>
            {role === "admin" && !goal.closedAt && (
              <button
                type="button"
                onClick={() => { setShareModalOpen(true); setShareLink(null); }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-border bg-white text-sm font-medium hover:bg-muted/50"
              >
                {t.goalDetails.shareGoal}
              </button>
            )}
          </div>
        )}

        {/* Transaction History */}
        <section>
          <h2 className="text-xl font-bold mb-6 font-display flex items-center gap-2">
            <Calendar className="w-5 h-5 text-muted-foreground" />
            {t.goalDetails.history}
          </h2>

          <div className="bg-white rounded-3xl border border-border/50 shadow-sm overflow-hidden">
            {transactions.length === 0 ? (
              <div className="p-12 text-center text-muted-foreground">
                {t.goalDetails.noTransactions}
              </div>
            ) : (
              <ul className="divide-y divide-border/50">
                {transactions.map((tx, i) => (
                  <motion.li 
                    key={tx.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="p-5 flex items-center justify-between hover:bg-muted/20 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center",
                        tx.amount > 0 ? "bg-emerald-100 text-emerald-600" : "bg-orange-100 text-orange-600"
                      )}>
                        {tx.amount > 0 ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">
                          {tx.amount > 0 ? t.goalDetails.deposit : t.goalDetails.withdrawal}
                          {tx.note && <span className="text-muted-foreground font-normal"> • {tx.note}</span>}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(tx.createdAt), "MMM d, yyyy 'at' h:mm a")}
                        </p>
                      </div>
                    </div>
                    <div className={cn(
                      "font-mono font-bold text-lg",
                      tx.amount > 0 ? "text-emerald-600" : "text-foreground"
                    )}>
                      {tx.amount > 0 ? "+" : ""}{currencySymbol}{(Math.abs(tx.amount) / 100).toLocaleString()}
                    </div>
                  </motion.li>
                ))}
              </ul>
            )}
          </div>
        </section>

        {settings?.plan === "premium" && isSignedIn && events && events.length > 0 && (
          <section className="mt-10">
            <h2 className="text-xl font-bold mb-4 font-display flex items-center gap-2">
              {t.goalDetails.journal}
            </h2>
            <div className="bg-white rounded-3xl border border-border/50 shadow-sm overflow-hidden">
              <ul className="divide-y divide-border/50">
                {events.map((ev) => (
                  <li key={ev.id} className="p-4 flex items-center justify-between text-sm">
                    <span className="font-medium text-foreground">{eventLabel(ev.event_type)}</span>
                    <span className="text-muted-foreground">
                      {format(new Date(ev.created_at), "MMM d, yyyy HH:mm")}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}
      </div>

      <TransactionDialog
        isOpen={transactionModal.open}
        onClose={() => setTransactionModal(prev => ({ ...prev, open: false }))}
        goalId={id}
        goalName={goal.name}
        type={transactionModal.type}
      />

      <AlertDialog open={shareModalOpen} onOpenChange={setShareModalOpen}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>{t.goalDetails.shareGoal}</AlertDialogTitle>
            <AlertDialogDescription>
              Create a read-only link valid for 7 days. Anyone with the link can view this goal.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-3 py-2">
            {shareLink && (
              <div className="p-3 rounded-lg bg-muted text-sm break-all">{shareLink}</div>
            )}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleCreateShareLink}
                disabled={sharePending}
                className="px-4 py-2 rounded-xl bg-primary text-white text-sm font-medium disabled:opacity-50"
              >
                {sharePending ? <Loader2 className="w-4 h-4 animate-spin inline" /> : null}
                {t.goalDetails.shareGoalCreate}
              </button>
              {shareLink && (
                <button
                  type="button"
                  onClick={handleCopyShareLink}
                  className="px-4 py-2 rounded-xl border border-border text-sm font-medium"
                >
                  Copy
                </button>
              )}
            </div>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
