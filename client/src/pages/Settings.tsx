import { useState, useEffect } from "react";
import { Link } from "wouter";
import { ArrowLeft, Save, Globe } from "lucide-react";
import { useSettings, useUpdateSettings } from "@/hooks/use-settings";
import { useLanguage } from "@/hooks/use-language";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { languages, type Language } from "@/lib/i18n";

export default function Settings() {
  const { data: settings, isLoading } = useSettings();
  const { mutate: updateSettings, isPending } = useUpdateSettings();
  const { t } = useLanguage();
  const { toast } = useToast();
  
  const [currencyCode, setCurrencyCode] = useState(settings?.currencyCode || "MGA");
  const [currencySymbol, setCurrencySymbol] = useState(settings?.currencySymbol || "Ar");
  const [language, setLanguage] = useState<Language>(settings?.language || "en");

  // Mettre à jour les états quand les settings changent
  useEffect(() => {
    if (settings) {
      setCurrencyCode(settings.currencyCode);
      setCurrencySymbol(settings.currencySymbol);
      setLanguage(settings.language || "en");
    }
  }, [settings]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(
      { currencyCode, currencySymbol, language },
      {
        onSuccess: () => {
          toast({
            title: t.settings.savedTitle,
            description: t.settings.savedDescription,
          });
        },
        onError: (err) => {
          toast({
            title: t.settings.error,
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
        <Link href="/app" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6">
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">{t.settings.backToDashboard}</span>
        </Link>
        <div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-foreground mb-2">{t.settings.title}</h1>
          <p className="text-lg text-muted-foreground font-medium">{t.settings.subtitle}</p>
        </div>
      </header>

      <main className="px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Language Settings */}
          <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-xl shadow-black/5 border border-border/50">
            <div className="flex items-center gap-3 mb-2">
              <Globe className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-bold text-foreground font-display">{t.settings.language}</h2>
            </div>
            <p className="text-muted-foreground mb-6">
              {t.settings.languageDescription}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => setLanguage(lang.code)}
                  className={`
                    flex items-center gap-3 p-4 rounded-xl border-2 transition-all
                    ${language === lang.code 
                      ? 'border-primary bg-primary/5 ring-4 ring-primary/10' 
                      : 'border-border hover:border-primary/50 hover:bg-muted/30'
                    }
                  `}
                >
                  <span className="text-2xl">{lang.flag}</span>
                  <span className="font-semibold text-foreground">{lang.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Currency Settings */}
          <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-xl shadow-black/5 border border-border/50">
            <h2 className="text-2xl font-bold text-foreground mb-2 font-display">{t.settings.currency}</h2>
            <p className="text-muted-foreground mb-6">
              {t.settings.currencyDescription}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground/80 font-display">
                  {t.settings.currencyCode}
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
                  {t.settings.currencySymbol}
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
              href="/app"
              className="px-6 py-3 rounded-xl font-semibold text-foreground/70 hover:bg-muted transition-colors"
            >
              {t.settings.cancelButton}
            </Link>
            <button
              type="submit"
              disabled={isPending}
              className="px-6 py-3 rounded-xl font-semibold text-white bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25 hover:shadow-primary/40 transform active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none flex items-center gap-2"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {t.settings.saving}
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  {t.settings.saveButton}
                </>
              )}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
