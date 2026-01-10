import { Link } from "wouter";
import { motion } from "framer-motion";
import { 
  PiggyBank, 
  Target, 
  TrendingUp, 
  Sparkles, 
  ArrowRight, 
  Check,
  Wallet,
  LineChart,
  Shield,
  Globe
} from "lucide-react";
import { useLanguage } from "@/hooks/use-language";
import { useSettings, useUpdateSettings } from "@/hooks/use-settings";
import { languages, type Language } from "@/lib/i18n";
import { useState } from "react";

export default function Landing() {
  const { t, language } = useLanguage();
  const { data: settings } = useSettings();
  const { mutate: updateSettings } = useUpdateSettings();
  const [showLangMenu, setShowLangMenu] = useState(false);

  const handleLanguageChange = (lang: Language) => {
    if (settings) {
      updateSettings({ ...settings, language: lang });
    }
    setShowLangMenu(false);
  };

  const features = [
    {
      icon: Target,
      title: t.landing.featureGoalsTitle,
      description: t.landing.featureGoalsDesc
    },
    {
      icon: LineChart,
      title: t.landing.featureTrackingTitle,
      description: t.landing.featureTrackingDesc
    },
    {
      icon: Wallet,
      title: t.landing.featureTransactionsTitle,
      description: t.landing.featureTransactionsDesc
    },
    {
      icon: Shield,
      title: t.landing.featurePrivateTitle,
      description: t.landing.featurePrivateDesc
    }
  ];

  const steps = [
    { num: "01", title: t.landing.step1Title, desc: t.landing.step1Desc },
    { num: "02", title: t.landing.step2Title, desc: t.landing.step2Desc },
    { num: "03", title: t.landing.step3Title, desc: t.landing.step3Desc }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-violet-50/30 to-emerald-50/20 overflow-hidden">
      {/* Animated Background Elements - decorative, hidden from screen readers */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <div className="absolute top-20 left-10 w-72 h-72 bg-violet-300/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-emerald-300/20 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-200/10 rounded-full blur-3xl" />
      </div>

      {/* Header with Navigation */}
      <header className="relative z-50">
        <nav className="px-6 py-6 max-w-7xl mx-auto" aria-label="Navigation principale">
          <div className="flex items-center justify-between">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-violet-600 rounded-2xl flex items-center justify-center shadow-lg shadow-violet-500/25" aria-hidden="true">
                <PiggyBank className="w-7 h-7 text-white" />
              </div>
              <span className="text-2xl font-bold text-slate-800 tracking-tight font-display">Piggyback</span>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3"
            >
              {/* Language Selector */}
              <div className="relative">
                <button
                  onClick={() => setShowLangMenu(!showLangMenu)}
                  className="flex items-center gap-2 px-3 py-2 rounded-full bg-white/80 backdrop-blur-sm border border-slate-200 hover:bg-white transition-all text-sm font-medium text-slate-700"
                  aria-label="Changer de langue"
                  aria-expanded={showLangMenu}
                  aria-haspopup="listbox"
                >
                  <Globe className="w-4 h-4" aria-hidden="true" />
                  <span>{languages.find(l => l.code === language)?.flag}</span>
                </button>
                
                {showLangMenu && (
                  <div className="absolute right-0 mt-2 w-40 bg-white rounded-xl shadow-xl border border-slate-100 py-2 z-50" role="listbox" aria-label="Sélection de langue">
                    {languages.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => handleLanguageChange(lang.code)}
                        role="option"
                        aria-selected={language === lang.code}
                        className={`w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-slate-50 transition-colors ${
                          language === lang.code ? 'bg-violet-50 text-violet-700' : 'text-slate-700'
                        }`}
                      >
                        <span aria-hidden="true">{lang.flag}</span>
                        <span className="font-medium">{lang.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <Link 
                href="/app" 
                className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-full transition-all hover:shadow-xl hover:shadow-slate-900/20 hover:-translate-y-0.5"
                aria-label="Ouvrir l'application Piggyback"
              >
                {t.landing.openApp}
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Link>
            </motion.div>
          </div>
        </nav>
      </header>

      <main>

      {/* Hero Section */}
      <section className="relative z-10 px-6 pt-16 pb-24 max-w-7xl mx-auto" aria-labelledby="hero-title">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="space-y-8"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-violet-100 text-violet-700 rounded-full text-sm font-medium">
              <Sparkles className="w-4 h-4" aria-hidden="true" />
              <span>{t.landing.tagline}</span>
            </div>
            
            <h1 id="hero-title" className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-slate-900 leading-[1.1] font-display">
              {t.landing.heroTitle}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-emerald-500"> {t.landing.heroTitleHighlight}</span>
            </h1>
            
            <p className="text-xl text-slate-600 max-w-lg leading-relaxed">
              {t.landing.heroDescription}
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link 
                href="/app"
                className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-violet-600 to-violet-500 hover:from-violet-500 hover:to-violet-600 text-white font-bold text-lg rounded-2xl transition-all hover:shadow-2xl hover:shadow-violet-500/30 hover:-translate-y-1"
                aria-label="Commencer à épargner maintenant"
              >
                <PiggyBank className="w-6 h-6" aria-hidden="true" />
                {t.landing.getStarted}
              </Link>
              
              <a 
                href="#features"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/80 backdrop-blur-sm hover:bg-white text-slate-700 font-semibold text-lg rounded-2xl border border-slate-200 transition-all hover:shadow-lg"
              >
                {t.landing.learnMore}
              </a>
            </div>

            <ul className="flex items-center gap-8 pt-4" aria-label="Avantages de Piggyback">
              <li className="flex items-center gap-2">
                <Check className="w-5 h-5 text-emerald-500" aria-hidden="true" />
                <span className="text-slate-600">{t.landing.free}</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-5 h-5 text-emerald-500" aria-hidden="true" />
                <span className="text-slate-600">{t.landing.noSignup}</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-5 h-5 text-emerald-500" aria-hidden="true" />
                <span className="text-slate-600">{t.landing.private}</span>
              </li>
            </ul>
          </motion.div>

          {/* Hero Visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="relative"
          >
            <div className="relative z-10">
              {/* Mock App Card */}
              <div className="bg-white rounded-3xl shadow-2xl shadow-slate-900/10 p-8 border border-slate-100">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <p className="text-xs font-bold text-violet-600 uppercase tracking-wider">{t.landing.totalSaved}</p>
                    <p className="text-4xl font-bold text-slate-900 font-mono mt-1">$ 2,450</p>
                  </div>
                  <div className="w-14 h-14 bg-gradient-to-br from-violet-500 to-violet-600 rounded-2xl flex items-center justify-center">
                    <TrendingUp className="w-7 h-7 text-white" />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full w-3/4 bg-gradient-to-r from-violet-500 to-emerald-400 rounded-full" />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { emoji: "🎓", name: t.landing.education, progress: 85, color: "from-violet-500 to-violet-400" },
                      { emoji: "🏠", name: t.landing.house, progress: 42, color: "from-emerald-500 to-emerald-400" },
                      { emoji: "✈️", name: t.landing.travel, progress: 67, color: "from-amber-500 to-amber-400" },
                      { emoji: "💻", name: "Laptop", progress: 91, color: "from-rose-500 to-rose-400" }
                    ].map((goal) => (
                      <div key={goal.name} className="bg-slate-50 rounded-2xl p-4">
                        <div className="text-2xl mb-2">{goal.emoji}</div>
                        <p className="text-sm font-semibold text-slate-700">{goal.name}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                            <div 
                              className={`h-full bg-gradient-to-r ${goal.color} rounded-full`}
                              style={{ width: `${goal.progress}%` }}
                            />
                          </div>
                          <span className="text-xs font-bold text-slate-500">{goal.progress}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Floating Elements */}
              <motion.div 
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -top-6 -right-6 bg-white rounded-2xl shadow-xl p-4 border border-slate-100"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                    <Check className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">{t.landing.goalReached}</p>
                    <p className="text-xs text-slate-500">{t.landing.parisTrip}</p>
                  </div>
                </div>
              </motion.div>

              <motion.div 
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                className="absolute -bottom-4 -left-6 bg-white rounded-2xl shadow-xl p-4 border border-slate-100"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-violet-100 rounded-xl flex items-center justify-center text-xl">
                    💰
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">+$ 500</p>
                    <p className="text-xs text-slate-500">{t.landing.depositAdded}</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative z-10 px-6 py-24 bg-white/50 backdrop-blur-sm" aria-labelledby="features-title">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 id="features-title" className="text-4xl sm:text-5xl font-bold text-slate-900 mb-4 font-display">
              {t.landing.featuresTitle}
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              {t.landing.featuresSubtitle}
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6" role="list" aria-label="Fonctionnalités de Piggyback">
            {features.map((feature, index) => (
              <motion.article
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-3xl p-8 shadow-lg shadow-slate-900/5 border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all group"
                role="listitem"
              >
                <div className="w-14 h-14 bg-gradient-to-br from-violet-100 to-violet-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform" aria-hidden="true">
                  <feature.icon className="w-7 h-7 text-violet-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                <p className="text-slate-600 leading-relaxed">{feature.description}</p>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="relative z-10 px-6 py-24" aria-labelledby="steps-title">
        <div className="max-w-5xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 id="steps-title" className="text-4xl sm:text-5xl font-bold text-slate-900 mb-4 font-display">
              {t.landing.stepsTitle}
            </h2>
            <p className="text-xl text-slate-600">
              {t.landing.stepsSubtitle}
            </p>
          </motion.div>

          <ol className="grid md:grid-cols-3 gap-8" aria-label="Étapes pour commencer">
            {steps.map((step, index) => (
              <motion.li
                key={step.num}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15 }}
                className="relative"
              >
                <div className="text-7xl font-black text-violet-100 mb-4 font-display" aria-hidden="true">{step.num}</div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">{step.title}</h3>
                <p className="text-slate-600">{step.desc}</p>
                
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-10 right-0 translate-x-1/2" aria-hidden="true">
                    <ArrowRight className="w-8 h-8 text-violet-200" />
                  </div>
                )}
              </motion.li>
            ))}
          </ol>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 px-6 py-24" aria-labelledby="cta-title">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto"
        >
          <div className="bg-gradient-to-br from-violet-600 via-violet-500 to-emerald-500 rounded-[2.5rem] p-12 sm:p-16 text-center relative overflow-hidden">
            {/* Background Pattern - decorative */}
            <div className="absolute inset-0 opacity-10" aria-hidden="true">
              <div className="absolute top-0 left-0 w-40 h-40 border border-white rounded-full -translate-x-1/2 -translate-y-1/2" />
              <div className="absolute bottom-0 right-0 w-60 h-60 border border-white rounded-full translate-x-1/4 translate-y-1/4" />
              <div className="absolute top-1/2 left-1/2 w-80 h-80 border border-white rounded-full -translate-x-1/2 -translate-y-1/2" />
            </div>

            <div className="relative z-10">
              <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center mx-auto mb-8" aria-hidden="true">
                <PiggyBank className="w-10 h-10 text-white" />
              </div>
              
              <h2 id="cta-title" className="text-4xl sm:text-5xl font-bold text-white mb-6 font-display">
                {t.landing.ctaTitle}
              </h2>
              <p className="text-xl text-white/80 mb-10 max-w-xl mx-auto">
                {t.landing.ctaDescription}
              </p>
              
              <Link 
                href="/app"
                className="inline-flex items-center gap-3 px-10 py-5 bg-white hover:bg-slate-50 text-violet-600 font-bold text-lg rounded-2xl transition-all hover:shadow-2xl hover:shadow-black/20 hover:-translate-y-1"
                aria-label="Lancer l'application Piggyback"
              >
                {t.landing.launchApp}
                <ArrowRight className="w-5 h-5" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </motion.div>
      </section>
      </main>

      {/* Footer */}
      <footer className="relative z-10 px-6 py-12 border-t border-slate-200/50" role="contentinfo">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-violet-600 rounded-xl flex items-center justify-center" aria-hidden="true">
              <PiggyBank className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-slate-800">Piggyback</span>
          </div>
          
          <p className="text-slate-500 text-sm">
            © {new Date().getFullYear()} Piggyback. {t.landing.footerText}
          </p>
        </div>
      </footer>
    </div>
  );
}
