import React, { useState } from 'react';
import { Shield, Mail, MapPin, Lock } from 'lucide-react';

interface FooterProps {
  onSecretAdminTrigger?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onSecretAdminTrigger }) => {
  const [clickCount, setClickCount] = useState(0);

  const handleSecretTrigger = () => {
    const next = clickCount + 1;
    setClickCount(next);
    if (next >= 3) {
      setClickCount(0);
      if (onSecretAdminTrigger) {
        onSecretAdminTrigger();
      }
    }
    setTimeout(() => setClickCount(0), 1500);
  };

  return (
    <footer className="bg-slate-900 text-slate-300 pt-12 pb-8 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Top Legal Warning Box in Footer */}
        <div className="p-4 rounded-xl bg-[#f7fafe] border border-blue-200/80 text-xs sm:text-sm font-semibold text-center leading-relaxed">
          <strong className="font-mono not-italic no-underline text-[#3048ff]">
            UN CRÉDIT VOUS ENGAGE ET DOIT ÊTRE REMBOURSÉ. VÉRIFIEZ VOS CAPACITÉS DE REMBOURSEMENT AVANT DE VOUS ENGAGER.
          </strong>
          <span className="block text-[11px] text-[#0017ff] font-normal mt-1">
            L'emprunteur dispose d'un délai légal de rétractation de 14 jours calendaires à compter de la date de la signature du contrat de crédit.
          </span>
        </div>

        {/* 4 Columns Navigation */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Column 1: Brand & Presentation */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black text-xl shadow-sm">
                R
              </div>
              <span className="text-xl font-extrabold text-white tracking-tight">
                R-Financial <span className="text-blue-400 font-semibold">group</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Plateforme dédiée au financement en ligne rapide, transparent et accessible. Simulation immédiate en temps réel, 0 € de frais de dossier et étude personnalisée.
            </p>
            <div className="pt-2 flex items-center gap-2 text-xs text-emerald-400 font-medium">
              <Shield className="w-4 h-4 shrink-0" />
              <span>Financement sécurisé & confidentiel</span>
            </div>
          </div>

          {/* Column 2: Nos Offres de Crédit */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">Nos Solutions de Financement</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li><a href="#simulateur" className="hover:text-white transition-colors">Prêt Personnel Sans Justificatif</a></li>
              <li><a href="#simulateur" className="hover:text-white transition-colors">Crédit Auto & Moto Neuf / Occasion</a></li>
              <li><a href="#simulateur" className="hover:text-white transition-colors">Prêt Travaux & Décoration</a></li>
              <li><a href="#simulateur" className="hover:text-white transition-colors">Crédit Éco-Rénovation Énergétique</a></li>
              <li><a href="#simulateur" className="hover:text-white transition-colors">Rachat et Regroupement de Crédits</a></li>
              <li><a href="#simulateur" className="hover:text-white transition-colors">Crédit Coup Dur Express</a></li>
            </ul>
          </div>

          {/* Column 3: Contact & Service Client */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">Contact & Support</h4>
            <div className="space-y-2.5 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-blue-400 shrink-0" />
                <a href="mailto:contact@r-financialgroup.online" className="text-white hover:text-blue-300 transition-colors">
                  contact@r-financialgroup.online
                </a>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <span>8 Rue Edmond De Goncourt, 94000 Créteil, France</span>
              </div>
            </div>
          </div>

          {/* Column 4: Sécurité & Confidentialité */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">Sécurité & Confidentialité</h4>
            <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700/80 space-y-2 text-xs">
              <div className="flex items-center gap-1.5 text-white font-semibold">
                <Lock className="w-3.5 h-3.5 text-emerald-400" />
                <span>Cryptage de données SSL 256 bits</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-normal">
                Données hébergées et traitées dans le respect strict du Règlement Général sur la Protection des Données (RGPD).
              </p>
            </div>
          </div>
        </div>

        {/* Detailed Legal Disclosures */}
        <div className="pt-8 border-t border-slate-800/80 text-[11px] text-slate-400 leading-relaxed space-y-2">
          <p>
            <strong>R-Financial group</strong> – Siège : 8 Rue Edmond De Goncourt, 94000 Créteil, France. Plateforme de mise en relation et de solutions de financement direct.
          </p>
          <p>
            Le prêt est accordé sous réserve d'acceptation définitive du dossier après étude de la solvabilité.
            Conformément aux dispositions légales, les taux et conditions affichés sont indicatifs et sont confirmés dans l'offre préalable de contrat remise à l'emprunteur.
          </p>
        </div>

        {/* Bottom bar */}
        <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div
            onClick={handleSecretTrigger}
            className="cursor-pointer select-none hover:text-slate-300 transition-colors"
            title="R-Financial group"
          >
            © {new Date().getFullYear()} R-Financial group. Tous droits réservés.
          </div>
          <div className="flex flex-wrap items-center gap-4 text-[11px]">
            <a href="#" className="hover:text-white transition-colors">Mentions Légales</a>
            <a href="#" className="hover:text-white transition-colors">Données Personnelles (RGPD)</a>
            <a href="#simulateur" className="hover:text-white transition-colors">Barème des Taux & TAEG</a>
            <a href="#" className="hover:text-white transition-colors">Gestion des Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
