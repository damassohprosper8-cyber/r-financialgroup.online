import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Shield, Mail, Menu, X, ArrowRight } from 'lucide-react';

interface HeaderProps {
  onOpenSimulator: () => void;
  onSecretAdminTrigger?: () => void;
  isBannerVisible?: boolean;
}

const masterEase = [0.16, 1, 0.3, 1];

export const Header: React.FC<HeaderProps> = ({
  onOpenSimulator,
  onSecretAdminTrigger,
  isBannerVisible = false,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [logoClicks, setLogoClicks] = useState(0);

  const handleLogoSecretClick = (e: React.MouseEvent) => {
    // Hidden discreet trigger: 3 rapid clicks on the logo triggers the admin back-office
    const newCount = logoClicks + 1;
    setLogoClicks(newCount);
    if (newCount >= 3) {
      setLogoClicks(0);
      if (onSecretAdminTrigger) {
        onSecretAdminTrigger();
      }
    }
    setTimeout(() => setLogoClicks(0), 1200);
  };

  return (
    <header
      className={`bg-white/85 backdrop-blur-xl border-b border-slate-200/80 sticky z-40 transition-all duration-500 ease-out ${
        isBannerVisible ? 'top-[33px] sm:top-[37px]' : 'top-0'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo with progressive fade-in & slight downward entrance */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: masterEase }}
            className="flex items-center gap-3"
          >
            <div
              onClick={handleLogoSecretClick}
              className="flex items-center gap-2.5 group cursor-pointer select-none"
              title="R-Financial group"
            >
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-700 via-blue-800 to-indigo-900 flex items-center justify-center text-white font-black text-2xl shadow-md shadow-blue-900/20 group-hover:scale-105 transition-transform">
                R
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-extrabold tracking-tight text-slate-900 flex items-center gap-1.5">
                  R-Financial <span className="text-blue-700 font-semibold">group</span>
                </span>
                <span className="text-[11px] font-medium text-slate-500 flex items-center gap-1">
                  <Shield className="w-3 h-3 text-emerald-600 inline" />
                  Financement direct & transparent
                </span>
              </div>
            </div>
          </motion.div>

          {/* Desktop Navigation with staggered subtle fade & downward slide */}
          <motion.nav
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: masterEase }}
            className="hidden lg:flex items-center gap-8 font-medium text-sm text-slate-600"
          >
            <a href="#simulateur" className="hover:text-blue-700 transition-colors">
              Simulateur
            </a>
            <a href="#types-prets" className="hover:text-blue-700 transition-colors">
              Nos Prêts
            </a>
            <a href="#fonctionnement" className="hover:text-blue-700 transition-colors">
              Comment ça marche
            </a>
            <a href="#avis" className="hover:text-blue-700 transition-colors">
              Avis clients
            </a>
            <a href="#faq" className="hover:text-blue-700 transition-colors">
              FAQ & Sécurité
            </a>
          </motion.nav>

          {/* Right Action Buttons with tactile micro-interactions */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: masterEase }}
            className="hidden sm:flex items-center gap-4"
          >
            <a
              href="mailto:contact@r-financialgroup.online"
              className="flex items-center gap-2 text-xs font-semibold text-slate-700 hover:text-blue-700 bg-slate-100/90 hover:bg-slate-200/80 px-3.5 py-2.5 rounded-xl transition-all duration-200 hover:-translate-y-0.5"
              title="Écrire à notre équipe"
            >
              <Mail className="w-3.5 h-3.5 text-blue-700" />
              <span>contact@r-financialgroup.online</span>
            </a>

            {/* Primary Pill Button with hover lift (-2px), diffuse shadow, and active spring scale (0.96) */}
            <motion.button
              whileHover={{ y: -2, boxShadow: '0 12px 24px -6px rgba(29, 78, 216, 0.3)' }}
              whileTap={{ scale: 0.96 }}
              transition={{ duration: 0.2, ease: masterEase }}
              onClick={onOpenSimulator}
              className="flex items-center gap-2 text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 active:bg-blue-900 px-5 py-2.5 rounded-xl shadow-md shadow-blue-700/20 transition-colors cursor-pointer"
            >
              <span>Simuler mon prêt</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </motion.button>
          </motion.div>

          {/* Mobile menu trigger */}
          <div className="flex sm:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors"
              aria-label="Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="sm:hidden border-t border-slate-200 bg-white px-5 py-6 space-y-4 shadow-xl animate-in slide-in-from-top duration-200">
          <div className="flex flex-col space-y-3 font-medium text-slate-700">
            <a
              href="#simulateur"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 hover:text-blue-700 flex items-center justify-between"
            >
              <span>Simulateur de prêt</span>
              <ArrowRight className="w-4 h-4 text-slate-400" />
            </a>
            <a
              href="#types-prets"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 hover:text-blue-700 flex items-center justify-between"
            >
              <span>Nos offres de prêt</span>
              <ArrowRight className="w-4 h-4 text-slate-400" />
            </a>
            <a
              href="#fonctionnement"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 hover:text-blue-700 flex items-center justify-between"
            >
              <span>Comment ça marche</span>
              <ArrowRight className="w-4 h-4 text-slate-400" />
            </a>
            <a
              href="#avis"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 hover:text-blue-700 flex items-center justify-between"
            >
              <span>Avis clients vérifiés</span>
              <ArrowRight className="w-4 h-4 text-slate-400" />
            </a>
            <a
              href="#faq"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 hover:text-blue-700 flex items-center justify-between"
            >
              <span>FAQ & Sécurité</span>
              <ArrowRight className="w-4 h-4 text-slate-400" />
            </a>
          </div>

          <div className="pt-4 border-t border-slate-100 flex flex-col gap-3">
            <a
              href="mailto:contact@r-financialgroup.online"
              className="flex items-center justify-center gap-2 w-full py-2.5 bg-slate-100 font-semibold text-slate-800 rounded-lg text-sm"
            >
              <Mail className="w-4 h-4 text-blue-700" />
              <span>contact@r-financialgroup.online</span>
            </a>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenSimulator();
              }}
              className="w-full py-3 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-lg text-sm shadow-md"
            >
              Obtenir mon offre en 3 minutes
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
