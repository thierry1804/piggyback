import { Link } from "wouter";
import { Plus } from "lucide-react";
import { ProgressBar } from "./ProgressBar";
import type { Goal } from "@shared/schema";
import { cn } from "@/lib/utils";

interface GoalCardProps {
  goal: Goal;
  onQuickAdd: (goal: Goal) => void;
}

// Map database colors to Tailwind classes
const colorStyles: Record<string, { bg: string, text: string, border: string }> = {
  blue: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-100" },
  green: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-100" },
  purple: { bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-100" },
  pink: { bg: "bg-pink-50", text: "text-pink-700", border: "border-pink-100" },
  orange: { bg: "bg-orange-50", text: "text-orange-700", border: "border-orange-100" },
  red: { bg: "bg-rose-50", text: "text-rose-700", border: "border-rose-100" },
};

export function GoalCard({ goal, onQuickAdd }: GoalCardProps) {
  const styles = colorStyles[goal.color || "blue"];
  
  return (
    <div 
      className={cn(
        "relative group flex flex-col p-6 rounded-3xl transition-all duration-300",
        "bg-white border hover:border-transparent hover:shadow-xl hover:shadow-black/5 hover:-translate-y-1",
        styles.border
      )}
    >
      <Link href={`/goal/${goal.id}`} className="absolute inset-0 z-0" aria-label={`View ${goal.name} details`} />
      
      <div className="relative z-10 flex justify-between items-start mb-4">
        <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center text-2xl", styles.bg)}>
          {goal.icon || "🐷"}
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onQuickAdd(goal);
          }}
          className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center transition-colors",
            "bg-white border border-border text-muted-foreground",
            "hover:bg-primary hover:text-white hover:border-primary shadow-sm"
          )}
          aria-label="Quick add transaction"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      <div className="relative z-10 mt-auto">
        <h3 className="text-xl font-bold text-foreground mb-1 font-display truncate">
          {goal.name}
        </h3>
        <p className="text-2xl font-bold text-foreground/80 font-mono tracking-tight mb-4">
          ${(goal.currentAmount / 100).toLocaleString()}
        </p>
        
        <ProgressBar 
          current={goal.currentAmount} 
          target={goal.targetAmount} 
          color={goal.color || "blue"} 
          showText 
        />
      </div>
    </div>
  );
}
