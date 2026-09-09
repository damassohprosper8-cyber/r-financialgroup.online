import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, HelpCircle, Shield, Lock, FileText, CheckCircle2 } from 'lucide-react';
import { FAQ_ITEMS } from '../data';

const masterEase = [0.16, 1, 0.3, 1];

export const FaqSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFaq = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section id="faq" className="py-16 bg-white border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Column: Security & Compliance badge */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.8, ease: masterEase }}
            className="lg:col-span-5 space-y-6"
          >
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-800 text-xs font-bold uppercase tracking-wider">
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Des réponses claires à vos questions</span>
            </div>

            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Tout savoir sur votre prêt R-Financial
            </h2>

            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
              Souscrire un crédit en ligne doit être un acte serein, transparent et parfaitement encadré par la loi. Voici les réponses aux questions les plus fréquentes de nos clients.
            </p>

            {/* FinTech Security Guarantee Box */}
            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 space-y-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Shield className="w-4 h-4 text-blue-700" />
                <span>Nos engagements de sécurité bancaire</span>
              </h3>

              <div className="space-y-2.5 text-xs text-slate-600">
                <div className="flex items-start gap-2">
                  <Lock className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Cryptage SSL 256 bits :</strong> Vos données personnelles et financières sont strictement protégées selon les normes bancaires européennes.</span>
                </div>
                <div className="flex items-start gap-2">
                  <FileText className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Délai légal de rétractation :</strong> Vous disposez de 14 jours calendaires révolus à compter de la signature de l'offre pour changer d'avis sans pénalité.</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Conformité RGPD :</strong> Vos informations ne sont jamais revendues à des tiers et servent uniquement à l'étude de votre solvabilité.</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Column: FAQ Accordion with Staggered Entrance and Smooth Height Transition (from PDF Section 5) */}
          <div className="lg:col-span-7 space-y-3">
            {FAQ_ITEMS.map((item, idx) => {
              const isOpen = openIndex === idx;
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.15 }}
                  transition={{ duration: 0.6, delay: idx * 0.07, ease: masterEase }}
                  className={`rounded-2xl border transition-all overflow-hidden ${
                    isOpen ? 'border-blue-400 bg-blue-50/20 shadow-xs' : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => toggleFaq(idx)}
                    className="w-full text-left p-4 sm:p-5 flex items-center justify-between gap-4 font-bold text-slate-900 text-sm sm:text-base cursor-pointer"
                  >
                    <span>{item.question}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-500 shrink-0 transition-transform duration-300 ${
                        isOpen ? 'rotate-180 text-blue-700' : ''
                      }`}
                    />
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.35, ease: masterEase }}
                      >
                        <div className="px-4 sm:px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100/80">
                          {item.answer}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
