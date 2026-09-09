import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  Copy,
  Clock,
  ShieldCheck,
  ArrowLeft,
  Mail,
  FileCheck,
  Calendar,
  Sparkles
} from 'lucide-react';
import { motion } from 'motion/react';
import { formatEuro } from '../utils/loanCalculator';
import { getStoredApplications } from '../utils/storage';
import { LoanApplicationRecord } from '../types';

interface ConfirmationPageProps {
  onNavigateHome: () => void;
}

export const ConfirmationPage: React.FC<ConfirmationPageProps> = ({ onNavigateHome }) => {
  const [reference, setReference] = useState<string>('PR-2026-XXXX');
  const [copied, setCopied] = useState<boolean>(false);
  const [record, setRecord] = useState<LoanApplicationRecord | null>(null);

  useEffect(() => {
    // 1. Get reference from URL query params: /confirmation?ref=PR-2026-XXXX
    const params = new URLSearchParams(window.location.search);
    const refParam = params.get('ref') || params.get('reference');

    // 2. Look up stored record or recent request
    const stored = getStoredApplications();
    if (refParam) {
      setReference(refParam);
      const found = stored.find((item) => item.reference.toUpperCase() === refParam.toUpperCase());
      if (found) {
        setRecord(found);
      }
    } else if (stored.length > 0) {
      // Default to most recent record
      setReference(stored[0].reference);
      setRecord(stored[0]);
    }
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(reference);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-blue-50/30 to-slate-100 flex flex-col justify-between py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto w-full">
        {/* Navigation back */}
        <div className="mb-6 sm:mb-8">
          <button
            type="button"
            onClick={onNavigateHome}
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-blue-700 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Retour à l'accueil</span>
          </button>
        </div>

        {/* Main Confirmation Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-3xl border border-slate-200/90 shadow-xl overflow-hidden"
        >
          {/* Top Banner */}
          <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white p-6 sm:p-8 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.15, type: 'spring', stiffness: 200 }}
              className="w-20 h-20 rounded-full bg-emerald-500/20 text-emerald-400 border-2 border-emerald-500/40 flex items-center justify-center mx-auto mb-4 shadow-lg"
            >
              <CheckCircle2 className="w-12 h-12" />
            </motion.div>

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-bold uppercase tracking-wider mb-3">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Demande validée avec succès</span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white mb-2">
              Merci {record?.firstName ? `${record.firstName}` : ''} pour votre confiance !
            </h1>

            <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto leading-relaxed">
              Votre demande de financement a été enregistrée avec succès dans notre système sécurisé.
            </p>
          </div>

          {/* Dossier Reference Box (Specification Requirement) */}
          <div className="p-6 sm:p-8 space-y-6">
            <div className="bg-slate-50 border-2 border-dashed border-blue-200 rounded-2xl p-5 sm:p-6 text-center space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
                Votre référence de dossier unique
              </span>

              <div className="inline-flex items-center gap-3 bg-white px-5 py-3 rounded-xl border border-slate-300 shadow-xs">
                <span className="text-2xl sm:text-3xl font-mono font-extrabold text-blue-700 tracking-wider">
                  {reference}
                </span>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="p-2 rounded-lg bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 transition-colors cursor-pointer"
                  title="Copier la référence"
                  aria-label="Copier la référence de dossier"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>

              {copied && (
                <p className="text-xs text-emerald-600 font-bold animate-in fade-in">
                  ✓ Référence copiée dans le presse-papier
                </p>
              )}

              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Conservez ce numéro de référence. Il vous permettra de suivre l'avancement de votre dossier à tout moment.
              </p>
            </div>

            {/* Crucial Message: Processing within 24 to 48 hours */}
            <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-5 sm:p-6 flex items-start gap-4 shadow-xs">
              <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md">
                <Clock className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-extrabold text-slate-900">
                  Un conseiller traitera votre dossier sous 24 à 48h
                </h3>
                <p className="text-sm text-slate-700 leading-relaxed">
                  Votre demande fait actuellement l'objet d'une analyse prioritaire par notre équipe.
                  Un conseiller dédié prendra contact avec vous directement par e-mail pour vous communiquer votre accord de principe et finaliser votre déblocage de fonds.
                </p>
              </div>
            </div>

            {/* Recap if record exists */}
            {record && (
              <div className="border border-slate-200 rounded-2xl p-5 bg-white space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100 pb-2 flex items-center justify-between">
                  <span>Récapitulatif de votre simulation</span>
                  <span className="text-blue-700 font-semibold">{record.reference}</span>
                </h4>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                    <span className="text-[11px] text-slate-500 block">Montant</span>
                    <span className="text-base font-bold text-slate-900">{formatEuro(record.amount)}</span>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                    <span className="text-[11px] text-slate-500 block">Durée</span>
                    <span className="text-base font-bold text-slate-900">{record.months} mois</span>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                    <span className="text-[11px] text-slate-500 block">Mensualité</span>
                    <span className="text-base font-bold text-blue-700">{formatEuro(record.monthlyPayment, 2)}/m</span>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                    <span className="text-[11px] text-slate-500 block">TAEG Fixe</span>
                    <span className="text-base font-bold text-emerald-600">{record.taeg.toFixed(2)} %</span>
                  </div>
                </div>

                <div className="text-xs text-slate-500 flex items-center gap-2 pt-1">
                  <Mail className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span>
                    Notification envoyée à : <strong className="text-slate-800">{record.email}</strong>
                  </span>
                </div>
              </div>
            )}

            {/* Zero document reminder & next steps */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                  <FileCheck className="w-4 h-4 text-blue-600" />
                  <span>Zéro justificatif</span>
                </div>
                <p className="text-[11px] text-slate-600">
                  Aucun document papier n'est demandé à ce stade. Tout se passe par voie électronique.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Sécurité bancaire</span>
                </div>
                <p className="text-[11px] text-slate-600">
                  Données chiffrées de bout en bout et protégées selon les normes RGPD européennes.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>0 € de frais de dossier</span>
                </div>
                <p className="text-[11px] text-slate-600">
                  Étude de solvabilité et prise en charge entièrement gratuites et sans engagement.
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={onNavigateHome}
                className="w-full sm:w-auto px-8 py-3.5 bg-blue-700 hover:bg-blue-800 text-white font-bold text-sm rounded-xl shadow-md transition-all cursor-pointer text-center"
              >
                Retourner à l'accueil
              </button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Footer copyright */}
      <footer className="mt-8 text-center text-xs text-slate-400">
        © 2026 R-Financial Group • Tous droits réservés • Établissement de crédit agréé
      </footer>
    </div>
  );
};
