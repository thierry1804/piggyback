import { useState } from "react";
import { useCreateGoal } from "@/hooks/use-goals";
import { CurrencyInput } from "./CurrencyInput";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

const ICONS = ["🐷", "🏠", "🚗", "✈️", "💍", "💻", "🎓", "🏥", "🎁", "☂️", "🎸", "🚲"];
const COLORS = [
  { id: "blue", class: "bg-blue-500" },
  { id: "green", class: "bg-emerald-500" },
  { id: "purple", class: "bg-purple-500" },
  { id: "pink", class: "bg-pink-500" },
  { id: "orange", class: "bg-orange-500" },
  { id: "red", class: "bg-rose-500" },
];

export function CreateGoalDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [targetAmount, setTargetAmount] = useState<number | "">("");
  const [icon, setIcon] = useState("🐷");
  const [color, setColor] = useState("blue");
  const [currencyCode, setCurrencyCode] = useState("MGA");
  const [currencySymbol, setCurrencySymbol] = useState("Ar");
  
  const { mutate, isPending } = useCreateGoal();
  const { toast } = useToast();

  const resetForm = () => {
    setName("");
    setTargetAmount("");
    setIcon("🐷");
    setColor("blue");
    setCurrencyCode("MGA");
    setCurrencySymbol("Ar");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() === "" || targetAmount === "" || targetAmount <= 0) return;

    mutate(
      {
        name,
        targetAmount: Number(targetAmount),
        icon,
        color,
        currencyCode,
        currencySymbol,
      },
      {
        onSuccess: () => {
          toast({
            title: "Goal Created!",
            description: `Start saving for ${name}.`,
          });
          setIsOpen(false);
          resetForm();
        },
        onError: (err) => {
          toast({
            title: "Error",
            description: err.message,
            variant: "destructive",
          });
        },
      }
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <button className="
          inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full font-semibold
          bg-primary text-primary-foreground shadow-lg shadow-primary/25
          hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5
          active:translate-y-0 active:shadow-md
          transition-all duration-200 ease-out w-full md:w-auto
        ">
          <Plus className="w-5 h-5" />
          <span>New Goal</span>
        </button>
      </DialogTrigger>
      
      <DialogContent className="w-[95%] sm:max-w-md rounded-2xl sm:rounded-3xl p-0 overflow-hidden border-0">
        <div className={cn("h-24 sm:h-32 w-full flex items-center justify-center transition-colors duration-300", 
          `bg-${color === 'blue' ? 'blue' : color === 'green' ? 'emerald' : color === 'red' ? 'rose' : color}-100`
        )}>
          <div className="text-5xl sm:text-6xl animate-enter">
            {icon}
          </div>
        </div>
        
        <div className="p-5 sm:p-6">
          <DialogHeader className="mb-6">
            <DialogTitle className="text-2xl font-display font-bold">Create New Goal</DialogTitle>
            <DialogDescription>What are you saving up for?</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground/80 font-display">Goal Name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. New Laptop"
                className="w-full px-4 py-3 rounded-xl bg-background border-2 border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
                autoFocus
              />
            </div>

            <CurrencyInput
              label="Target Amount"
              value={targetAmount}
              onChange={setTargetAmount}
              placeholder="1000.00"
            />

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground/80 font-display">Currency Code</label>
                <input
                  value={currencyCode}
                  onChange={(e) => setCurrencyCode(e.target.value.toUpperCase())}
                  placeholder="MGA"
                  className="w-full px-4 py-3 rounded-xl bg-background border-2 border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground/80 font-display">Symbol</label>
                <input
                  value={currencySymbol}
                  onChange={(e) => setCurrencySymbol(e.target.value)}
                  placeholder="Ar"
                  className="w-full px-4 py-3 rounded-xl bg-background border-2 border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground/80 font-display">Pick an Icon</label>
              <div className="flex flex-wrap gap-2">
                {ICONS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => setIcon(emoji)}
                    className={cn(
                      "w-10 h-10 rounded-lg flex items-center justify-center text-xl transition-all",
                      icon === emoji 
                        ? "bg-primary text-white scale-110 shadow-md" 
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    )}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground/80 font-display">Theme Color</label>
              <div className="flex gap-3">
                {COLORS.map((theme) => (
                  <button
                    key={theme.id}
                    type="button"
                    onClick={() => setColor(theme.id)}
                    className={cn(
                      "w-8 h-8 rounded-full transition-transform",
                      theme.class,
                      color === theme.id ? "ring-2 ring-offset-2 ring-foreground scale-110" : "hover:scale-110 opacity-70 hover:opacity-100"
                    )}
                    aria-label={`Select ${theme.id} theme`}
                  />
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="flex-1 px-4 py-3 rounded-xl font-semibold text-foreground/70 hover:bg-muted transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isPending || !name || !targetAmount}
                className="
                  flex-1 px-4 py-3 rounded-xl font-semibold text-white bg-primary shadow-lg shadow-primary/25
                  hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/30
                  disabled:opacity-50 disabled:cursor-not-allowed
                  transition-all duration-200
                "
              >
                {isPending ? "Creating..." : "Create Goal"}
              </button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
