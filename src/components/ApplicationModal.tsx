import React, { useState, useMemo } from 'react';
import {
  X,
  CheckCircle2,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  Mail,
  Phone,
  User,
  Globe2,
  Briefcase,
  AlertTriangle,
  FileText,
  Clock,
  Send,
  ExternalLink,
  Copy,
  Info
} from 'lucide-react';
import { ProjectType, LoanApplicationRecord } from '../types';
import { PROJECT_OPTIONS, COUNTRY_LIST, PHONE_INDICATIVES, PROFESSIONAL_SITUATIONS } from '../data';
import {
  calculateLoan,
  formatEuro,
  getAnnualRate,
  calculateDebtRatio,
  calculateRemainingIncome
} from '../utils/loanCalculator';
import {
  saveLoanApplication,
  checkEmailExists
} from '../utils/storage';

interface ApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: ProjectType;
  amount: number;
  months: number;
  withInsurance: boolean;
  onRedirectToConfirmation?: (reference: string) => void;
}

export const ApplicationModal: React.FC<ApplicationModalProps> = ({
  isOpen,
  onClose,
  project,
  amount,
  months,
  withInsurance,
  onRedirectToConfirmation,
}) => {
  // Step 1: Formulaire de demande & Pré-éligibilité (Parcours Zéro Document)
  // Step 2: Confirmation / Thank You Page
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [emailDuplicateError, setEmailDuplicateError] = useState<string | null>(null);
  const [copiedRef, setCopiedRef] = useState<boolean>(false);
  const [showEmailPreview, setShowEmailPreview] = useState<'none' | 'client' | 'admin'>('none');

  // Form Fields per Section 2 Specs
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneCountryCode, setPhoneCountryCode] = useState('+33');
  const [phone, setPhone] = useState('');
  const [country, setCountry] = useState('France');
  const [professionalSituation, setProfessionalSituation] = useState(PROFESSIONAL_SITUATIONS[0]);
  const [monthlyIncome, setMonthlyIncome] = useState<number | ''>(3200);
  const [monthlyExpenses, setMonthlyExpenses] = useState<number | ''>(800);
  const [termsAccepted, setTermsAccepted] = useState(true);

  // Resulting persisted record
  const [savedRecord, setSavedRecord] = useState<LoanApplicationRecord | null>(null);

  const currentProject = useMemo(() => {
    return PROJECT_OPTIONS.find((p) => p.id === project) || PROJECT_OPTIONS[0];
  }, [project]);

  // Recalculate based on Back-Office rate
  const calc = useMemo(() => {
    const rate = getAnnualRate(amount, months);
    return calculateLoan(amount, months, project, withInsurance, rate);
  }, [amount, months, project, withInsurance]);

  if (!isOpen) return null;

  const handleEmailChange = (newEmail: string) => {
    setEmail(newEmail);
    if (emailDuplicateError) {
      setEmailDuplicateError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Validation de Prénom & Nom (alphabétique)
    const nameRegex = /^[A-Za-zÀ-ÖØ-öø-ÿ\s\-']+$/;
    if (!nameRegex.test(firstName.trim())) {
      alert('Veuillez renseigner un prénom valide (caractères alphabétiques uniquement).');
      return;
    }
    if (!nameRegex.test(lastName.trim())) {
      alert('Veuillez renseigner un nom valide (caractères alphabétiques uniquement).');
      return;
    }

    // 2. Contrôle d'unicité de l'adresse e-mail (Règle de gestion Section 2)
    if (checkEmailExists(email)) {
      setEmailDuplicateError(
        `Une demande de prêt est déjà enregistrée avec l'adresse e-mail ${email}. Un conseiller traite déjà votre dossier en direct.`
      );
      return;
    }

    // 3. Validation des montants financiers (min: 0 €)
    const incomeNum = Number(monthlyIncome) || 0;
    const expensesNum = Number(monthlyExpenses) || 0;

    setSubmitting(true);
    setEmailDuplicateError(null);

    // Calculs de solvabilité automatique côté Back-Office
    const monthlyPayment = withInsurance ? calc.monthlyTotalWithInsurance : calc.monthlyPayment;
    const debtRatio = calculateDebtRatio(expensesNum, monthlyPayment, incomeNum);
    const remainingIncome = calculateRemainingIncome(incomeNum, expensesNum, monthlyPayment);

    const payload = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
      phoneCountryCode,
      phone: phone.trim(),
      country,
      professionalSituation,
      monthlyIncome: incomeNum,
      monthlyExpenses: expensesNum,
      termsAccepted,
      project,
      amount,
      months,
      withInsurance,
      taeg: calc.taeg,
      monthlyPayment,
      totalCost: calc.totalCost,
      totalDue: calc.totalDue,
      debtRatio,
      remainingIncome,
    };

    let serverReference = '';

    try {
      // 1. Sauvegarde en BDD (loans_requests) et déclenchement de l'e-mail d'alerte
      const response = await fetch('/api/loans-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const json = await response.json();
        if (json && json.reference) {
          serverReference = json.reference;
        }
      }
    } catch (apiError) {
      console.warn('API /api/loans-requests call failed or offline mode:', apiError);
    }

    // 2. Synchronisation en stockage local (permet au Back-Office d'avoir la donnée immédiatement)
    const record = saveLoanApplication({
      ...payload,
      reference: serverReference || undefined,
    });

    const finalReference = serverReference || record.reference;

    setSavedRecord(record);
    setSubmitting(false);

    // 3. Redirection de l'utilisateur (Front-End) vers /confirmation (Section 4 du cahier des charges)
    if (onRedirectToConfirmation) {
      onRedirectToConfirmation(finalReference);
    } else {
      window.history.pushState({}, '', `/confirmation?ref=${encodeURIComponent(finalReference)}`);
      window.dispatchEvent(new PopStateEvent('popstate'));
      onClose();
    }
  };

  const handleCopyRef = () => {
    if (savedRecord) {
      navigator.clipboard.writeText(savedRecord.reference);
      setCopiedRef(true);
      setTimeout(() => setCopiedRef(false), 2000);
    }
  };

  const handleClose = () => {
    setIsSubmitted(false);
    setSubmitting(false);
    setEmailDuplicateError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6">
        {/* Modal Header */}
        <div className="bg-slate-900 text-white p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-700 to-indigo-800 flex items-center justify-center font-extrabold text-white text-lg shadow-md">
              R
            </div>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base flex items-center gap-2">
                Demande de prêt en ligne
                <span className="text-[10px] uppercase font-bold tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded">
                  Zéro Document
                </span>
              </h3>
              <p className="text-xs text-slate-300">
                {!isSubmitted ? 'Parcours simplifié de pré-éligibilité immédiate' : 'Confirmation de prise en charge'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 1. RAPPEL DES DONNÉES DU SIMULATEUR EN HAUT DU FORMULAIRE (Section 2 - Règle de gestion) */}
        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-4 sm:px-6">
          <div className="text-[11px] uppercase tracking-wider text-blue-200 font-bold mb-1.5 flex items-center justify-between">
            <span>Données de votre simulation</span>
            <span className="text-amber-300">Taux appliqué : {calc.taeg.toFixed(2)}% TAEG</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <div className="bg-white/10 p-2 rounded-lg backdrop-blur-xs">
              <span className="text-slate-300 block text-[10px]">Montant emprunté</span>
              <strong className="text-white text-sm font-extrabold">{formatEuro(amount)}</strong>
            </div>
            <div className="bg-white/10 p-2 rounded-lg backdrop-blur-xs">
              <span className="text-slate-300 block text-[10px]">Durée du crédit</span>
              <strong className="text-white text-sm font-extrabold">{months} mois</strong>
            </div>
            <div className="bg-white/10 p-2 rounded-lg backdrop-blur-xs">
              <span className="text-slate-300 block text-[10px]">Mensualité estimée</span>
              <strong className="text-emerald-300 text-sm font-extrabold">
                {formatEuro(withInsurance ? calc.monthlyTotalWithInsurance : calc.monthlyPayment, 2)}
                <span className="text-[10px] font-normal text-slate-200">/m</span>
              </strong>
            </div>
            <div className="bg-white/10 p-2 rounded-lg backdrop-blur-xs">
              <span className="text-slate-300 block text-[10px]">Coût total crédit</span>
              <strong className="text-white text-sm font-extrabold">{formatEuro(calc.totalCost, 2)}</strong>
            </div>
          </div>
        </div>

        {/* CONTENU PRINCIPAL : FORMULAIRE OU THANK YOU PAGE */}
        <div className="p-5 sm:p-7 max-h-[75vh] overflow-y-auto">
          {!isSubmitted ? (
            /* SECTION 2 : FORMULAIRE DE PRÉ-ÉLIGIBILITÉ SIMPLIFIÉ */
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Alerte Erreur d'unicité d'email */}
              {emailDuplicateError && (
                <div className="p-3.5 bg-amber-50 border border-amber-300 rounded-xl text-xs text-amber-900 flex items-start gap-2.5 animate-in shake duration-200">
                  <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-bold">Demande déjà enregistrée</p>
                    <p>{emailDuplicateError}</p>
                    <p className="text-[11px] text-amber-800">
                      Inutile de soumettre à nouveau. Consultez votre boîte e-mail ou contactez directement votre conseiller.
                    </p>
                  </div>
                </div>
              )}

              {/* Bloc Explicatif Zéro Document */}
              <div className="p-3 bg-blue-50/80 border border-blue-200 rounded-xl text-xs text-blue-900 flex items-center gap-2.5">
                <ShieldCheck className="w-5 h-5 text-blue-700 shrink-0" />
                <span>
                  <strong>Parcours Zéro Document :</strong> Aucune pièce d'identité ni bulletin de paie n'est exigé à cette étape. Renseignez simplement vos informations pour évaluer votre pré-éligibilité.
                </span>
              </div>

              {/* SOUS-SECTION 1 : IDENTITÉ DU CANDIDAT */}
              <div className="space-y-3 pt-1">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-blue-700" />
                  <span>1. Identité du candidat</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label htmlFor="first-name" className="text-xs font-semibold text-slate-700">
                      Prénom <span className="text-rose-600">*</span>
                    </label>
                    <input
                      id="first-name"
                      type="text"
                      required
                      placeholder="Ex: Alexandre"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full p-2.5 border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="last-name" className="text-xs font-semibold text-slate-700">
                      Nom <span className="text-rose-600">*</span>
                    </label>
                    <input
                      id="last-name"
                      type="text"
                      required
                      placeholder="Ex: Bernard"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full p-2.5 border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* SOUS-SECTION 2 : COORDONNÉES & CONTACT INTERNATIONAL */}
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-blue-700" />
                  <span>2. Coordonnées & Pays de résidence</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Email */}
                  <div className="space-y-1">
                    <label htmlFor="email" className="text-xs font-semibold text-slate-700">
                      Adresse E-mail <span className="text-rose-600">*</span>
                    </label>
                    <input
                      id="email"
                      type="email"
                      required
                      placeholder="alexandre.bernard@example.com"
                      value={email}
                      onChange={(e) => handleEmailChange(e.target.value)}
                      className="w-full p-2.5 border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    />
                  </div>

                  {/* Téléphone portable avec sélecteur d'indicatif pays international */}
                  <div className="space-y-1">
                    <label htmlFor="phone" className="text-xs font-semibold text-slate-700">
                      Téléphone portable <span className="text-rose-600">*</span>
                    </label>
                    <div className="flex gap-2">
                      <select
                        value={phoneCountryCode}
                        onChange={(e) => setPhoneCountryCode(e.target.value)}
                        className="w-28 p-2 border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-none bg-slate-50"
                        title="Indicatif pays"
                      >
                        {PHONE_INDICATIVES.map((item) => (
                          <option key={item.code + item.country} value={item.code}>
                            {item.flag} {item.code}
                          </option>
                        ))}
                      </select>
                      <input
                        id="phone"
                        type="tel"
                        required
                        placeholder="6 12 34 56 78"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="flex-1 p-2.5 border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Pays de résidence (liste déroulante internationale) */}
                <div className="space-y-1">
                  <label htmlFor="country-select" className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                    <Globe2 className="w-3.5 h-3.5 text-slate-500" />
                    <span>Pays de résidence <span className="text-rose-600">*</span></span>
                  </label>
                  <select
                    id="country-select"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    required
                    className="w-full p-2.5 border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-none bg-white"
                  >
                    {COUNTRY_LIST.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* SOUS-SECTION 3 : SITUATION PROFESSIONNELLE & FINANCIÈRE */}
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-blue-700" />
                  <span>3. Situation professionnelle et financière</span>
                </h4>

                {/* Situation professionnelle */}
                <div className="space-y-1">
                  <label htmlFor="pro-situation" className="text-xs font-semibold text-slate-700">
                    Situation professionnelle <span className="text-rose-600">*</span>
                  </label>
                  <select
                    id="pro-situation"
                    value={professionalSituation}
                    onChange={(e) => setProfessionalSituation(e.target.value)}
                    required
                    className="w-full p-2.5 border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-none bg-white"
                  >
                    {PROFESSIONAL_SITUATIONS.map((sit) => (
                      <option key={sit} value={sit}>
                        {sit}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Revenus nets mensuels */}
                  <div className="space-y-1">
                    <label htmlFor="monthly-income" className="text-xs font-semibold text-slate-700">
                      Revenus nets mensuels (€) <span className="text-rose-600">*</span>
                    </label>
                    <div className="relative">
                      <input
                        id="monthly-income"
                        type="number"
                        min={0}
                        step={50}
                        required
                        placeholder="Ex: 3000"
                        value={monthlyIncome}
                        onChange={(e) => setMonthlyIncome(e.target.value === '' ? '' : Number(e.target.value))}
                        className="w-full p-2.5 pr-8 border border-slate-300 rounded-lg text-xs font-bold text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                      />
                      <span className="absolute right-3 top-2.5 text-xs font-bold text-slate-400">€ / mois</span>
                    </div>
                  </div>

                  {/* Charges mensuelles / Crédits en cours */}
                  <div className="space-y-1">
                    <label htmlFor="monthly-expenses" className="text-xs font-semibold text-slate-700">
                      Charges mensuelles / Crédits en cours (€) <span className="text-rose-600">*</span>
                    </label>
                    <div className="relative">
                      <input
                        id="monthly-expenses"
                        type="number"
                        min={0}
                        step={50}
                        required
                        placeholder="Ex: 800"
                        value={monthlyExpenses}
                        onChange={(e) => setMonthlyExpenses(e.target.value === '' ? '' : Number(e.target.value))}
                        className="w-full p-2.5 pr-8 border border-slate-300 rounded-lg text-xs font-bold text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                      />
                      <span className="absolute right-3 top-2.5 text-xs font-bold text-slate-400">€ / mois</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* CASE À COCHER RGPD / CONDITIONS OBLIGATOIRE */}
              <div className="pt-2 border-t border-slate-200">
                <label htmlFor="rgpd-consent" className="flex items-start gap-2.5 cursor-pointer text-xs text-slate-600">
                  <input
                    id="rgpd-consent"
                    type="checkbox"
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                    required
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 mt-0.5"
                  />
                  <span>
                    J'autorise R-Financial group à traiter mes données pour l'analyse de ma demande de crédit et confirme avoir pris connaissance de la politique de confidentialité RGPD. <span className="text-rose-600 font-bold">*</span>
                  </span>
                </label>
              </div>

              {/* ACTION BUTTONS */}
              <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleClose}
                  className="w-full sm:w-auto px-4 py-2.5 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Annuler
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-blue-700 via-blue-800 to-indigo-800 hover:from-blue-800 hover:to-indigo-900 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-lg shadow-blue-700/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 transition-all"
                >
                  {submitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Transmission en cours...</span>
                    </>
                  ) : (
                    <>
                      <span>Valider ma demande de pré-éligibilité</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : (
            /* SECTION 3 : PAGE DE CONFIRMATION ("THANK YOU PAGE") */
            <div className="space-y-6 animate-in zoom-in-95 duration-200">
              <div className="text-center space-y-2">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-md">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 inline-block">
                  Demande enregistrée avec succès
                </span>
                <h3 className="text-2xl sm:text-3xl font-black text-slate-900">
                  Merci, {savedRecord?.firstName} !
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto">
                  Votre demande de pré-éligibilité a bien été prise en compte. Aucun compte n'a été créé, la suite des échanges se fait en direct avec votre conseiller.
                </p>
              </div>

              {/* Référence de Dossier Unique format PR-YYYY-[ID] */}
              <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-blue-950 text-white rounded-2xl p-5 border border-slate-700 shadow-xl space-y-3 text-center">
                <span className="text-xs text-blue-200 uppercase tracking-wider font-semibold block">
                  Votre référence de dossier unique
                </span>
                <div className="inline-flex items-center gap-3 bg-white/10 px-4 py-2 rounded-xl border border-white/20">
                  <span className="text-2xl sm:text-3xl font-mono font-black text-amber-400 tracking-wider">
                    {savedRecord?.reference}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyRef}
                    className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                    title="Copier la référence"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
                {copiedRef && (
                  <p className="text-xs text-emerald-400 font-semibold animate-in fade-in">
                    ✓ Référence copiée dans le presse-papier !
                  </p>
                )}
                <p className="text-xs text-slate-300 max-w-md mx-auto">
                  Conservez précieusement ce numéro. Il sera rappelé dans tous les échanges avec votre conseiller.
                </p>
              </div>

              {/* Étapes à venir (Section 3 Specs) */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-blue-700" />
                  <span>Prochaines étapes de votre dossier</span>
                </h4>
                <div className="space-y-2.5 text-xs text-slate-700">
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-800 font-bold flex items-center justify-center shrink-0 text-[11px]">
                      1
                    </span>
                    <div>
                      <strong>E-mail de confirmation immédiat :</strong> Nous venons d'envoyer le récapitulatif complet de votre demande à{' '}
                      <span className="font-semibold text-blue-800">{savedRecord?.email}</span>.
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-800 font-bold flex items-center justify-center shrink-0 text-[11px]">
                      2
                    </span>
                    <div>
                      <strong>Contact d'un conseiller sous 24h/48h :</strong> Un analyste de crédit dédié va étudier votre solvabilité et vous adresser votre accord de principe personnalisé.
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-800 font-bold flex items-center justify-center shrink-0 text-[11px]">
                      3
                    </span>
                    <div>
                      <strong>Finalisation simplifiée :</strong> Votre conseiller dédié vous guidera par e-mail pour la validation finale de votre offre et le virement de vos fonds sous 48h.
                    </div>
                  </div>
                </div>
              </div>

              {/* Aperçu interactif des e-mails déclenchés (Notification SMTP) */}
              <div className="border border-slate-200 rounded-xl p-4 bg-white space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Send className="w-3.5 h-3.5 text-blue-600" />
                    <span>Notifications automatiques déclenchées</span>
                  </span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setShowEmailPreview(showEmailPreview === 'client' ? 'none' : 'client')}
                      className={`text-[11px] px-2.5 py-1 rounded-md font-bold transition-all ${
                        showEmailPreview === 'client'
                          ? 'bg-blue-700 text-white'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      Aperçu E-mail Client
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowEmailPreview(showEmailPreview === 'admin' ? 'none' : 'admin')}
                      className={`text-[11px] px-2.5 py-1 rounded-md font-bold transition-all ${
                        showEmailPreview === 'admin'
                          ? 'bg-blue-700 text-white'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      Aperçu Alerte Admin
                    </button>
                  </div>
                </div>

                {/* Preview Template E-mail Client */}
                {showEmailPreview === 'client' && (
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-300 font-mono text-[11px] text-slate-800 space-y-2 animate-in fade-in duration-150">
                    <div className="text-xs font-bold text-blue-900 pb-1 border-b border-slate-200">
                      ✉️ Template E-mail Client • Notification SMTP
                    </div>
                    <div><strong>À :</strong> {savedRecord?.email}</div>
                    <div><strong>De :</strong> R-Financial Group &lt;contact@r-financialgroup.online&gt;</div>
                    <div><strong>Objet :</strong> Confirmation de votre demande de prêt - Dossier {savedRecord?.reference}</div>
                    <div><strong>Reply-To :</strong> contact@r-financialgroup.online</div>
                    <div className="p-3 bg-white border border-slate-200 rounded font-sans text-xs space-y-2 mt-2">
                      <p>Bonjour {savedRecord?.firstName} {savedRecord?.lastName},</p>
                      <p>Nous vous confirmons la bonne réception de votre demande de prêt en ligne sur la plateforme R-Financial group.</p>
                      <ul className="list-disc list-inside space-y-0.5 text-slate-700">
                        <li><strong>Référence de dossier :</strong> {savedRecord?.reference}</li>
                        <li><strong>Montant du projet :</strong> {formatEuro(savedRecord?.amount || 0)}</li>
                        <li><strong>Durée :</strong> {savedRecord?.months} mois</li>
                        <li><strong>Mensualité estimée :</strong> {formatEuro(savedRecord?.monthlyPayment || 0, 2)} / mois</li>
                        <li><strong>TAEG appliqué :</strong> {savedRecord?.taeg.toFixed(2)} %</li>
                      </ul>
                      <p>Un conseiller dédié analyse votre dossier et prendra contact avec vous sous 24h à 48h ouvrées. Pour toute question, vous pouvez répondre directement à cet e-mail.</p>
                      <p className="text-slate-500 text-[11px] pt-1 border-t border-slate-100">
                        Service Client R-Financial Group • contact@r-financialgroup.online • 8 Rue Edmond De Goncourt, 94000 Créteil, France
                      </p>
                    </div>
                  </div>
                )}

                {/* Preview Template E-mail Admin */}
                {showEmailPreview === 'admin' && (
                  <div className="bg-slate-900 text-slate-100 p-4 rounded-xl border border-slate-800 font-mono text-[11px] space-y-2 animate-in fade-in duration-150">
                    <div className="text-xs font-bold text-amber-400 pb-1 border-b border-slate-700">
                      🚨 Template E-mail Administrateur • Alerte "Nouvelle Demande"
                    </div>
                    <div><strong>Destinataire :</strong> r-financialgroup@outlook.fr</div>
                    <div><strong>Objet :</strong> [NOUVEAU DOSSIER] {savedRecord?.reference} - {savedRecord?.lastName} ({savedRecord?.country})</div>
                    <div className="p-3 bg-slate-800/80 rounded space-y-1.5 text-xs">
                      <p className="text-emerald-400 font-bold">Détail du candidat :</p>
                      <p>• Nom / Prénom : {savedRecord?.lastName} {savedRecord?.firstName}</p>
                      <p>• E-mail : {savedRecord?.email} | Tél : {savedRecord?.phoneCountryCode} {savedRecord?.phone}</p>
                      <p>• Pays : {savedRecord?.country} | Situation : {savedRecord?.professionalSituation}</p>
                      <p>• Revenus : {formatEuro(savedRecord?.monthlyIncome || 0)}/m | Charges : {formatEuro(savedRecord?.monthlyExpenses || 0)}/m</p>
                      <p className="text-amber-300 font-bold pt-1">Indicateurs financiers calculés :</p>
                      <p>• Mensualité prêt : {formatEuro(savedRecord?.monthlyPayment || 0, 2)} / mois</p>
                      <p>• Taux d'endettement théorique : <span className="text-amber-400 font-bold">{savedRecord?.debtRatio.toFixed(1)} %</span></p>
                      <p>• Reste à vivre estimé : <span className="text-emerald-400 font-bold">{formatEuro(savedRecord?.remainingIncome || 0)} / mois</span></p>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleClose}
                  className="w-full sm:w-auto px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-md transition-colors cursor-pointer"
                >
                  Retourner à l'accueil
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
