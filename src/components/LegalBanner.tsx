import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertCircle } from 'lucide-react';

interface LegalBannerProps {
  isVisible?: boolean;
}

export const LegalBanner: React.FC<LegalBannerProps> = ({ isVisible }) => {
  const [internalVisible, setInternalVisible] = useState(true);

  useEffect(() => {
    if (isVisible !== undefined) return;
    const timer = setTimeout(() => {
      setInternalVisible(false);
    }, 5000);
    return () => clearTimeout(timer);
  }, [isVisible]);

  const show = isVisible !== undefined ? isVisible : internalVisible;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          id="legal-top-warning"
          initial={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="bg-[#5699f4] sticky top-0 z-50 overflow-hidden"
          role="banner"
        >
          <div className="py-2 px-4 shadow-sm border-b border-blue-400/40 text-slate-950 font-semibold text-xs sm:text-sm tracking-wide">
            <div className="max-w-7xl mx-auto flex items-center justify-center text-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-slate-950" />
              <span>
                <strong>UN CRÉDIT VOUS ENGAGE ET DOIT ÊTRE REMBOURSÉ.</strong> VÉRIFIEZ VOS CAPACITÉS DE REMBOURSEMENT AVANT DE VOUS ENGAGER.
              </span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
