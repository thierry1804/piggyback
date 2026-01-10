import { useState } from "react";
import { Link } from "wouter";
import { useGoals } from "@/hooks/use-goals";
import { GoalCard } from "@/components/GoalCard";
import { CreateGoalDialog } from "@/components/CreateGoalDialog";
import { TransactionDialog } from "@/components/TransactionDialog";
import { Loader2, TrendingUp, PiggyBank, Settings as SettingsIcon } from "lucide-react";
import { motion } from "framer-motion";
import type { Goal } from "@/lib/localStorage";
import { useSettings } from "@/hooks/use-settings";
import { useLanguage } from "@/hooks/use-language";

export default function Dashboard() {
  const { data: goals, isLoading, isError } = useGoals();
  const { data: settings } = useSettings();
  const { t } = useLanguage();
  const [quickAddGoal, setQuickAddGoal] = useState<Goal | null>(null);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
        <p className="text-destructive font-medium text-lg mb-4">{t.dashboard.somethingWrong}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="px-4 py-2 bg-primary text-white rounded-lg"
        >
          {t.dashboard.retry}
        </button>
      </div>
    );
  }

  const totalSaved = goals?.reduce((acc, goal) => acc + goal.currentAmount, 0) || 0;
  const totalTarget = goals?.reduce((acc, goal) => acc + goal.targetAmount, 0) || 0;
  const progressPercentage = totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0;
  const defaultCurrency = settings?.currencySymbol || "Ar";

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="pt-12 pb-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-foreground mb-2">Piggyback</h1>
            <p className="text-lg text-muted-foreground font-medium">{t.dashboard.tagline}</p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/app/settings"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-foreground/70 hover:text-foreground hover:bg-muted transition-colors"
            >
              <SettingsIcon className="w-5 h-5" />
              <span className="hidden sm:inline">{t.dashboard.settings}</span>
            </Link>
            <CreateGoalDialog />
          </div>
        </div>
      </header>

      <main className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8 sm:space-y-12">
        {/* Total Savings Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-primary/5 border border-primary/10 rounded-2xl sm:rounded-3xl p-6 sm:p-8 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-8 sm:p-12 opacity-5 pointer-events-none hidden sm:block">
            <PiggyBank size={200} />
          </div>
          
          <div className="relative z-10">
            <p className="text-xs sm:text-sm font-bold text-primary/80 tracking-wider uppercase mb-1 font-display">{t.dashboard.totalSavings}</p>
            <div className="flex items-baseline gap-2 mb-4">
              <span className="text-4xl sm:text-6xl font-bold text-foreground font-mono tracking-tight break-all">
                {defaultCurrency}{(totalSaved / 100).toLocaleString()}
              </span>
            </div>
            
            <div className="max-w-md space-y-2">
              <div className="flex justify-between text-xs sm:text-sm font-medium text-muted-foreground gap-2">
                <span>{t.dashboard.progress}</span>
                <span className="text-right">{progressPercentage.toFixed(1)}% {t.common.of} {defaultCurrency}{(totalTarget / 100).toLocaleString()}</span>
              </div>
              <div className="h-2.5 sm:h-3 w-full bg-background rounded-full overflow-hidden border border-primary/10">
                <div 
                  className="h-full bg-primary rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Goals Grid */}
        <section>
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="w-5 h-5 text-muted-foreground" />
            <h2 className="text-xl font-bold text-foreground">{t.dashboard.yourGoals}</h2>
          </div>

          {goals?.length === 0 ? (
            <div className="text-center py-20 bg-card border border-border/50 rounded-3xl border-dashed">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
                🌱
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">{t.dashboard.noGoalsTitle}</h3>
              <p className="text-muted-foreground max-w-xs mx-auto mb-6">{t.dashboard.noGoalsDescription}</p>
              <CreateGoalDialog />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {goals?.map((goal, index) => (
                <motion.div
                  key={goal.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <GoalCard 
                    goal={goal} 
                    onQuickAdd={setQuickAddGoal} 
                  />
                </motion.div>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Quick Add Transaction Modal */}
      <TransactionDialog
        isOpen={!!quickAddGoal}
        onClose={() => setQuickAddGoal(null)}
        goalId={quickAddGoal?.id || null}
        goalName={quickAddGoal?.name}
        type="deposit"
      />
    </div>
  );
}
