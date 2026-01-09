import { Link, useRoute } from "wouter";
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
  Lightbulb
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

export default function GoalDetails() {
  const [, params] = useRoute("/goal/:id");
  const id = parseInt(params?.id || "0");
  const { data: goal, isLoading, isError } = useGoal(id);
  const { mutate: deleteGoal } = useDeleteGoal();
  const { data: settings } = useSettings();
  const currencySymbol = settings?.currencySymbol || "Ar";
  
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
        <h1 className="text-2xl font-bold mb-2">Goal not found</h1>
        <Link href="/" className="text-primary hover:underline font-medium">Return home</Link>
      </div>
    );
  }

  const handleDelete = () => {
    deleteGoal(id, {
      onSuccess: () => {
        // useDeleteGoal handles cache invalidation
        window.location.href = "/";
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
        {/* Nav */}
        <div className="flex items-center justify-between mb-8">
          <Link href="/" className="
            inline-flex items-center gap-2 text-muted-foreground font-medium
            hover:text-foreground transition-colors px-3 py-2 rounded-lg hover:bg-muted/50
          ">
            <ArrowLeft className="w-5 h-5" />
            Back to Dashboard
          </Link>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors">
                <Trash2 className="w-5 h-5" />
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent className="rounded-2xl">
              <AlertDialogHeader>
                <AlertDialogTitle>Delete this goal?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete "{goal.name}" and all its transaction history. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90 rounded-xl">
                  Delete Goal
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
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
                  of {currencySymbol}{(goal.targetAmount / 100).toLocaleString()}
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
                          ? `Overdue by ${Math.abs(daysRemaining || 0)} days`
                          : daysRemaining === 0
                          ? "Due today"
                          : daysRemaining === 1
                          ? "Due tomorrow"
                          : daysRemaining !== null
                          ? `Due in ${daysRemaining} days`
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
                  {percentage.toFixed(1)}% Completed
                </div>
              </div>
              
              {savingsAdvice && !isOverdue && (
                <div className="mt-4 p-4 rounded-xl bg-primary/5 border border-primary/10">
                  <div className="flex items-start gap-3">
                    <Lightbulb className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-foreground mb-1">💡 Conseil d'épargne</p>
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
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-8 sm:mt-10">
            <button
              onClick={() => setTransactionModal({ open: true, type: "deposit" })}
              className="flex-1 py-3.5 sm:py-4 px-6 rounded-xl sm:rounded-2xl bg-primary text-white font-bold text-base sm:text-lg shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
            >
              Add Savings
            </button>
            <button
              onClick={() => setTransactionModal({ open: true, type: "withdraw" })}
              className="flex-1 py-3.5 sm:py-4 px-6 rounded-xl sm:rounded-2xl bg-white border-2 border-border text-foreground font-bold text-base sm:text-lg hover:bg-muted/30 hover:border-muted-foreground/20 transition-all duration-200"
            >
              Withdraw
            </button>
          </div>
        </div>

        {/* Transaction History */}
        <section>
          <h2 className="text-xl font-bold mb-6 font-display flex items-center gap-2">
            <Calendar className="w-5 h-5 text-muted-foreground" />
            History
          </h2>

          <div className="bg-white rounded-3xl border border-border/50 shadow-sm overflow-hidden">
            {transactions.length === 0 ? (
              <div className="p-12 text-center text-muted-foreground">
                No transactions yet. Start saving today!
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
                          {tx.amount > 0 ? "Deposit" : "Withdrawal"}
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
      </div>

      <TransactionDialog
        isOpen={transactionModal.open}
        onClose={() => setTransactionModal(prev => ({ ...prev, open: false }))}
        goalId={id}
        goalName={goal.name}
        type={transactionModal.type}
      />
    </div>
  );
}
