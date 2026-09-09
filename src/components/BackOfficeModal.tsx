import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  ShieldCheck,
  Search,
  Filter,
  Download,
  Settings,
  ListFilter,
  CheckCircle2,
  Clock,
  XCircle,
  TrendingUp,
  Percent,
  Calendar,
  User,
  Mail,
  Phone,
  Globe2,
  FileText,
  Save,
  Trash2,
  RefreshCw,
  Lock,
  Unlock,
  SlidersHorizontal,
  ChevronRight,
  AlertCircle
} from 'lucide-react';
import {
  LoanApplicationRecord,
  ApplicationStatus,
  RateConfig,
  RateTier
} from '../types';
import {
  getStoredApplications,
  updateApplicationStatus,
  addApplicationNote,
  deleteApplication,
  exportApplicationsToCSV,
  getStoredRateConfig,
  saveRateConfig,
  clearAllApplications,
  resetApplicationsToSeed
} from '../utils/storage';
import { formatEuro } from '../utils/loanCalculator';

interface BackOfficeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BackOfficeModal: React.FC<BackOfficeModalProps> = ({ isOpen, onClose }) => {
  // Security PIN state (Section 4 Specs: Authentification Back-Office)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [pinInput, setPinInput] = useState<string>('');
  const [pinError, setPinError] = useState<boolean>(false);

  // Active Tab
  const [activeTab, setActiveTab] = useState<'applications' | 'rates'>('applications');

  // Applications list and filter state
  const [applications, setApplications] = useState<LoanApplicationRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedApp, setSelectedApp] = useState<LoanApplicationRecord | null>(null);

  // Note editing state
  const [newNote, setNewNote] = useState<string>('');

  // Rate configuration state
  const [rateConfig, setRateConfig] = useState<RateConfig>(getStoredRateConfig());
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  // Reload applications from storage
  const reloadApplications = () => {
    const list = getStoredApplications();
    setApplications(list);
    if (selectedApp) {
      const refreshed = list.find((a) => a.id === selectedApp.id) || null;
      setSelectedApp(refreshed);
    }
  };

  useEffect(() => {
    if (isOpen) {
      reloadApplications();
      setRateConfig(getStoredRateConfig());
    }
  }, [isOpen]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Default demo passcode for compliance evaluation: "2026" or "admin"
    if (pinInput.trim() === '2026' || pinInput.trim().toLowerCase() === 'admin') {
      setIsAuthenticated(true);
      setPinError(false);
    } else {
      setPinError(true);
    }
  };

  // Status badge styling (Section 4 Specs: Code couleur visuel par statut)
  const getStatusBadge = (status: ApplicationStatus) => {
    switch (status) {
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
            <Clock className="w-3 h-3 text-amber-700" />
            En attente
          </span>
        );
      case 'PRE_APPROVED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-900 border border-blue-300">
            <CheckCircle2 className="w-3 h-3 text-blue-700" />
            Pré-approuvé
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-900 border border-rose-300">
            <XCircle className="w-3 h-3 text-rose-700" />
            Refusé
          </span>
        );
      case 'FUNDED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
            <CheckCircle2 className="w-3 h-3 text-emerald-700" />
            Financé
          </span>
        );
      default:
        return null;
    }
  };

  // Filtering applications
  const filteredApps = useMemo(() => {
    return applications.filter((app) => {
      const matchesSearch =
        app.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.country.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === 'ALL' || app.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [applications, searchTerm, statusFilter]);

  // Handle status update
  const handleUpdateStatus = (newStatus: ApplicationStatus) => {
    if (!selectedApp) return;
    updateApplicationStatus(selectedApp.id, newStatus, 'Opérateur Back-Office');
    reloadApplications();
  };

  // Handle add note
  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApp || !newNote.trim()) return;
    addApplicationNote(selectedApp.id, newNote.trim());
    setNewNote('');
    reloadApplications();
  };

  // Handle save rate config
  const handleSaveRateConfig = (e: React.FormEvent) => {
    e.preventDefault();
    saveRateConfig(rateConfig);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  // Handle clear all recorded applications
  const handleClearAll = () => {
    if (window.confirm('Voulez-vous supprimer définitivement toutes les demandes enregistrées ?')) {
      clearAllApplications();
      setSelectedApp(null);
      reloadApplications();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-6xl bg-white rounded-2xl shadow-2xl border border-slate-300 overflow-hidden my-4 flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="bg-slate-900 text-white p-4 sm:p-5 flex items-center justify-between shrink-0 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-700 flex items-center justify-center font-extrabold text-white text-lg shadow-md">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-sm sm:text-base">
                  Back-Office & Gestion des Demandes
                </h3>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-500/20 text-blue-300 border border-blue-400/30 px-2 py-0.5 rounded">
                  Espace Conseiller
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Pilotage des flux entrants, analyse de solvabilité et barème de taux 2026
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isAuthenticated && (
              <button
                type="button"
                onClick={() => setIsAuthenticated(false)}
                className="px-2.5 py-1 text-xs text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                title="Verrouiller la session"
              >
                <Lock className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Verrouiller</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="Fermer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* AUTHENTICATION GATE */}
        {!isAuthenticated ? (
          <div className="p-8 sm:p-12 flex flex-col items-center justify-center text-center max-w-md mx-auto space-y-5">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-200 text-blue-700 flex items-center justify-center shadow-inner">
              <Lock className="w-8 h-8" />
            </div>
            <div>
              <h4 className="text-xl font-black text-slate-900">Accès réservé aux conseillers</h4>
              <p className="text-xs text-slate-500 mt-1">
                Veuillez entrer le code d'accès administrateur pour déverrouiller la gestion des dossiers et le barème.
              </p>
            </div>

            <form onSubmit={handleLogin} className="w-full space-y-3">
              <div className="space-y-1 text-left">
                <label htmlFor="admin-pin" className="text-xs font-bold text-slate-700">
                  Code d'accès PIN
                </label>
                <input
                  id="admin-pin"
                  type="password"
                  autoFocus
                  placeholder="Code PIN (défaut : 2026 ou admin)"
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value)}
                  className="w-full p-3 border border-slate-300 rounded-xl text-center text-lg font-bold tracking-widest text-slate-900 focus:ring-2 focus:ring-blue-700 focus:outline-none"
                />
              </div>

              {pinError && (
                <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 font-semibold flex items-center justify-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-rose-600" />
                  <span>Code incorrect. Veuillez utiliser le code par défaut : 2026</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 bg-blue-700 hover:bg-blue-800 text-white font-extrabold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Unlock className="w-4 h-4" />
                <span>Déverrouiller l'Espace Conseiller</span>
              </button>
            </form>

            <div className="text-[11px] text-slate-400">
              Note : Code de démonstration : <strong className="text-slate-600">2026</strong> ou <strong className="text-slate-600">admin</strong>
            </div>
          </div>
        ) : (
          /* AUTHENTICATED WORKSPACE */
          <div className="flex flex-col flex-1 overflow-hidden">
            {/* Navigation Tabs */}
            <div className="bg-slate-100 px-4 sm:px-6 py-2.5 border-b border-slate-200 flex items-center justify-between shrink-0">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('applications')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
                    activeTab === 'applications'
                      ? 'bg-white text-blue-900 shadow-xs border border-slate-200'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Demandes de prêt ({applications.length})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('rates')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
                    activeTab === 'rates'
                      ? 'bg-white text-blue-900 shadow-xs border border-slate-200'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  <span>Barème & Taux ({rateConfig.baseRate.toFixed(2)}%)</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={exportApplicationsToCSV}
                  disabled={applications.length === 0}
                  className="px-3 py-1.5 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed border border-slate-300 text-slate-700 rounded-lg text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                  title="Exporter au format CSV"
                >
                  <Download className="w-3.5 h-3.5 text-blue-700" />
                  <span className="hidden sm:inline">Export CSV</span>
                </button>
                {applications.length > 0 && (
                  <button
                    type="button"
                    onClick={handleClearAll}
                    className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 rounded-lg text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                    title="Supprimer toutes les demandes enregistrées"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                    <span className="hidden sm:inline">Tout supprimer</span>
                  </button>
                )}
              </div>
            </div>

            {/* TAB 1: APPLICATIONS WORKSPACE */}
            {activeTab === 'applications' && (
              <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
                {/* Left pane: Applications List */}
                <div
                  className={`flex-1 flex flex-col border-r border-slate-200 overflow-hidden ${
                    selectedApp ? 'hidden md:flex' : 'flex'
                  }`}
                >
                  {/* Filters and search bar */}
                  <div className="p-3 sm:p-4 bg-white border-b border-slate-200 space-y-3 shrink-0">
                    <div className="flex flex-col sm:flex-row gap-2">
                      <div className="relative flex-1">
                        <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                        <input
                          type="text"
                          placeholder="Rechercher par référence, nom, pays..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                        />
                      </div>

                      {/* Status Filter */}
                      <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="p-2 border border-slate-300 rounded-lg text-xs font-bold text-slate-700 focus:ring-2 focus:ring-blue-600 focus:outline-none bg-white"
                      >
                        <option value="ALL">Tous les statuts ({applications.length})</option>
                        <option value="PENDING">En attente</option>
                        <option value="PRE_APPROVED">Pré-approuvé</option>
                        <option value="REJECTED">Refusé</option>
                        <option value="FUNDED">Financé</option>
                      </select>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                      <span>{filteredApps.length} dossier(s) affiché(s)</span>
                      <span>Tri : Plus récent en premier</span>
                    </div>
                  </div>

                  {/* List / Table of Applications */}
                  <div className="flex-1 overflow-y-auto divide-y divide-slate-200">
                    {filteredApps.length === 0 ? (
                      <div className="p-8 sm:p-12 text-center text-slate-500 text-xs flex flex-col items-center justify-center space-y-2">
                        <FileText className="w-8 h-8 text-slate-300 stroke-1" />
                        <p className="font-semibold text-slate-600">
                          {applications.length === 0
                            ? 'Aucune demande enregistrée.'
                            : 'Aucun dossier ne correspond aux critères de recherche.'}
                        </p>
                        <p className="text-[11px] text-slate-400 max-w-xs">
                          {applications.length === 0
                            ? 'Les futures demandes soumises via le simulateur apparaîtront automatiquement ici.'
                            : 'Essayez de modifier votre terme de recherche ou le filtre de statut.'}
                        </p>
                      </div>
                    ) : (
                      filteredApps.map((app) => {
                        const isSelected = selectedApp?.id === app.id;
                        return (
                          <div
                            key={app.id}
                            onClick={() => setSelectedApp(app)}
                            className={`p-3.5 sm:p-4 transition-all cursor-pointer flex items-center justify-between gap-3 ${
                              isSelected
                                ? 'bg-blue-50/90 border-l-4 border-l-blue-700'
                                : 'hover:bg-slate-50'
                            }`}
                          >
                            <div className="space-y-1 min-w-0 flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-mono font-bold text-xs text-blue-900 bg-blue-100/60 px-2 py-0.5 rounded">
                                  {app.reference}
                                </span>
                                {getStatusBadge(app.status)}
                                <span className="text-[11px] text-slate-500 font-medium">
                                  {new Date(app.createdAt).toLocaleDateString('fr-FR', {
                                    day: '2-digit',
                                    month: '2-digit',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}
                                </span>
                              </div>

                              <div className="flex items-center gap-2">
                                <span className="font-extrabold text-sm text-slate-900 truncate">
                                  {app.lastName} {app.firstName}
                                </span>
                                <span className="text-xs text-slate-400">•</span>
                                <span className="text-xs text-slate-600 font-medium truncate flex items-center gap-1">
                                  <Globe2 className="w-3 h-3 text-slate-400" />
                                  {app.country}
                                </span>
                              </div>

                              <div className="flex items-center gap-3 text-xs text-slate-600 pt-0.5">
                                <span>
                                  Prêt : <strong className="text-slate-900">{formatEuro(app.amount)}</strong> sur {app.months}m
                                </span>
                                <span>•</span>
                                <span>
                                  Mensualité : <strong className="text-blue-900">{formatEuro(app.monthlyPayment, 2)}</strong>
                                </span>
                                <span className="hidden sm:inline">•</span>
                                <span className="hidden sm:inline">
                                  Endettement :{' '}
                                  <strong
                                    className={
                                      app.debtRatio > 35 ? 'text-amber-700' : 'text-emerald-700'
                                    }
                                  >
                                    {app.debtRatio.toFixed(1)}%
                                  </strong>
                                </span>
                              </div>
                            </div>

                            <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Right pane: Fiche détaillée de la demande sélectionnée (Section 4 Specs) */}
                {selectedApp ? (
                  <div className="flex-1 bg-slate-50/50 flex flex-col overflow-y-auto p-4 sm:p-6 space-y-5">
                    {/* Header of Detail Pane */}
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setSelectedApp(null)}
                            className="md:hidden p-1 text-slate-500 hover:text-slate-900"
                          >
                            ← Retour
                          </button>
                          <span className="text-xs font-mono font-black text-blue-900 bg-blue-100 px-2.5 py-1 rounded-md">
                            {selectedApp.reference}
                          </span>
                          {getStatusBadge(selectedApp.status)}
                        </div>
                        <h4 className="text-lg font-black text-slate-900 mt-1">
                          {selectedApp.firstName} {selectedApp.lastName}
                        </h4>
                        <span className="text-xs text-slate-500">
                          Enregistré le {new Date(selectedApp.createdAt).toLocaleString('fr-FR')}
                        </span>
                      </div>

                      {/* Status Selector Dropdown */}
                      <div className="flex items-center gap-2">
                        <label htmlFor="status-select" className="text-xs font-bold text-slate-700">
                          Changer le statut :
                        </label>
                        <select
                          id="status-select"
                          value={selectedApp.status}
                          onChange={(e) => handleUpdateStatus(e.target.value as ApplicationStatus)}
                          className="p-2 border border-slate-300 rounded-lg text-xs font-bold text-slate-900 bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                        >
                          <option value="PENDING">🟡 En attente</option>
                          <option value="PRE_APPROVED">🔵 Pré-approuvé</option>
                          <option value="REJECTED">🔴 Refusé</option>
                          <option value="FUNDED">🟢 Financé</option>
                        </select>
                      </div>
                    </div>

                    {/* Financial Summary & Solvency KPI Grid (Section 2 & 4 Specs) */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
                        <span className="text-[11px] text-slate-500 block uppercase font-bold">
                          Montant du prêt
                        </span>
                        <strong className="text-base sm:text-lg font-black text-slate-900">
                          {formatEuro(selectedApp.amount)}
                        </strong>
                        <span className="text-[11px] text-slate-500 block">sur {selectedApp.months} mois</span>
                      </div>

                      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
                        <span className="text-[11px] text-slate-500 block uppercase font-bold">
                          Mensualité calculée
                        </span>
                        <strong className="text-base sm:text-lg font-black text-blue-900">
                          {formatEuro(selectedApp.monthlyPayment, 2)}
                        </strong>
                        <span className="text-[11px] text-slate-500 block">TAEG : {selectedApp.taeg.toFixed(2)}%</span>
                      </div>

                      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
                        <span className="text-[11px] text-slate-500 block uppercase font-bold">
                          Taux d'endettement
                        </span>
                        <strong
                          className={`text-base sm:text-lg font-black ${
                            selectedApp.debtRatio > 35 ? 'text-amber-700' : 'text-emerald-700'
                          }`}
                        >
                          {selectedApp.debtRatio.toFixed(1)} %
                        </strong>
                        <span className="text-[11px] text-slate-500 block">
                          {selectedApp.debtRatio > 35 ? '⚠️ Seuil usuel > 35%' : '✓ Solvable'}
                        </span>
                      </div>

                      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
                        <span className="text-[11px] text-slate-500 block uppercase font-bold">
                          Reste à vivre
                        </span>
                        <strong className="text-base sm:text-lg font-black text-slate-900">
                          {formatEuro(selectedApp.remainingIncome)}
                        </strong>
                        <span className="text-[11px] text-slate-500 block">par mois</span>
                      </div>
                    </div>

                    {/* Candidate Identity & Contact Details */}
                    <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
                      <h5 className="text-xs font-bold uppercase tracking-wider text-slate-800 border-b border-slate-100 pb-2 flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-blue-700" />
                        <span>Détails personnels & Coordonnées directes</span>
                      </h5>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div>
                          <span className="text-slate-400 block text-[11px]">E-mail du candidat :</span>
                          <a
                            href={`mailto:${selectedApp.email}?subject=Votre dossier R-Financial ${selectedApp.reference}`}
                            className="font-bold text-blue-700 hover:underline flex items-center gap-1 mt-0.5"
                          >
                            <Mail className="w-3.5 h-3.5" />
                            {selectedApp.email}
                          </a>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[11px]">Téléphone portable :</span>
                          <a
                            href={`tel:${selectedApp.phoneCountryCode}${selectedApp.phone}`}
                            className="font-bold text-slate-900 flex items-center gap-1 mt-0.5"
                          >
                            <Phone className="w-3.5 h-3.5 text-slate-400" />
                            {selectedApp.phoneCountryCode} {selectedApp.phone}
                          </a>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[11px]">Pays de résidence :</span>
                          <strong className="text-slate-800">{selectedApp.country}</strong>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[11px]">Situation professionnelle :</span>
                          <strong className="text-slate-800">{selectedApp.professionalSituation}</strong>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[11px]">Revenus mensuels déclarés :</span>
                          <strong className="text-slate-800">{formatEuro(selectedApp.monthlyIncome)} / mois</strong>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[11px]">Charges mensuelles déclarées :</span>
                          <strong className="text-slate-800">{formatEuro(selectedApp.monthlyExpenses)} / mois</strong>
                        </div>
                      </div>
                    </div>

                    {/* Internal Notes and Status History */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Status History (Horodatage automatique) */}
                      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
                        <h5 className="text-xs font-bold uppercase tracking-wider text-slate-800 border-b border-slate-100 pb-2 flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-blue-700" />
                          <span>Historique des statuts</span>
                        </h5>
                        <div className="space-y-2 text-xs">
                          {selectedApp.statusHistory?.map((h, i) => (
                            <div key={i} className="flex items-start gap-2 text-slate-600 border-l-2 border-blue-200 pl-2.5 py-0.5">
                              <div>
                                <span className="font-bold text-slate-800">
                                  {h.status === 'PENDING'
                                    ? 'En attente'
                                    : h.status === 'PRE_APPROVED'
                                    ? 'Pré-approuvé'
                                    : h.status === 'REJECTED'
                                    ? 'Refusé'
                                    : 'Financé'}
                                </span>{' '}
                                <span className="text-[11px] text-slate-400">
                                  ({new Date(h.changedAt).toLocaleString('fr-FR')})
                                </span>
                                {h.by && <span className="text-[11px] text-slate-500 block">Par : {h.by}</span>}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Internal Notes */}
                      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
                        <h5 className="text-xs font-bold uppercase tracking-wider text-slate-800 border-b border-slate-100 pb-2 flex items-center gap-1.5">
                          <FileText className="w-3.5 h-3.5 text-blue-700" />
                          <span>Notes internes de l'analyste</span>
                        </h5>

                        <div className="space-y-1.5 max-h-32 overflow-y-auto">
                          {selectedApp.notes && selectedApp.notes.length > 0 ? (
                            selectedApp.notes.map((n, i) => (
                              <div key={i} className="p-2 bg-slate-50 rounded text-xs text-slate-700">
                                {n}
                              </div>
                            ))
                          ) : (
                            <p className="text-xs text-slate-400 italic">Aucune note pour le moment.</p>
                          )}
                        </div>

                        <form onSubmit={handleAddNote} className="flex gap-2 pt-1">
                          <input
                            type="text"
                            placeholder="Ajouter un commentaire interne..."
                            value={newNote}
                            onChange={(e) => setNewNote(e.target.value)}
                            className="flex-1 p-2 border border-slate-300 rounded-lg text-xs text-slate-800 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                          />
                          <button
                            type="submit"
                            className="px-3 py-2 bg-blue-700 text-white rounded-lg text-xs font-bold hover:bg-blue-800 transition-colors cursor-pointer"
                          >
                            Ajouter
                          </button>
                        </form>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="hidden md:flex flex-1 items-center justify-center text-center p-8 text-slate-400 text-xs">
                    Sélectionnez une demande dans la liste pour consulter sa fiche détaillée.
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: RATE CONFIGURATION (Section 4 Specs: Barème de taux) */}
            {activeTab === 'rates' && (
              <div className="p-5 sm:p-8 max-w-3xl mx-auto w-full overflow-y-auto space-y-6">
                <div>
                  <h4 className="text-lg font-black text-slate-900">
                    Configuration du barème d'intérêts (TAEG)
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Modifiez le taux de base et les paliers d'ajustement. Ces paramètres s'appliquent immédiatement au simulateur public sans rechargement.
                  </p>
                </div>

                {saveSuccess && (
                  <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-xs font-bold text-emerald-900 flex items-center gap-2 animate-in fade-in">
                    <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                    <span>Nouveau barème enregistré ! Le simulateur public est synchronisé instantanément.</span>
                  </div>
                )}

                <form onSubmit={handleSaveRateConfig} className="space-y-6">
                  {/* Taux de base global */}
                  <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <label htmlFor="base-rate" className="text-xs font-bold uppercase tracking-wider text-slate-800 block">
                          Taux d'intérêt de base (TAEG)
                        </label>
                        <span className="text-xs text-slate-500">
                          Taux standard appliqué par défaut (Spécifié à 2,00% par an dans le cahier des charges).
                        </span>
                      </div>

                      <div className="flex items-center gap-1 bg-slate-50 border border-slate-300 px-3 py-2 rounded-xl">
                        <input
                          id="base-rate"
                          type="number"
                          step="0.01"
                          min="0.5"
                          max="20"
                          required
                          value={rateConfig.baseRate}
                          onChange={(e) =>
                            setRateConfig({ ...rateConfig, baseRate: Number(e.target.value) })
                          }
                          className="w-20 text-right font-black text-blue-900 text-lg focus:outline-none bg-transparent"
                        />
                        <span className="font-bold text-slate-700 text-sm">%</span>
                      </div>
                    </div>
                  </div>

                  {/* Paliers de taux avancés */}
                  <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
                    <h5 className="text-xs font-bold uppercase tracking-wider text-slate-800 border-b border-slate-100 pb-2">
                      Paliers d'ajustement conditionnels (Montants & Durées)
                    </h5>

                    <div className="space-y-3">
                      {rateConfig.tiers.map((tier, idx) => (
                        <div
                          key={tier.id}
                          className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                        >
                          <div>
                            <span className="font-bold text-slate-800 block">{tier.label}</span>
                            <span className="text-[11px] text-slate-500">
                              {tier.minAmount > 0 && `Dès ${formatEuro(tier.minAmount)} `}
                              {tier.minMonths > 0 && `& Durée > ${tier.minMonths} mois`}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-xs text-slate-600 font-medium">Taux effectif :</span>
                            <div className="flex items-center gap-1 bg-white border border-slate-300 px-2.5 py-1 rounded-lg">
                              <input
                                type="number"
                                step="0.01"
                                value={tier.rate}
                                onChange={(e) => {
                                  const updatedTiers = [...rateConfig.tiers];
                                  updatedTiers[idx].rate = Number(e.target.value);
                                  setRateConfig({ ...rateConfig, tiers: updatedTiers });
                                }}
                                className="w-14 text-right font-bold text-blue-900 text-xs focus:outline-none"
                              />
                              <span className="font-bold text-slate-700">%</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                      type="submit"
                      className="px-6 py-3 bg-blue-700 hover:bg-blue-800 text-white font-extrabold text-xs rounded-xl shadow-md flex items-center gap-2 cursor-pointer transition-all"
                    >
                      <Save className="w-4 h-4" />
                      <span>Enregistrer et appliquer le nouveau barème</span>
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
