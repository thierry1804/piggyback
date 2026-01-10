import { Link } from "wouter";
import { Plus, Calendar, Lightbulb } from "lucide-react";
import { ProgressBar } from "./ProgressBar";
import type { Goal } from "@/lib/localStorage";
import { cn, calculateSavingsAdvice } from "@/lib/utils";
import { useSettings } from "@/hooks/use-settings";
import { format, isPast, differenceInDays } from "date-fns";

interface GoalCardProps {
  goal: Goal;
  onQuickAdd: (goal: Goal) => void;
}

// Map database colors to Tailwind classes
const colorStyles: Record<string, { bg: string, text: string, border: string }> = {
  blue: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-100" },
  emerald: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-100" },
  green: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-100" },
  purple: { bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-100" },
  pink: { bg: "bg-pink-50", text: "text-pink-700", border: "border-pink-100" },
  orange: { bg: "bg-orange-50", text: "text-orange-700", border: "border-orange-100" },
  red: { bg: "bg-rose-50", text: "text-rose-700", border: "border-rose-100" },
};

export function GoalCard({ goal, onQuickAdd }: GoalCardProps) {
  const styles = colorStyles[goal.color || "blue"];
  const { data: settings } = useSettings();
  const currencySymbol = settings?.currencySymbol || "Ar";
  
  const deadlineDate = goal.deadline ? new Date(goal.deadline) : null;
  const isOverdue = deadlineDate ? isPast(deadlineDate) : false;
  const daysRemaining = deadlineDate ? differenceInDays(deadlineDate, new Date()) : null;
  const savingsAdvice = calculateSavingsAdvice(
    goal.currentAmount,
    goal.targetAmount,
    goal.deadline,
    currencySymbol
  );
  
  return (
    <div 
      className={cn(
        "relative group flex flex-col p-6 rounded-3xl transition-all duration-300",
        "bg-white border hover:border-transparent hover:shadow-xl hover:shadow-black/5 hover:-translate-y-1",
        styles.border
      )}
    >
      <Link href={`/app/goal/${goal.id}`} className="absolute inset-0 z-10" aria-label={`View ${goal.name} details`} />
      
      <div className="relative z-20 flex justify-between items-start mb-4 pointer-events-none">
        <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center text-2xl", styles.bg)}>
          {goal.icon || "🐷"}
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onQuickAdd(goal);
          }}
          className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center transition-colors pointer-events-auto",
            "bg-white border border-border text-muted-foreground",
            "hover:bg-primary hover:text-white hover:border-primary shadow-sm"
          )}
          aria-label="Quick add transaction"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      <div className="relative z-20 mt-auto pointer-events-none">
        <h3 className="text-xl font-bold text-foreground mb-1 font-display truncate">
          {goal.name}
        </h3>
        <p className="text-2xl font-bold text-foreground/80 font-mono tracking-tight mb-4">
          {currencySymbol}{(goal.currentAmount / 100).toLocaleString()}
        </p>
        
        <ProgressBar 
          current={goal.currentAmount} 
          target={goal.targetAmount} 
          color={goal.color || "blue"} 
          showText 
          currencySymbol={currencySymbol}
        />
        
        {deadlineDate && (
          <>
            <div className={cn(
              "mt-3 flex items-center gap-2 text-xs font-medium",
              isOverdue ? "text-destructive" : daysRemaining !== null && daysRemaining <= 7 ? "text-orange-600" : "text-muted-foreground"
            )}>
              <Calendar className="w-3.5 h-3.5" />
              <span>
                {isOverdue 
                  ? `Overdue by ${Math.abs(daysRemaining || 0)} days`
                  : daysRemaining === 0
                  ? "Due today"
                  : daysRemaining === 1
                  ? "Due tomorrow"
                  : `Due in ${daysRemaining} days`
                }
              </span>
              <span className="text-muted-foreground/60">
                ({format(deadlineDate, "MMM d, yyyy")})
              </span>
            </div>
            {savingsAdvice && !isOverdue && (
              <div className="mt-2 p-2.5 rounded-lg bg-primary/5 border border-primary/10">
                <div className="flex items-start gap-2">
                  <Lightbulb className="w-3.5 h-3.5 text-primary mt-0.5 flex-shrink-0" />
                  <p className="text-xs font-medium text-foreground leading-relaxed">
                    {savingsAdvice.advice}
                  </p>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
