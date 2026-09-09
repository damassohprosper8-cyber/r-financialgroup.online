import React from 'react';
import { motion } from 'motion/react';
import {
  Car,
  Hammer,
  Wallet,
  Leaf,
  RefreshCw,
  Zap,
  ArrowRight,
  ShieldCheck,
  Check,
  Mail
} from 'lucide-react';
import { ProjectType } from '../types';
import { PROJECT_OPTIONS } from '../data';
import { formatEuro } from '../utils/loanCalculator';

const masterEase = [0.16, 1, 0.3, 1];

interface LoanTypesGridProps {
  onSelectAndSimulate: (projectId: ProjectType) => void;
}

export const LoanTypesGrid: React.FC<LoanTypesGridProps> = ({ onSelectAndSimulate }) => {
  const getIcon = (id: ProjectType) => {
    switch (id) {
      case 'auto':
        return <Car className="w-5 h-5 text-blue-700" />;
      case 'travaux':
        return <Hammer className="w-5 h-5 text-amber-700" />;
      case 'eco':
        return <Leaf className="w-5 h-5 text-emerald-700" />;
      case 'rachat':
        return <RefreshCw className="w-5 h-5 text-purple-700" />;
      case 'imprevu':
        return <Zap className="w-5 h-5 text-rose-700" />;
      case 'perso':
      default:
        return <Wallet className="w-5 h-5 text-blue-800" />;
    }
  };

  const getAccentBg = (id: ProjectType) => {
    switch (id) {
      case 'auto':
        return 'bg-blue-100/70 text-blue-800';
      case 'travaux':
        return 'bg-amber-100/70 text-amber-900';
      case 'eco':
        return 'bg-emerald-100/70 text-emerald-900';
      case 'rachat':
        return 'bg-purple-100/70 text-purple-900';
      case 'imprevu':
        return 'bg-rose-100/70 text-rose-900';
      case 'perso':
      default:
        return 'bg-blue-100/70 text-blue-900';
    }
  };

  return (
    <section id="types-prets" className="py-16 bg-slate-50 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.8, ease: masterEase }}
          className="text-center max-w-3xl mx-auto mb-12 space-y-3"
        >
          {/* Pill badge with subtle central bounce (scale 0.8 to 1 from PDF Art Direction) */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-blue-100/70 text-blue-800 text-xs font-bold uppercase tracking-wider"
          >
            <span>Gamme complète de financements</span>
          </motion.div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Un crédit adapté à chacun de vos projets
          </h2>
          <p className="text-slate-600 text-base">
            Profitez de taux négociés au plus bas, sans frais de dossier et avec des conditions 100% transparentes.
          </p>
        </motion.div>

        {/* Grid of Bento Loan Offers */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {PROJECT_OPTIONS.map((item, idx) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 0.85, delay: idx * 0.09, ease: masterEase }}
              whileHover={{ y: -5, boxShadow: '0 20px 35px -10px rgba(0, 0, 0, 0.08)' }}
              className="bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:border-blue-400 transition-all p-6 flex flex-col justify-between group"
            >
              <div className="space-y-4">
                {/* Header card */}
                <div className="flex items-start justify-between">
                  <div className={`p-3 rounded-xl ${getAccentBg(item.id)}`}>
                    {getIcon(item.id)}
                  </div>
                  {item.popularBadge && (
                    <span className="text-[11px] font-extrabold bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-1 rounded-full">
                      {item.popularBadge}
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="text-lg font-extrabold text-slate-900 group-hover:text-blue-700 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1.5 leading-relaxed min-h-[36px]">
                    {item.description}
                  </p>
                </div>

                {/* Key Metrics */}
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 space-y-2 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Montant finançable :</span>
                    <strong className="text-slate-800 font-bold">
                      {formatEuro(item.minAmount)} à {formatEuro(item.maxAmount)}
                    </strong>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Durée possible :</span>
                    <strong className="text-slate-800 font-bold">
                      {item.minMonths} à {item.maxMonths} mois
                    </strong>
                  </div>
                  <div className="flex justify-between items-center pt-1 border-t border-slate-200/60">
                    <span className="text-slate-500">Taux indicatif :</span>
                    <strong className="text-blue-700 font-extrabold">
                      Dès {item.baseRate}% TAEG fixe
                    </strong>
                  </div>

                  {/* Visual Progress Bar that fills ONLY after card finishes entrance (from PDF Art Direction Section 2) */}
                  <div className="pt-1.5">
                    <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                      <span>Capacité d'octroi immédiate</span>
                      <span className="text-emerald-600 font-bold">Éligible</span>
                    </div>
                    <div className="w-full bg-slate-200/80 h-1.5 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${70 + (idx * 5) % 25}%` }}
                        viewport={{ once: true, amount: 0.15 }}
                        transition={{ duration: 0.8, delay: idx * 0.09 + 0.45, ease: masterEase }}
                        className="h-full bg-emerald-500 rounded-full"
                      />
                    </div>
                  </div>
                </div>

                {/* Quick bullet points */}
                <ul className="space-y-1.5 text-xs text-slate-600">
                  <li className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>0 € de frais de dossier</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Réponse de principe sous 3 min</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Remboursement anticipé sans pénalité</span>
                  </li>
                </ul>
              </div>

              {/* Action */}
              <div className="mt-6 pt-4 border-t border-slate-100">
                <motion.button
                  whileHover={{ y: -2, boxShadow: '0 8px 18px -4px rgba(29, 78, 216, 0.25)' }}
                  whileTap={{ scale: 0.96 }}
                  transition={{ duration: 0.2, ease: masterEase }}
                  type="button"
                  onClick={() => onSelectAndSimulate(item.id)}
                  className="w-full py-2.5 px-4 bg-slate-900 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Simuler ce {item.title}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Reassurance Sub-block without phone */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mt-10 p-5 rounded-2xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/10 rounded-xl">
              <ShieldCheck className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h4 className="font-extrabold text-sm sm:text-base">Une question sur votre projet ou votre simulation ?</h4>
              <p className="text-xs text-blue-200">Notre équipe R-Financial group vous répond rapidement et en toute confidentialité.</p>
            </div>
          </div>
          <a
            href="mailto:contact@r-financialgroup.online"
            className="shrink-0 px-5 py-2.5 bg-white text-blue-900 hover:bg-blue-50 font-bold text-xs sm:text-sm rounded-xl transition-all shadow-sm flex items-center gap-2"
          >
            <Mail className="w-4 h-4 text-blue-700" />
            <span>contact@r-financialgroup.online</span>
          </a>
        </motion.div>
      </div>
    </section>
  );
};
