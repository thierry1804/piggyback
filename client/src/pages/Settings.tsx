import { useState, useEffect } from "react";
import { Link } from "wouter";
import { ArrowLeft, Save } from "lucide-react";
import { useSettings, useUpdateSettings } from "@/hooks/use-settings";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

export default function Settings() {
  const { data: settings, isLoading } = useSettings();
  const { mutate: updateSettings, isPending } = useUpdateSettings();
  const { toast } = useToast();
  
  const [currencyCode, setCurrencyCode] = useState(settings?.currencyCode || "MGA");
  const [currencySymbol, setCurrencySymbol] = useState(settings?.currencySymbol || "Ar");

  // Mettre à jour les états quand les settings changent
  useEffect(() => {
    if (settings) {
      setCurrencyCode(settings.currencyCode);
      setCurrencySymbol(settings.currencySymbol);
    }
  }, [settings]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(
      { currencyCode, currencySymbol },
      {
        onSuccess: () => {
          toast({
            title: "Settings saved!",
            description: "Your currency preferences have been updated.",
          });
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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="pt-12 pb-8 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6">
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Back to Dashboard</span>
        </Link>
        <div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-foreground mb-2">Settings</h1>
          <p className="text-lg text-muted-foreground font-medium">Manage your application preferences</p>
        </div>
      </header>

      <main className="px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Currency Settings */}
          <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-xl shadow-black/5 border border-border/50">
            <h2 className="text-2xl font-bold text-foreground mb-2 font-display">Currency</h2>
            <p className="text-muted-foreground mb-6">
              Set your default currency. This will be used throughout the application.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground/80 font-display">
                  Currency Code
                </label>
                <input
                  type="text"
                  value={currencyCode}
                  onChange={(e) => setCurrencyCode(e.target.value.toUpperCase())}
                  placeholder="MGA"
                  className="w-full px-4 py-3 rounded-xl bg-background border-2 border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
                  required
                />
                <p className="text-xs text-muted-foreground">e.g., MGA, USD, EUR</p>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground/80 font-display">
                  Currency Symbol
                </label>
                <input
                  type="text"
                  value={currencySymbol}
                  onChange={(e) => setCurrencySymbol(e.target.value)}
                  placeholder="Ar"
                  className="w-full px-4 py-3 rounded-xl bg-background border-2 border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
                  required
                />
                <p className="text-xs text-muted-foreground">e.g., Ar, $, €</p>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-3">
            <Link
              href="/"
              className="px-6 py-3 rounded-xl font-semibold text-foreground/70 hover:bg-muted transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isPending}
              className="px-6 py-3 rounded-xl font-semibold text-white bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25 hover:shadow-primary/40 transform active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none flex items-center gap-2"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Settings
                </>
              )}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
