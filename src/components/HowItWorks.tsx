import React from 'react';
import { motion } from 'motion/react';
import { Sliders, ClipboardCheck, CheckCircle2, ArrowRight, Sparkles, ShieldCheck, Zap, Smartphone } from 'lucide-react';
import { HOW_IT_WORKS_STEPS } from '../data';
import mobileAppProcess from '../assets/images/mobile-app-process.png';

const masterEase = [0.16, 1, 0.3, 1];

interface HowItWorksProps {
  onStartSimulation: () => void;
}

export const HowItWorks: React.FC<HowItWorksProps> = ({ onStartSimulation }) => {
  const getStepIcon = (idx: number) => {
    switch (idx) {
      case 0:
        return <Sliders className="w-5 h-5 text-blue-700" />;
      case 1:
        return <ClipboardCheck className="w-5 h-5 text-emerald-600" />;
      case 2:
      default:
        return <CheckCircle2 className="w-5 h-5 text-indigo-700" />;
    }
  };

  return (
    <section id="fonctionnement" className="py-16 sm:py-20 bg-white border-y border-slate-200 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 left-0 w-80 h-80 bg-sky-100/40 rounded-full blur-3xl -translate-y-1/2 pointer-events-none -z-10" />
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-blue-100/40 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto mb-14 space-y-3"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold uppercase tracking-wider shadow-xs">
            <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
            <span>Processus 100% digitalisé sur mobile & web</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Comment obtenir votre prêt chez R-Financial ?
          </h2>
          <p className="text-slate-600 text-base sm:text-lg">
            Oubliez la paperasse et les rendez-vous en agence. Tout se passe directement sur votre écran en 3 étapes simples et fluides.
          </p>
        </motion.div>

        {/* 2-Column Presentation: Image 2 3D Illustration on Left + 3 Interactive Steps on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          {/* Left Column: Image 2 (Full, clean, unmodified as sent) */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.85, ease: masterEase }}
            className="lg:col-span-5 relative"
          >
            <div className="mx-auto max-w-md lg:max-w-none flex justify-center items-center p-1 sm:p-2">
              {/* Unmodified image presentation: pure, natural aspect ratio, no badges or text overlays on top */}
              <img
                src={mobileAppProcess}
                onError={(e) => {
                  const target = e.currentTarget;
                  if (!target.dataset.tried1) {
                    target.dataset.tried1 = 'true';
                    target.src = '/image-2.png';
                  } else if (!target.dataset.tried2) {
                    target.dataset.tried2 = 'true';
                    target.src = '/image 2.png';
                  }
                }}
                alt="Processus 100% digitalisé R-Financial group"
                referrerPolicy="no-referrer"
                className="w-full max-h-[460px] object-contain block mx-auto drop-shadow-sm"
              />
            </div>
          </motion.div>

          {/* Right Column: The 3 Structured Steps with Animated Connecting Line (from PDF Art Direction Section 3) */}
          <div className="lg:col-span-7 relative">
            {/* Connecting progress line */}
            <motion.div
              initial={{ scaleY: 0 }}
              whileInView={{ scaleY: 1 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 1.1, ease: masterEase }}
              style={{ transformOrigin: 'top' }}
              className="absolute left-[34px] top-12 bottom-20 w-0.5 bg-gradient-to-b from-blue-600 via-indigo-500 to-emerald-500 hidden sm:block pointer-events-none"
            />

            <div className="space-y-4 relative z-10">
              {HOW_IT_WORKS_STEPS.map((step, idx) => (
                <motion.div
                  key={step.step}
                  initial={{ opacity: 0, x: 25 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.15 }}
                  transition={{ duration: 0.8, delay: idx * 0.12, ease: masterEase }}
                  whileHover={{ scale: 1.01, x: 4 }}
                  className="relative bg-slate-50/90 hover:bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 hover:border-blue-400 hover:shadow-md transition-all flex items-start gap-4 sm:gap-5 group cursor-default"
                >
                  {/* Step indicator */}
                  <div className="p-3 bg-white group-hover:bg-blue-50 rounded-2xl shadow-xs border border-slate-200/80 group-hover:border-blue-200 shrink-0 transition-colors">
                    {getStepIcon(idx)}
                  </div>

                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="text-base sm:text-lg font-extrabold text-slate-900 group-hover:text-blue-700 transition-colors">
                        {step.title}
                      </h3>
                      <motion.span
                        initial={{ scale: 0.8, opacity: 0 }}
                        whileInView={{ scale: [0.8, 1.18, 1], opacity: 1 }}
                        viewport={{ once: true, amount: 0.15 }}
                        transition={{ duration: 0.6, delay: idx * 0.15 + 0.35, ease: masterEase }}
                        className="text-2xl sm:text-3xl font-black text-slate-200 group-hover:text-blue-200 transition-colors select-none"
                      >
                        {step.step}
                      </motion.span>
                    </div>

                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                      {step.desc}
                    </p>

                    <div className="pt-2 flex items-center gap-2 text-xs font-bold text-blue-700">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                      <span>{step.highlight}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Bottom Action CTA */}
            <div className="pt-5">
              <motion.button
                whileHover={{ y: -2, boxShadow: '0 20px 30px -10px rgba(29, 78, 216, 0.35)' }}
                whileTap={{ scale: 0.96 }}
                transition={{ duration: 0.2, ease: masterEase }}
                type="button"
                onClick={onStartSimulation}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 bg-blue-700 hover:bg-blue-800 text-white font-extrabold text-sm sm:text-base rounded-2xl shadow-lg shadow-blue-700/20 hover:shadow-xl transition-all cursor-pointer"
              >
                <span>Lancer ma simulation express</span>
                <ArrowRight className="w-4 h-4" />
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
