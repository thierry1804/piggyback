/**
 * Maquettes statiques pour le tutoriel : reproduction visuelle des écrans de l'app.
 * Les textes suivent la langue de l'app (t passé par le parent).
 */
import {
  ArrowRight,
  Plus,
  TrendingUp,
  Globe,
  Smartphone,
  Cloud,
  Wallet,
} from "lucide-react";
import type { Translations } from "@/lib/i18n";
import { languages } from "@/lib/i18n";

export function MockLandingCta({ t }: { t: Translations }) {
  const mockHint = (t.tutorial as Record<string, string>)?.mockLandingHint ?? "Click the button below to open the dashboard.";
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-lg shadow-slate-900/5">
      <p className="text-xs font-bold text-violet-600 uppercase tracking-wider mb-2">
        {t.landing.heroTitle} {t.landing.heroTitleHighlight}
      </p>
      <p className="text-slate-700 text-sm mb-4">
        {mockHint}
      </p>
      <button
        type="button"
        className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white font-semibold rounded-full text-sm cursor-default"
        aria-hidden
      >
        {t.landing.openApp}
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
}

export function MockCreateGoal({ t }: { t: Translations }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-lg shadow-slate-900/5 overflow-hidden">
      <div className="h-20 bg-violet-100 flex items-center justify-center">
        <span className="text-4xl" aria-hidden>🐷</span>
      </div>
      <div className="p-4 space-y-3">
        <div>
          <label className="text-xs font-medium text-slate-600 block mb-1">{t.dialogs.goalName}</label>
          <div className="h-9 rounded-lg bg-slate-100 border border-slate-200" />
        </div>
        <div>
          <label className="text-xs font-medium text-slate-600 block mb-1">{t.dialogs.targetAmount}</label>
          <div className="h-9 rounded-lg bg-slate-100 border border-slate-200 w-2/3" />
        </div>
        <div className="flex gap-2 pt-2">
          <div className="h-8 flex-1 rounded-full bg-slate-200" />
          <button
            type="button"
            className="px-4 py-2 rounded-full bg-violet-600 text-white text-sm font-semibold cursor-default"
            aria-hidden
          >
            {t.dialogs.create}
          </button>
        </div>
      </div>
    </div>
  );
}

export function MockGoalCard({ t }: { t: Translations }) {
  const targetLabel = (t.tutorial as Record<string, string>)?.target ?? "target";
  return (
    <div className="rounded-2xl border border-emerald-100 bg-white p-4 shadow-md">
      <div className="flex justify-between items-start mb-3">
        <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-xl">
          🏠
        </div>
        <div className="w-9 h-9 rounded-full border border-slate-200 bg-white flex items-center justify-center text-slate-500">
          <Plus className="w-4 h-4" />
        </div>
      </div>
      <h3 className="font-bold text-slate-900 text-sm truncate">{t.landing.house}</h3>
      <p className="text-lg font-bold font-mono text-slate-800">Ar 1 250 000</p>
      <div className="mt-2 h-2 w-full bg-emerald-100 rounded-full overflow-hidden">
        <div className="h-full bg-emerald-500 rounded-full" style={{ width: "42%" }} />
      </div>
      <p className="text-xs text-slate-500 mt-1">42% · Ar 3 000 000 {targetLabel}</p>
    </div>
  );
}

export function MockDashboard({ t }: { t: Translations }) {
  const targetLabel = (t.tutorial as Record<string, string>)?.target ?? "target";
  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-lg shadow-slate-900/5 overflow-hidden">
      <div className="bg-violet-50/80 border-b border-violet-100 p-4">
        <p className="text-xs font-bold text-violet-600 uppercase tracking-wider">{t.dashboard.totalSavings}</p>
        <p className="text-2xl font-bold font-mono text-slate-900">Ar 2 450 000</p>
        <div className="mt-2 h-2 w-full bg-white rounded-full overflow-hidden border border-violet-100">
          <div className="h-full bg-violet-500 rounded-full" style={{ width: "55%" }} />
        </div>
        <p className="text-xs text-slate-500 mt-1">55% {t.common.of} Ar 4 450 000 {targetLabel}</p>
      </div>
      <div className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="w-4 h-4 text-slate-500" />
          <span className="text-sm font-bold text-slate-800">{t.dashboard.yourGoals}</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-xl border border-blue-100 p-3">
            <div className="flex justify-between">
              <span className="text-lg">🐷</span>
              <Plus className="w-3.5 h-3.5 text-slate-400" />
            </div>
            <p className="font-semibold text-slate-800 text-xs truncate">{t.landing.travel}</p>
            <p className="text-sm font-mono font-bold text-slate-700">Ar 800 000</p>
            <div className="h-1.5 bg-blue-100 rounded-full mt-1">
              <div className="h-full bg-blue-500 rounded-full" style={{ width: "26%" }} />
            </div>
          </div>
          <div className="rounded-xl border border-emerald-100 p-3">
            <div className="flex justify-between">
              <span className="text-lg">🏠</span>
              <Plus className="w-3.5 h-3.5 text-slate-400" />
            </div>
            <p className="font-semibold text-slate-800 text-xs truncate">{t.landing.house}</p>
            <p className="text-sm font-mono font-bold text-slate-700">Ar 1 650 000</p>
            <div className="h-1.5 bg-emerald-100 rounded-full mt-1">
              <div className="h-full bg-emerald-500 rounded-full" style={{ width: "55%" }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function MockGoalDetail({ t }: { t: Translations }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-lg shadow-slate-900/5 overflow-hidden">
      <div className="p-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-2xl">
            🏠
          </div>
          <div>
            <h2 className="font-bold text-slate-900">{t.landing.house}</h2>
            <p className="text-xl font-bold font-mono text-slate-800">Ar 1 650 000 <span className="text-slate-400 font-normal text-sm">/ 3 000 000</span></p>
          </div>
        </div>
        <div className="h-2.5 w-full bg-emerald-100 rounded-full mt-3 overflow-hidden">
          <div className="h-full bg-emerald-500 rounded-full" style={{ width: "55%" }} />
        </div>
      </div>
      <div className="p-4 flex gap-2">
        <button
          type="button"
          className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-violet-600 text-white text-sm font-semibold cursor-default"
          aria-hidden
        >
          <Plus className="w-4 h-4" />
          {t.goalDetails.addSavings}
        </button>
        <button
          type="button"
          className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-sm font-medium cursor-default"
          aria-hidden
        >
          <Wallet className="w-4 h-4" />
          {t.goalDetails.withdraw}
        </button>
      </div>
      <div className="px-4 pb-4">
        <div className="h-20 rounded-xl bg-slate-50 border border-slate-100 flex items-end justify-around gap-1 px-2 py-2">
          {[40, 65, 45, 70, 55, 80, 60].map((h, i) => (
            <div
              key={i}
              className="flex-1 max-w-[24px] bg-violet-400 rounded-t"
              style={{ height: `${h}%` }}
              aria-hidden
            />
          ))}
        </div>
        <p className="text-xs text-slate-500 mt-2 text-center">{t.goalDetails.history}</p>
      </div>
    </div>
  );
}

export function MockSettings({ t }: { t: Translations }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-lg shadow-slate-900/5 overflow-hidden">
      <div className="p-4 border-b border-slate-100">
        <div className="flex items-center gap-2 mb-2">
          <Globe className="w-5 h-5 text-violet-600" />
          <h2 className="font-bold text-slate-900 text-sm">{t.settings.language}</h2>
        </div>
        <p className="text-xs text-slate-500 mb-3">{t.settings.languageDescription}</p>
        <div className="flex gap-2">
          {languages.map((lang, i) => (
            <button
              key={lang.code}
              type="button"
              className={`flex-1 flex items-center justify-center gap-1 py-2.5 rounded-xl border-2 text-sm font-medium cursor-default ${
                i === 0 ? "border-violet-500 bg-violet-50 text-violet-700" : "border-slate-200 text-slate-600"
              }`}
              aria-hidden
            >
              {lang.flag}
            </button>
          ))}
        </div>
      </div>
      <div className="p-4">
        <h2 className="font-bold text-slate-900 text-sm mb-2">{t.settings.currency}</h2>
        <p className="text-xs text-slate-500 mb-3">{t.settings.currencyDescription}</p>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs text-slate-600 block mb-1">{t.settings.currencyCode}</label>
            <div className="h-9 rounded-lg bg-slate-100 border border-slate-200" />
          </div>
          <div>
            <label className="text-xs text-slate-600 block mb-1">{t.settings.currencySymbol}</label>
            <div className="h-9 rounded-lg bg-slate-100 border border-slate-200" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function MockSummary({ t }: { t: Translations }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-lg shadow-slate-900/5 flex flex-col items-center justify-center gap-4 text-center">
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center">
          <Smartphone className="w-7 h-7 text-slate-500" />
        </div>
        <div className="w-8 h-px bg-slate-200" aria-hidden />
        <div className="w-14 h-14 rounded-2xl bg-violet-50 flex items-center justify-center">
          <Cloud className="w-7 h-7 text-violet-500" />
        </div>
      </div>
      <p className="text-sm text-slate-700 leading-relaxed">
        {t.tutorial.step6Desc}
      </p>
    </div>
  );
}

const MOCKS = [
  MockLandingCta,
  MockCreateGoal,
  MockGoalCard,
  MockGoalDetail,
  MockSettings,
  MockSummary,
] as const;

export function TutorialStepMock({ stepIndex, t }: { stepIndex: number; t: Translations }) {
  const Mock = stepIndex >= 0 && stepIndex < MOCKS.length ? MOCKS[stepIndex] : null;
  if (!Mock) return null;
  return (
    <div className="w-full max-w-sm mx-auto pointer-events-none select-none">
      <Mock t={t} />
    </div>
  );
}
