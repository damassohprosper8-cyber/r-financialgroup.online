import React from 'react';
import { motion } from 'motion/react';
import { Clock, ShieldCheck, CheckCircle2, Headphones } from 'lucide-react';
import { TRUST_PILLARS } from '../data';

const masterEase = [0.16, 1, 0.3, 1];

export const ReassuranceBand: React.FC = () => {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Clock':
        return <Clock className="w-6 h-6 text-blue-700" />;
      case 'ShieldCheck':
        return <ShieldCheck className="w-6 h-6 text-emerald-600" />;
      case 'Building2':
        return <CheckCircle2 className="w-6 h-6 text-indigo-600" />;
      case 'Star':
      default:
        return <Headphones className="w-6 h-6 text-blue-600" />;
    }
  };

  return (
    <section className="bg-white border-y border-slate-200 py-8 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {TRUST_PILLARS.map((pillar, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 0.8, delay: idx * 0.08, ease: masterEase }}
              whileHover={{ y: -3, scale: 1.015, boxShadow: '0 12px 25px -8px rgba(0, 0, 0, 0.06)' }}
              className="flex items-start gap-4 p-3.5 rounded-2xl hover:bg-slate-50/80 border border-transparent hover:border-slate-200/80 transition-all cursor-default"
            >
              <div className="p-3 bg-blue-50/70 text-blue-700 rounded-xl shrink-0 flex items-center justify-center shadow-xs border border-blue-100">
                {getIcon(pillar.icon)}
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-extrabold text-slate-900 tracking-tight">
                  {pillar.title}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {pillar.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
