import { useEffect, useState } from "react";
import { useRoute } from "wouter";
import { Loader2, AlertCircle, Calendar, TrendingUp, TrendingDown } from "lucide-react";
import { getGoalByShareToken } from "@/lib/supabase";
import type { Goal, Transaction } from "@/lib/localStorage";
import { format } from "date-fns";
import { ProgressBar } from "@/components/ProgressBar";
import { cn } from "@/lib/utils";

export default function ShareGoal() {
  const [, params] = useRoute("/share/:token");
  const token = params?.token ?? "";
  const [data, setData] = useState<{ goal: Goal; transactions: Transaction[] } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      setError("Missing token");
      setLoading(false);
      return;
    }
    getGoalByShareToken(token)
      .then((res) => {
        setData(res ?? null);
        if (!res) setError("Link not found or expired");
      })
      .catch(() => setError("Failed to load"))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-4">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }
  if (error || !data) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-4">
        <AlertCircle className="w-12 h-12 text-destructive" />
        <p className="text-destructive font-medium">{error ?? "Not found"}</p>
      </div>
    );
  }

  const { goal, transactions } = data;
  const currencySymbol = goal.currencySymbol ?? "Ar";
  const percentage = Math.min(100, (goal.currentAmount / goal.targetAmount) * 100);
  const sortedTx = [...transactions].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <div className="min-h-screen bg-background pb-12">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <p className="text-sm text-muted-foreground mb-6">Read-only shared view</p>
        <div className="bg-white rounded-2xl p-6 shadow-xl shadow-black/5 border border-border/50 mb-6">
          <div className="flex items-center gap-4 mb-6">
            <div
              className={cn(
                "w-16 h-16 rounded-xl flex items-center justify-center text-3xl",
                `bg-${goal.color || "blue"}-50`
              )}
            >
              {goal.icon}
            </div>
            <div>
              <h1 className="text-2xl font-bold font-display">{goal.name}</h1>
              <p className="text-muted-foreground">
                {currencySymbol}
                {(goal.currentAmount / 100).toLocaleString()} / {currencySymbol}
                {(goal.targetAmount / 100).toLocaleString()}
              </p>
            </div>
          </div>
          <ProgressBar
            current={goal.currentAmount}
            target={goal.targetAmount}
            color={goal.color || "blue"}
            size="lg"
            showText={false}
            currencySymbol={currencySymbol}
          />
          <p className="text-sm text-muted-foreground mt-2">{percentage.toFixed(1)}% completed</p>
          {goal.deadline && (
            <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              Deadline: {format(new Date(goal.deadline), "MMM d, yyyy")}
            </p>
          )}
        </div>
        <section>
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-muted-foreground" />
            History
          </h2>
          <div className="bg-white rounded-2xl border border-border/50 overflow-hidden">
            {sortedTx.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">No transactions yet.</div>
            ) : (
              <ul className="divide-y divide-border/50">
                {sortedTx.map((tx) => (
                  <li key={tx.id} className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "w-10 h-10 rounded-full flex items-center justify-center",
                          tx.amount > 0 ? "bg-emerald-100 text-emerald-600" : "bg-orange-100 text-orange-600"
                        )}
                      >
                        {tx.amount > 0 ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">
                          {tx.amount > 0 ? "Deposit" : "Withdrawal"}
                          {tx.note && <span className="text-muted-foreground font-normal"> · {tx.note}</span>}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(tx.createdAt), "MMM d, yyyy")}
                        </p>
                      </div>
                    </div>
                    <span
                      className={cn(
                        "font-mono font-bold",
                        tx.amount > 0 ? "text-emerald-600" : "text-foreground"
                      )}
                    >
                      {tx.amount > 0 ? "+" : ""}
                      {currencySymbol}
                      {(Math.abs(tx.amount) / 100).toLocaleString()}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
