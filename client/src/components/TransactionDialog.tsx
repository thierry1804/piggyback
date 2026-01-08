import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { useCreateTransaction } from "@/hooks/use-transactions";
import { CurrencyInput } from "./CurrencyInput";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

interface TransactionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  goalId: number | null;
  goalName?: string;
  type?: "deposit" | "withdraw";
}

export function TransactionDialog({ 
  isOpen, 
  onClose, 
  goalId, 
  goalName, 
  type = "deposit" 
}: TransactionDialogProps) {
  const [amount, setAmount] = useState<number | "">("");
  const [note, setNote] = useState("");
  const { mutate, isPending } = useCreateTransaction();
  const { toast } = useToast();

  // Reset form when opening
  useEffect(() => {
    if (isOpen) {
      setAmount("");
      setNote("");
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!goalId || amount === "" || amount <= 0) return;

    // Withdrawals are negative amounts
    const finalAmount = type === "withdraw" ? -Math.abs(amount) : Math.abs(amount);

    mutate(
      {
        goalId,
        amount: finalAmount,
        note: note || undefined,
      },
      {
        onSuccess: () => {
          toast({
            title: type === "deposit" ? "Saved!" : "Withdrawn",
            description: `Successfully ${type === "deposit" ? "added" : "withdrew"} $${(Math.abs(amount) / 100).toFixed(2)}`,
          });
          onClose();
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

  const isDeposit = type === "deposit";

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md rounded-3xl p-0 overflow-hidden border-0 gap-0">
        <div className={`h-2 w-full ${isDeposit ? 'bg-primary' : 'bg-orange-500'}`} />
        
        <div className="p-6">
          <DialogHeader className="mb-6">
            <DialogTitle className="text-2xl font-display font-bold">
              {isDeposit ? "Add Savings" : "Withdraw Funds"}
            </DialogTitle>
            <DialogDescription>
              {isDeposit ? "Great job! Keep the momentum going." : "Need to take some out? No worries."}
              {goalName && <span className="block mt-1 font-medium text-foreground">For: {goalName}</span>}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            <CurrencyInput
              label="Amount"
              value={amount}
              onChange={setAmount}
              placeholder="0.00"
              autoFocus
            />

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground/80 font-display">
                Note (Optional)
              </label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder={isDeposit ? "Weekly savings..." : "Emergency car repair..."}
                className="w-full px-4 py-3 rounded-xl bg-background border-2 border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-3 rounded-xl font-semibold text-foreground/70 hover:bg-muted transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isPending || amount === "" || amount <= 0}
                className={`
                  flex-1 px-4 py-3 rounded-xl font-semibold text-white shadow-lg
                  transform active:scale-[0.98] transition-all duration-200
                  disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none
                  ${isDeposit 
                    ? 'bg-primary hover:bg-primary/90 shadow-primary/25 hover:shadow-primary/40' 
                    : 'bg-orange-500 hover:bg-orange-600 shadow-orange-500/25 hover:shadow-orange-500/40'
                  }
                `}
              >
                {isPending ? "Processing..." : isDeposit ? "Save Money" : "Withdraw"}
              </button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
