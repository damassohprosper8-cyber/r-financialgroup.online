import React from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, MessageSquare } from 'lucide-react';
import { REVIEWS } from '../data';
import { formatEuro } from '../utils/loanCalculator';

const masterEase = [0.16, 1, 0.3, 1];

export const CustomerReviews: React.FC = () => {
  return (
    <section id="avis" className="py-16 bg-slate-50 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.8, ease: masterEase }}
          className="flex flex-col lg:flex-row items-center justify-between gap-8 mb-12 bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/90 shadow-sm"
        >
          <div className="space-y-2 text-center lg:text-left">
            <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">Témoignages récents</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Ils ont financé leur projet avec R-Financial group
            </h2>
            <p className="text-slate-600 text-sm">
              Découvrez les retours d'expérience de particuliers ayant concrétisé leurs projets grâce à nos offres de crédit.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-blue-50/70 px-5 py-3.5 rounded-xl border border-blue-100 text-blue-900 shrink-0">
            <MessageSquare className="w-5 h-5 text-blue-700" />
            <span className="text-xs font-bold">Des retours authentiques d'emprunteurs accompagnés</span>
          </div>
        </motion.div>

        {/* Reviews Cards with staggered entrance and subtle levitation */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {REVIEWS.map((rev, idx) => (
            <motion.div
              key={rev.id}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 0.8, delay: idx * 0.08, ease: masterEase }}
              whileHover={{ y: -4, boxShadow: '0 16px 30px -8px rgba(0, 0, 0, 0.07)' }}
              className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between hover:border-blue-200 transition-all cursor-default"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">
                    Projet financé
                  </span>
                  <span className="text-[11px] text-slate-400">{rev.date}</span>
                </div>

                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed italic">
                  "{rev.comment}"
                </p>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1">
                    {rev.author}
                    {rev.verified && (
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 inline" title="Emprunteur vérifié" />
                    )}
                  </h4>
                  <span className="text-[11px] text-slate-400">{rev.city} • {rev.project} ({formatEuro(rev.amount)})</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
