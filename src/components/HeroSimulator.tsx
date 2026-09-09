import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  Car,
  Hammer,
  Wallet,
  Leaf,
  RefreshCw,
  Zap,
  ArrowRight,
  CheckCircle2,
  Percent,
  Sparkles,
  ShieldCheck,
  Globe2,
  Clock,
  TrendingDown
} from 'lucide-react';
import { ProjectType, RateConfig } from '../types';
import { PROJECT_OPTIONS } from '../data';
import { calculateLoan, formatEuro, getAnnualRate } from '../utils/loanCalculator';
import { getStoredRateConfig } from '../utils/storage';
import heroYoungBorrowers from '../assets/images/hero-young-borrowers.png';
import simulatorBg from '../assets/images/simulator-bg.jpg';

const masterEase = [0.16, 1, 0.3, 1];

interface HeroSimulatorProps {
  onStartApplication: (project: ProjectType, amount: number, months: number, withInsurance: boolean) => void;
  selectedProject: ProjectType;
  onSelectProject: (project: ProjectType) => void;
}

export const HeroSimulator: React.FC<HeroSimulatorProps> = ({
  onStartApplication,
  selectedProject,
  onSelectProject,
}) => {
  const currentProject = useMemo(() => {
    return PROJECT_OPTIONS.find((p) => p.id === selectedProject) || PROJECT_OPTIONS[0];
  }, [selectedProject]);

  // CDC Specs : Min 5 000 € | Max 500 000 €
  const MIN_AMOUNT = 5000;
  const MAX_AMOUNT = 500000;
  const STEP_AMOUNT = 500;

  // CDC Specs : Min 12 mois | Max 72 mois
  const MIN_MONTHS = 12;
  const MAX_MONTHS = 72;
  const STEP_MONTHS = 1;

  const [amount, setAmount] = useState<number>(25000);
  const [months, setMonths] = useState<number>(48);
  const [includeInsurance, setIncludeInsurance] = useState<boolean>(false);
  const [rateConfig, setRateConfig] = useState<RateConfig>(getStoredRateConfig());

  // Listen to Back-Office rate configuration changes
  useEffect(() => {
    const handleRateUpdate = () => {
      setRateConfig(getStoredRateConfig());
    };
    window.addEventListener('rate_config_updated', handleRateUpdate);
    return () => window.removeEventListener('rate_config_updated', handleRateUpdate);
  }, []);

  // Perform calculation in real-time
  const calculation = useMemo(() => {
    const effectiveRate = getAnnualRate(amount, months, rateConfig);
    return calculateLoan(amount, months, selectedProject, includeInsurance, effectiveRate);
  }, [amount, months, selectedProject, includeInsurance, rateConfig]);

  const amountPresets = [10000, 25000, 50000, 100000, 250000];
  const monthOptions = [12, 24, 36, 48, 60, 72];

  const getProjectIcon = (id: ProjectType) => {
    switch (id) {
      case 'auto':
        return <Car className="w-4 h-4" />;
      case 'travaux':
        return <Hammer className="w-4 h-4" />;
      case 'eco':
        return <Leaf className="w-4 h-4" />;
      case 'rachat':
        return <RefreshCw className="w-4 h-4" />;
      case 'imprevu':
        return <Zap className="w-4 h-4" />;
      case 'perso':
      default:
        return <Wallet className="w-4 h-4" />;
    }
  };

  return (
    <section
      id="simulateur"
      className="relative bg-white bg-cover bg-center bg-no-repeat py-8 lg:py-16 overflow-hidden"
      style={{
        backgroundImage: `url(${simulatorBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Subtle modern ambient background glow */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-200/30 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-indigo-200/25 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 2-Column Hero Grid: Left = Headline, Value Prop & Visual / Right = Interactive Simulator */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Left Column: Headline, Value Proposition, Image & Floating Badges */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="lg:col-span-5 flex flex-col space-y-6"
          >
            {/* Value Header & Punchy H1 */}
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200/80 text-blue-800 text-xs font-bold tracking-wide shadow-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                <span>BARÈME 2026 • TAUX FIXE DÈS {rateConfig.baseRate.toFixed(2)}% TAEG</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-[42px] font-extrabold text-slate-900 tracking-tight leading-[1.15]">
                <span className="block overflow-hidden pb-1">
                  <motion.span
                    initial={{ y: '100%', opacity: 0 }}
                    animate={{ y: '0%', opacity: 1 }}
                    transition={{ duration: 0.9, ease: masterEase }}
                    className="inline-block"
                  >
                    Le crédit en ligne,
                  </motion.span>
                </span>
                <span className="block overflow-hidden">
                  <motion.span
                    initial={{ y: '100%', opacity: 0 }}
                    animate={{ y: '0%', opacity: 1 }}
                    transition={{ duration: 0.9, delay: 0.15, ease: masterEase }}
                    className="inline-block text-transparent bg-clip-text bg-gradient-to-r from-blue-700 via-indigo-600 to-sky-600"
                  >
                    plus simple & rapide.
                  </motion.span>
                </span>
              </h1>

              <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                Simulez votre financement de <strong>5 000 €</strong> à <strong>500 000 €</strong> en quelques clics. 
                Démarche <strong>Zéro Document</strong> à la souscription, 0 € de frais de dossier et réponse express sous 24h-48h.
              </p>
            </div>

            {/* Visual with Image 1 & Floating Cashflow Component */}
            <div className="w-full max-w-md mx-auto lg:max-w-none pt-1">
              <div className="flex justify-center items-center">
                <img
                  src={heroYoungBorrowers}
                  onError={(e) => {
                    const target = e.currentTarget;
                    if (!target.dataset.tried1) {
                      target.dataset.tried1 = 'true';
                      target.src = '/image-1.png';
                    } else if (!target.dataset.tried2) {
                      target.dataset.tried2 = 'true';
                      target.src = '/image 1.png';
                    }
                  }}
                  alt="Financement en ligne R-Financial group"
                  referrerPolicy="no-referrer"
                  className="w-full max-h-[340px] sm:max-h-[380px] object-contain block mx-auto drop-shadow-sm"
                />
              </div>

              {/* Floating UI Component ("Cashflow") arriving with smooth deceleration and levitation */}
              <motion.div
                initial={{ opacity: 0, x: 35 }}
                animate={{
                  opacity: 1,
                  x: 0,
                  y: [0, -5, 0]
                }}
                transition={{
                  x: { duration: 1.1, ease: masterEase, delay: 0.35 },
                  opacity: { duration: 0.8, delay: 0.35 },
                  y: { duration: 3.8, repeat: Infinity, ease: 'easeInOut', delay: 1.2 }
                }}
                className="mt-3 p-3.5 sm:p-4 rounded-2xl bg-white/95 backdrop-blur-md border border-slate-200/80 shadow-[0_20px_40px_-12px_rgba(16,185,129,0.28)] flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold shadow-xs border border-emerald-100 shrink-0">
                    <Sparkles className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">Cashflow débloqué</span>
                    <span className="text-[11px] font-medium text-emerald-600 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Fonds disponibles sous 24h-48h
                    </span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-base font-black text-slate-900 block">{formatEuro(amount)}</span>
                  <span className="text-[10px] font-medium text-slate-500">Mensualité : {formatEuro(includeInsurance ? calculation.monthlyTotalWithInsurance : calculation.monthlyPayment, 2)}</span>
                </div>
              </motion.div>

              {/* Trust Indicators cleanly situated below the image and floating component */}
              <div className="grid grid-cols-3 gap-2.5 mt-3 text-center">
                <div className="p-2.5 bg-white rounded-xl border border-slate-200 shadow-xs">
                  <span className="text-sm sm:text-base font-extrabold text-blue-700 block">0 €</span>
                  <span className="text-[10px] sm:text-[11px] font-medium text-slate-500">Frais de dossier</span>
                </div>
                <div className="p-2.5 bg-white rounded-xl border border-slate-200 shadow-xs">
                  <span className="text-sm sm:text-base font-extrabold text-emerald-600 block">24h/48h</span>
                  <span className="text-[10px] sm:text-[11px] font-medium text-slate-500">Étude express</span>
                </div>
                <div className="p-2.5 bg-white rounded-xl border border-slate-200 shadow-xs">
                  <span className="text-sm sm:text-base font-extrabold text-indigo-700 block">Fixe</span>
                  <span className="text-[10px] sm:text-[11px] font-medium text-slate-500">Sans surprise</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Column: Hyper-Modern Interactive Loan Simulator Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="lg:col-span-7"
          >
            {/* Offset Layout with soft lime accent backing (from PDF Art Direction Section 4) */}
            <div className="relative group">
              <div className="absolute inset-0 translate-x-2.5 translate-y-2.5 sm:translate-x-3.5 sm:translate-y-3.5 bg-lime-300/80 rounded-3xl -z-10 border border-lime-400/40 transition-transform duration-300 group-hover:translate-x-4 group-hover:translate-y-4" />
              <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/70 border border-slate-200/90 p-5 sm:p-7 relative">
              {/* Simulator Card Header */}
              <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-100">
                <div>
                  <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">Simulateur interactif instantané</span>
                  <h2 className="text-xl font-extrabold text-slate-900">Configurez votre crédit</h2>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold">
                  <Percent className="w-3.5 h-3.5" />
                  <span>Devise Euro (€)</span>
                </div>
              </div>

              {/* 1. Project Selection Tabs */}
              <div className="space-y-2 mb-6">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                  1. Nature de votre projet
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {PROJECT_OPTIONS.map((proj) => {
                    const isSelected = proj.id === selectedProject;
                    return (
                      <button
                        key={proj.id}
                        type="button"
                        onClick={() => onSelectProject(proj.id)}
                        className={`flex items-center gap-2 p-2.5 rounded-xl text-left text-xs font-semibold transition-all border cursor-pointer ${
                          isSelected
                            ? 'bg-blue-50 border-blue-600 text-blue-900 shadow-sm ring-2 ring-blue-500/20'
                            : 'bg-slate-50/70 hover:bg-slate-100 border-slate-200 text-slate-700'
                        }`}
                      >
                        <span className={`p-1.5 rounded-lg ${isSelected ? 'bg-blue-600 text-white' : 'bg-white text-slate-600 shadow-xs'}`}>
                          {getProjectIcon(proj.id)}
                        </span>
                        <span className="truncate">{proj.shortName}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. Amount Selector (5 000 € à 500 000 €) */}
              <div className="space-y-3 mb-6 bg-slate-50/70 p-4 rounded-2xl border border-slate-200/70">
                <div className="flex items-center justify-between">
                  <label htmlFor="loan-amount-slider" className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    2. Montant du prêt (Min : 5 000 € | Max : 500 000 €)
                  </label>
                  <div className="flex items-center gap-1 bg-white border border-slate-300 px-3 py-1.5 rounded-xl shadow-xs">
                    <input
                      id="loan-amount-input"
                      type="number"
                      min={MIN_AMOUNT}
                      max={MAX_AMOUNT}
                      step={STEP_AMOUNT}
                      value={amount}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        if (!isNaN(val)) {
                          setAmount(Math.min(Math.max(val, MIN_AMOUNT), MAX_AMOUNT));
                        }
                      }}
                      className="w-28 text-right font-extrabold text-blue-900 text-lg sm:text-xl focus:outline-none"
                    />
                    <span className="font-bold text-slate-700 text-base">€</span>
                  </div>
                </div>

                {/* Range Slider */}
                <input
                  id="loan-amount-slider"
                  type="range"
                  min={MIN_AMOUNT}
                  max={MAX_AMOUNT}
                  step={STEP_AMOUNT}
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600 focus:outline-none"
                />

                <div className="flex justify-between text-[11px] text-slate-500 font-medium">
                  <span>Min : {formatEuro(MIN_AMOUNT)}</span>
                  <span>Pas : {formatEuro(STEP_AMOUNT)}</span>
                  <span>Max : {formatEuro(MAX_AMOUNT)}</span>
                </div>

                {/* Amount Quick Presets */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {amountPresets.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setAmount(preset)}
                      className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                        amount === preset
                          ? 'bg-blue-600 text-white shadow-xs font-bold'
                          : 'bg-white hover:bg-slate-200/80 text-slate-700 border border-slate-200'
                      }`}
                    >
                      {formatEuro(preset)}
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. Duration Selector (12 mois à 72 mois) */}
              <div className="space-y-3 mb-6 bg-slate-50/70 p-4 rounded-2xl border border-slate-200/70">
                <div className="flex items-center justify-between">
                  <label htmlFor="loan-duration-slider" className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    3. Durée du prêt (Min : 12 mois | Max : 72 mois)
                  </label>
                  <span className="font-extrabold text-blue-900 text-lg sm:text-xl">
                    {months} mois <span className="text-xs font-medium text-slate-500">({(months / 12).toFixed(1).replace('.0', '')} ans)</span>
                  </span>
                </div>

                {/* Range Slider (step 1 mois) */}
                <input
                  id="loan-duration-slider"
                  type="range"
                  min={MIN_MONTHS}
                  max={MAX_MONTHS}
                  step={STEP_MONTHS}
                  value={months}
                  onChange={(e) => setMonths(Number(e.target.value))}
                  className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600 focus:outline-none"
                />

                {/* Month Presets Buttons */}
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 pt-1">
                  {monthOptions.map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setMonths(m)}
                      className={`text-xs py-1.5 px-1 rounded-lg font-bold text-center transition-all cursor-pointer ${
                        months === m
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-white hover:bg-slate-200/70 text-slate-700 border border-slate-200'
                      }`}
                    >
                      {m} mois
                    </button>
                  ))}
                </div>
              </div>

              {/* Dynamic Result Panel */}
              <div className="bg-gradient-to-br from-blue-900 via-indigo-950 to-slate-900 rounded-2xl p-5 sm:p-6 text-white shadow-xl space-y-4 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10 relative z-10">
                  <div>
                    <span className="text-xs font-medium text-blue-200 block">Mensualité estimée</span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                        {formatEuro(includeInsurance ? calculation.monthlyTotalWithInsurance : calculation.monthlyPayment, 2)}
                      </span>
                      <span className="text-sm font-medium text-blue-200">/ mois</span>
                    </div>
                  </div>

                  <div className="sm:text-right bg-white/10 px-3.5 py-2 rounded-xl backdrop-blur-md border border-white/10">
                    <span className="text-[11px] uppercase tracking-wider text-blue-200 block font-semibold">Taux annuel appliqué (TAEG)</span>
                    <span className="text-xl font-black text-amber-400">{calculation.taeg.toFixed(2)} % / an</span>
                    <span className="text-[10px] block text-slate-300">Taux débiteur fixe : {calculation.nominalRate.toFixed(2)} %</span>
                  </div>
                </div>

                {/* Detailed financial metrics */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs text-slate-200 pt-1 relative z-10">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Coût total du crédit :</span>
                    <strong className="text-emerald-400 font-bold">{formatEuro(calculation.totalCost, 2)}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Montant total dû :</span>
                    <strong className="text-white font-bold">{formatEuro(calculation.totalDue, 2)}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Frais de dossier :</span>
                    <strong className="text-white font-bold">0,00 € (Offerts)</strong>
                  </div>
                </div>

                {/* Insurance Option Checkbox Toggle */}
                <div className="pt-2 border-t border-white/10 flex items-center justify-between gap-3 relative z-10">
                  <label htmlFor="insurance-toggle" className="flex items-center gap-2 cursor-pointer text-xs text-slate-300 hover:text-white transition-colors">
                    <input
                      id="insurance-toggle"
                      type="checkbox"
                      checked={includeInsurance}
                      onChange={(e) => setIncludeInsurance(e.target.checked)}
                      className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-white/30 bg-white/10 cursor-pointer"
                    />
                    <span>Inclure l'assurance facultative (+{formatEuro(calculation.insuranceMonthly, 2)}/mois)</span>
                  </label>
                  <span className="text-[11px] text-blue-300 hidden sm:inline">Protection Perte d'emploi / Décès</span>
                </div>
              </div>

              {/* Legal Representative Example Box */}
              <div className="mt-3.5 p-3 rounded-xl bg-slate-100 border border-slate-200/80 text-[11px] text-slate-600 leading-snug">
                <span className="font-bold text-slate-700">Exemple représentatif : </span>
                Pour un prêt de {formatEuro(calculation.capital)} sur {calculation.months} mois,
                vous remboursez {calculation.months} mensualités de {formatEuro(calculation.monthlyPayment, 2)}.
                Taux débiteur fixe de {calculation.nominalRate.toFixed(2)}%, soit un <strong>TAEG fixe de {calculation.taeg.toFixed(2)}%</strong>.
                Coût total du prêt : {formatEuro(calculation.totalCost, 2)}. Frais de dossier : 0 €. Montant total dû : {formatEuro(calculation.totalDue, 2)}.
              </div>

              {/* Primary Call-To-Action Button */}
              <div className="mt-5 space-y-2">
                <motion.button
                  whileHover={{ y: -2, boxShadow: '0 20px 35px -10px rgba(29, 78, 216, 0.35)' }}
                  whileTap={{ scale: 0.96 }}
                  transition={{ duration: 0.2, ease: masterEase }}
                  type="button"
                  id="cta-start-application"
                  onClick={() => onStartApplication(selectedProject, amount, months, includeInsurance)}
                  className="w-full py-4 px-6 bg-gradient-to-r from-blue-700 via-blue-800 to-indigo-800 hover:from-blue-800 hover:to-indigo-900 text-white font-extrabold text-base sm:text-lg rounded-2xl shadow-lg shadow-blue-700/25 transition-all flex items-center justify-center gap-2 group cursor-pointer"
                >
                  <span>Faire ma demande</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform" />
                </motion.button>
                <div className="flex items-center justify-center gap-4 text-xs font-medium text-slate-500 text-center">
                  <span>✓ Zéro Document à l'étape 1</span>
                  <span>•</span>
                  <span>✓ 100% sans engagement</span>
                  <span>•</span>
                  <span>✓ Réponse sous 24h/48h</span>
                </div>
              </div>
            </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

