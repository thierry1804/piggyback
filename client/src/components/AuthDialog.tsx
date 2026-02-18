import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLanguage } from "@/hooks/use-language";
import { useSignIn, useSignUp } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

interface AuthDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function AuthDialog({ open, onOpenChange, onSuccess }: AuthDialogProps) {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [mode, setMode] = useState<"signIn" | "signUp">("signIn");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");

  const { signIn, isPending: signInPending } = useSignIn();
  const { signUp, isPending: signUpPending } = useSignUp();
  const isPending = signInPending || signUpPending;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!email.trim() || !password) return;

    try {
      if (mode === "signIn") {
        await signIn(email.trim(), password);
        toast({
          title: t.auth.signIn,
          description: "You are now signed in.",
        });
      } else {
        await signUp(email.trim(), password, {
          fullName: fullName.trim() || undefined,
        });
        toast({
          title: t.auth.signUp,
          description: "Account created. You can now sign in.",
        });
      }
      setEmail("");
      setPassword("");
      setFullName("");
      onOpenChange(false);
      onSuccess?.();
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : typeof err === "object" && err !== null && "message" in err
            ? String((err as { message: unknown }).message)
            : String(err);
      toast({
        title: t.settings.error,
        description: msg || "Something went wrong.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {mode === "signIn" ? t.auth.signIn : t.auth.signUp}
          </DialogTitle>
          <DialogDescription>
            {mode === "signIn" ? t.auth.descriptionSignIn : t.auth.descriptionSignUp}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "signUp" && (
            <div className="space-y-2">
              <Label htmlFor="auth-fullName">{t.auth.fullName}</Label>
              <Input
                id="auth-fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder={t.auth.fullName}
                autoComplete="name"
              />
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="auth-email">{t.auth.email}</Label>
            <Input
              id="auth-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              autoComplete="email"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="auth-password">{t.auth.password}</Label>
            <Input
              id="auth-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete={mode === "signIn" ? "current-password" : "new-password"}
              minLength={6}
            />
          </div>
          <div className="flex flex-col gap-3">
            <Button type="submit" disabled={isPending} className="w-full">
              {isPending
                ? "..."
                : mode === "signIn"
                  ? t.auth.signInButton
                  : t.auth.signUpButton}
            </Button>
            <button
              type="button"
              className="text-sm text-muted-foreground hover:text-foreground underline"
              onClick={() => setMode(mode === "signIn" ? "signUp" : "signIn")}
            >
              {mode === "signIn"
                ? t.auth.createAccount
                : t.auth.alreadyHaveAccount}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
