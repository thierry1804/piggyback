import { useState, useRef, useEffect } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import {
  PiggyBank,
  ArrowLeft,
  ArrowRight,
  Play,
  Target,
  Wallet,
  TrendingUp,
  Settings,
  Sparkles,
  ChevronUp,
  ChevronDown,
  ExternalLink,
} from "lucide-react";
import { useLanguage } from "@/hooks/use-language";
import { TutorialStepMock } from "@/components/tutorial/TutorialMockups";

const TOTAL_STEPS = 6;

const FALLBACK_TUTORIAL = {
  title: "Tutorial",
  subtitle: "Master Piggyback in 5 minutes",
  backHome: "Back to home",
  openApp: "Open app",
  step1Title: "Get started",
  step1Desc: "From the home page, click \"Open app\" or \"Launch the app\" to reach your dashboard.",
  step2Title: "Create a goal",
  step2Desc: "Click \"Create Goal\". Enter a name and target amount. Optionally set an icon, color, currency, and deadline, then confirm.",
  step3Title: "Add or withdraw money",
  step3Desc: "On a goal card use quick add, or open the goal and use \"Add Savings\" or \"Withdraw\". Enter the amount and optional note.",
  step4Title: "Track progress",
  step4Desc: "The dashboard shows total savings and overall progress. Click a goal to see its chart and full transaction history.",
  step5Title: "Settings",
  step5Desc: "Use the Settings icon to set your currency (code and symbol) and language (EN/FR/MG). Optionally sign in to sync to the cloud.",
  step6Title: "In a nutshell",
  step6Desc: "Your data is stored on your device (and optionally in the cloud). The app works offline.",
  screenshotPlaceholder: "Screenshot",
  tryInApp: "Try in app",
  nextStep: "Next",
  prevStep: "Previous",
  stepOf: "Step {current} of {total}",
} as const;

const steps = [
  { icon: Play, titleKey: "step1Title", descKey: "step1Desc", tryAppHref: "/app" },
  { icon: Target, titleKey: "step2Title", descKey: "step2Desc", tryAppHref: "/app" },
  { icon: Wallet, titleKey: "step3Title", descKey: "step3Desc", tryAppHref: "/app" },
  { icon: TrendingUp, titleKey: "step4Title", descKey: "step4Desc", tryAppHref: "/app" },
  { icon: Settings, titleKey: "step5Title", descKey: "step5Desc", tryAppHref: "/app/settings" },
  { icon: Sparkles, titleKey: "step6Title", descKey: "step6Desc", tryAppHref: null },
] as const;

export default function Tutorial() {
  const { t } = useLanguage();
  const tutorial = t.tutorial ?? FALLBACK_TUTORIAL;
  const [currentStep, setCurrentStep] = useState(1);
  const stepRefs = useRef<(HTMLLIElement | null)[]>([]);
  const scrollRequestedStep = useRef<number | null>(null);

  const stepOfLabel =
    typeof (tutorial as Record<string, string>).stepOf === "string"
      ? (tutorial as Record<string, string>).stepOf
          .replace("{current}", String(currentStep))
          .replace("{total}", String(TOTAL_STEPS))
      : `Step ${currentStep} of ${TOTAL_STEPS}`;

  // Smooth scroll vers la diapo courante uniquement quand l'utilisateur clique (Next/Prev/dot)
  useEffect(() => {
    const requested = scrollRequestedStep.current;
    if (requested == null) return;
    const el = stepRefs.current[requested - 1];
    if (!el) {
      scrollRequestedStep.current = null;
      return;
    }
    const raf = requestAnimationFrame(() => {
      el.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });
      scrollRequestedStep.current = null;
    });
    return () => cancelAnimationFrame(raf);
  }, [currentStep]);

  // Les dots suivent le défilement : l'étape active = celle dont le centre est le plus proche du centre du viewport
  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (ticking || scrollRequestedStep.current != null) return;
      ticking = true;
      requestAnimationFrame(() => {
        const refs = stepRefs.current;
        let closest = 0;
        let minDist = Infinity;
        for (let i = 0; i < refs.length; i++) {
          const el = refs[i];
          if (!el) continue;
          const rect = el.getBoundingClientRect();
          const centerY = rect.top + rect.height / 2;
          const viewportCenter = window.innerHeight / 2;
          const distance = Math.abs(centerY - viewportCenter);
          if (distance < minDist) {
            minDist = distance;
            closest = i + 1;
          }
        }
        if (closest >= 1 && closest <= TOTAL_STEPS) {
          setCurrentStep(closest);
        }
        ticking = false;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    const t = setTimeout(onScroll, 150);
    return () => {
      window.removeEventListener("scroll", onScroll);
      clearTimeout(t);
    };
  }, []);

  // Activer le smooth scrolling sur la page (renforce scrollIntoView)
  useEffect(() => {
    const html = document.documentElement;
    const previous = html.style.scrollBehavior;
    html.style.scrollBehavior = "smooth";
    return () => {
      html.style.scrollBehavior = previous;
    };
  }, []);

  const goNext = () => {
    const next = Math.min(TOTAL_STEPS, currentStep + 1);
    scrollRequestedStep.current = next;
    setCurrentStep(next);
  };
  const goPrev = () => {
    const prev = Math.max(1, currentStep - 1);
    scrollRequestedStep.current = prev;
    setCurrentStep(prev);
  };
  const goToStep = (step: number) => {
    scrollRequestedStep.current = step;
    setCurrentStep(step);
  };

  const tryInAppLabel = (tutorial as Record<string, string>).tryInApp ?? FALLBACK_TUTORIAL.tryInApp;
  const nextLabel = (tutorial as Record<string, string>).nextStep ?? FALLBACK_TUTORIAL.nextStep;
  const prevLabel = (tutorial as Record<string, string>).prevStep ?? FALLBACK_TUTORIAL.prevStep;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-violet-50/30 to-emerald-50/20 overflow-x-hidden">
      <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <div className="absolute top-20 left-10 w-72 h-72 bg-violet-300/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-emerald-300/20 rounded-full blur-3xl" />
      </div>

      <header className="relative z-10 pl-14 sm:pl-16 pr-4 sm:pr-6 py-4 sm:py-6 max-w-7xl mx-auto overflow-x-hidden">
        <nav className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between min-w-0" aria-label="Navigation">
          {/* Mobile : ligne 1 = Retour + Ouvrir l'app, ligne 2 = Logo. Desktop : Retour | Logo | Ouvrir */}
          <div className="flex items-center justify-between w-full sm:w-auto gap-2">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 sm:gap-2 text-slate-700 hover:text-slate-900 font-medium transition-colors text-sm flex-shrink-0"
              aria-label={tutorial.backHome}
            >
              <ArrowLeft className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
              <span className="hidden sm:inline">{tutorial.backHome}</span>
            </Link>
            <Link
              href="/app"
              className="inline-flex sm:hidden items-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl text-sm flex-shrink-0"
              aria-label={tutorial.openApp}
            >
              {tutorial.openApp}
              <ArrowRight className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
            </Link>
          </div>
          <div className="flex items-center justify-center sm:justify-center gap-2 sm:gap-3 flex-shrink-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-br from-violet-500 to-violet-600 rounded-xl flex items-center justify-center shadow-lg shadow-violet-500/25 flex-shrink-0" aria-hidden="true">
              <PiggyBank className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <span className="text-lg sm:text-xl font-bold text-slate-800 font-display">Piggyback</span>
          </div>
          <Link
            href="/app"
            className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl transition-all text-sm flex-shrink-0"
            aria-label={tutorial.openApp}
          >
            {tutorial.openApp}
            <ArrowRight className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
          </Link>
        </nav>
      </header>

      {/* Navigation verticale fixe à gauche */}
      <nav
        className="fixed left-0 top-0 bottom-0 z-20 w-14 sm:w-16 flex flex-col items-center py-5 bg-white/95 backdrop-blur-sm border-r border-slate-200/80 shadow-sm"
        aria-label="Navigation entre les étapes"
      >
        <p className="text-[10px] sm:text-xs font-medium text-slate-500 tabular-nums text-center mb-3 px-0.5 leading-tight" aria-live="polite" title={stepOfLabel}>
          {currentStep}/{TOTAL_STEPS}
        </p>
        <button
          type="button"
          onClick={goPrev}
          disabled={currentStep <= 1}
          className="flex items-center justify-center w-10 h-10 rounded-xl font-medium text-slate-700 bg-white border border-slate-200 shadow-sm hover:bg-slate-50 disabled:opacity-50 disabled:pointer-events-none transition-colors mb-2"
          aria-label={prevLabel}
        >
          <ChevronUp className="w-5 h-5" aria-hidden="true" />
        </button>
        <div className="flex flex-col gap-2 py-2" role="tablist">
          {Array.from({ length: TOTAL_STEPS }, (_, i) => (
            <button
              key={i}
              type="button"
              role="tab"
              aria-selected={currentStep === i + 1}
              aria-label={`Étape ${i + 1}`}
              onClick={() => goToStep(i + 1)}
              className={`w-3 h-3 rounded-full transition-colors flex-shrink-0 ${
                currentStep === i + 1 ? "bg-violet-600 scale-125" : "bg-slate-300 hover:bg-slate-400"
              }`}
            />
          ))}
        </div>
        <button
          type="button"
          onClick={goNext}
          disabled={currentStep >= TOTAL_STEPS}
          className="flex items-center justify-center w-10 h-10 rounded-xl font-medium text-slate-700 bg-white border border-slate-200 shadow-sm hover:bg-slate-50 disabled:opacity-50 disabled:pointer-events-none transition-colors mt-2"
          aria-label={nextLabel}
        >
          <ChevronDown className="w-5 h-5" aria-hidden="true" />
        </button>
      </nav>

      <main className="relative z-10 pl-14 sm:pl-16 pr-6 pb-24 max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="pt-6 pb-6 text-center"
        >
          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 font-display mb-2">
            {tutorial.title}
          </h1>
          <p className="text-lg text-slate-600 font-medium">
            {tutorial.subtitle}
          </p>
        </motion.div>

        <ol className="space-y-10" aria-label="Steps">
          {steps.map(({ icon: Icon, titleKey, descKey, tryAppHref }, index) => (
            <motion.li
              key={titleKey}
              ref={(el) => {
                stepRefs.current[index] = el;
              }}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: index * 0.05 }}
              className="scroll-mt-32"
            >
              <div className="flex gap-4">
                <div
                  className={`flex-shrink-0 w-12 h-12 rounded-2xl border shadow-sm flex items-center justify-center transition-colors ${
                    currentStep === index + 1
                      ? "bg-violet-600 text-white border-violet-600"
                      : "bg-white text-violet-600 border-slate-200/80"
                  }`}
                  aria-hidden="true"
                >
                  <Icon className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg font-bold text-slate-900 mb-2">
                    {index + 1}. {tutorial[titleKey]}
                  </h2>

                  <div className="mb-4">
                    <TutorialStepMock stepIndex={index} t={t} />
                  </div>

                  <p className="text-slate-600 leading-relaxed mb-3">
                    {tutorial[descKey]}
                  </p>

                  {tryAppHref && (
                    <Link
                      href={tryAppHref}
                      className="inline-flex items-center gap-2 text-sm font-medium text-violet-600 hover:text-violet-700 hover:underline"
                    >
                      <ExternalLink className="w-4 h-4" aria-hidden="true" />
                      {tryInAppLabel}
                    </Link>
                  )}
                </div>
              </div>
            </motion.li>
          ))}
        </ol>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-14 flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link
            href="/app"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-violet-600 to-violet-500 hover:from-violet-500 hover:to-violet-600 text-white font-bold rounded-2xl transition-all shadow-lg shadow-violet-500/25"
          >
            <PiggyBank className="w-5 h-5" aria-hidden="true" />
            {tutorial.openApp}
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 text-slate-600 hover:text-slate-900 font-medium transition-colors"
          >
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            {tutorial.backHome}
          </Link>
        </motion.div>
      </main>
    </div>
  );
}
