import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ProgressBarProps {
  current: number;
  target: number;
  color?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
  showText?: boolean;
  currencySymbol?: string;
}

const colorMap: Record<string, string> = {
  blue: "bg-blue-500",
  green: "bg-emerald-500",
  purple: "bg-purple-500",
  pink: "bg-pink-500",
  orange: "bg-orange-500",
  red: "bg-rose-500",
};

const bgMap: Record<string, string> = {
  blue: "bg-blue-100",
  green: "bg-emerald-100",
  purple: "bg-purple-100",
  pink: "bg-pink-100",
  orange: "bg-orange-100",
  red: "bg-rose-100",
};

export function ProgressBar({ 
  current, 
  target, 
  color = "blue", 
  size = "md", 
  className,
  showText = false,
  currencySymbol = "Ar"
}: ProgressBarProps) {
  const percentage = Math.min(100, Math.max(0, (current / target) * 100));
  
  const heightClass = {
    sm: "h-2",
    md: "h-3",
    lg: "h-6",
  }[size];

  const barColor = colorMap[color] || colorMap.blue;
  const bgColor = bgMap[color] || bgMap.blue;

  return (
    <div className={cn("w-full space-y-2", className)}>
      <div className={cn("w-full rounded-full overflow-hidden", bgColor, heightClass)}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          className={cn("h-full rounded-full", barColor)}
        />
      </div>
      {showText && (
        <div className="flex justify-between items-center text-xs font-medium text-muted-foreground">
          <span>{percentage.toFixed(0)}%</span>
          <span>{currencySymbol}{(target / 100).toLocaleString()} target</span>
        </div>
      )}
    </div>
  );
}
