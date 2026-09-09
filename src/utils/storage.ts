import { LoanApplicationRecord, RateConfig, ApplicationStatus, StatusHistoryItem } from '../types';

const STORAGE_KEY_APPLICATIONS = 'rfg_loan_applications_v2';
const STORAGE_KEY_RATE_CONFIG = 'rfg_rate_config_v1';

// Default Rate Configuration according to PDF specification:
// Base rate is 2.00%, variable according to configurable tiers
export const DEFAULT_RATE_CONFIG: RateConfig = {
  baseRate: 2.00,
  tiers: [
    {
      id: 'tier-small-short',
      name: 'Petits montants court terme (≤ 15 000 €, ≤ 24 mois)',
      minAmount: 5000,
      maxAmount: 15000,
      minMonths: 12,
      maxMonths: 24,
      rateAdjustment: -0.15, // 1.85%
    },
    {
      id: 'tier-medium',
      name: 'Montants standards (15 001 € à 50 000 €)',
      minAmount: 15001,
      maxAmount: 50000,
      minMonths: 12,
      maxMonths: 60,
      rateAdjustment: 0.00, // 2.00%
    },
    {
      id: 'tier-large',
      name: 'Grands financements (50 001 € à 150 000 €)',
      minAmount: 50001,
      maxAmount: 150000,
      minMonths: 24,
      maxMonths: 72,
      rateAdjustment: 0.25, // 2.25%
    },
    {
      id: 'tier-prestige',
      name: 'Financements majeurs (> 150 000 €)',
      minAmount: 150001,
      maxAmount: 500000,
      minMonths: 36,
      maxMonths: 72,
      rateAdjustment: 0.40, // 2.40%
    },
  ],
};

// Initial applications list (empty: zero old or mock applications)
const INITIAL_DEMO_APPLICATIONS: LoanApplicationRecord[] = [];

/**
 * Get all applications from localStorage
 */
export function getStoredApplications(): LoanApplicationRecord[] {
  try {
    // Purge legacy v1 demo data if present
    if (typeof window !== 'undefined' && window.localStorage) {
      if (localStorage.getItem('rfg_loan_applications_v1')) {
        localStorage.removeItem('rfg_loan_applications_v1');
      }
    }
    const raw = typeof window !== 'undefined' && window.localStorage ? localStorage.getItem(STORAGE_KEY_APPLICATIONS) : null;
    if (!raw) {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(STORAGE_KEY_APPLICATIONS, JSON.stringify([]));
      }
      return [];
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * Save new loan application to database / storage
 */
export function saveLoanApplication(
  data: Omit<LoanApplicationRecord, 'id' | 'reference' | 'createdAt' | 'updatedAt' | 'history' | 'status'> & { reference?: string }
): LoanApplicationRecord {
  const apps = getStoredApplications();

  // Generate unique primary key format PR-2026-XXXX
  const year = 2026;
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const reference = data.reference || `PR-${year}-${randomSuffix}`;
  const now = new Date().toISOString();

  const newApp: LoanApplicationRecord = {
    ...data,
    id: `app-${Date.now()}-${randomSuffix}`,
    reference,
    createdAt: now,
    updatedAt: now,
    status: 'PENDING',
    history: [
      {
        id: `hist-${Date.now()}`,
        status: 'PENDING',
        changedAt: now,
        changedBy: 'Système (Formulaire Web)',
        comment: 'Nouvelle demande enregistrée par le prospect (Zéro Document)',
      },
    ],
  };

  const updatedApps = [newApp, ...apps];
  try {
    localStorage.setItem(STORAGE_KEY_APPLICATIONS, JSON.stringify(updatedApps));
  } catch (e) {
    console.error('Failed to persist loan application', e);
  }

  return newApp;
}

/**
 * Check if email already has an active loan application
 */
export function checkEmailExists(email: string): boolean {
  if (!email) return false;
  const cleanEmail = email.trim().toLowerCase();
  const apps = getStoredApplications();
  return apps.some((app) => app.email.trim().toLowerCase() === cleanEmail);
}

/**
 * Update application status with audit trail history
 */
export function updateApplicationStatus(
  reference: string,
  newStatus: ApplicationStatus,
  adminUser: string = 'admin_rfinancial',
  comment?: string
): LoanApplicationRecord | null {
  const apps = getStoredApplications();
  const index = apps.findIndex((a) => a.reference === reference);
  if (index === -1) return null;

  const now = new Date().toISOString();
  const historyItem: StatusHistoryItem = {
    id: `hist-${Date.now()}`,
    status: newStatus,
    changedAt: now,
    changedBy: adminUser,
    comment,
  };

  const updatedApp: LoanApplicationRecord = {
    ...apps[index],
    status: newStatus,
    updatedAt: now,
    history: [historyItem, ...(apps[index].history || [])],
  };

  apps[index] = updatedApp;
  try {
    localStorage.setItem(STORAGE_KEY_APPLICATIONS, JSON.stringify(apps));
  } catch (e) {
    console.error('Failed to update status', e);
  }

  return updatedApp;
}

/**
 * Add or update admin notes on an application
 */
export function addApplicationNote(reference: string, note: string): LoanApplicationRecord | null {
  const apps = getStoredApplications();
  const index = apps.findIndex((a) => a.reference === reference);
  if (index === -1) return null;

  const updatedApp: LoanApplicationRecord = {
    ...apps[index],
    notes: note,
    updatedAt: new Date().toISOString(),
  };

  apps[index] = updatedApp;
  try {
    localStorage.setItem(STORAGE_KEY_APPLICATIONS, JSON.stringify(apps));
  } catch (e) {
    console.error('Failed to save application note', e);
  }

  return updatedApp;
}

/**
 * Delete an application record (Back-Office)
 */
export function deleteApplication(reference: string): boolean {
  const apps = getStoredApplications();
  const filtered = apps.filter((a) => a.reference !== reference);
  if (filtered.length === apps.length) return false;

  try {
    localStorage.setItem(STORAGE_KEY_APPLICATIONS, JSON.stringify(filtered));
    fetch(`/api/loans-requests/${encodeURIComponent(reference)}`, { method: 'DELETE' }).catch(() => {});
    return true;
  } catch (e) {
    console.error('Failed to delete application', e);
    return false;
  }
}

/**
 * Clear all applications permanently from storage and server database
 */
export function clearAllApplications(): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem('rfg_loan_applications_v1');
      localStorage.setItem(STORAGE_KEY_APPLICATIONS, JSON.stringify([]));
    }
    fetch('/api/loans-requests', { method: 'DELETE' }).catch(() => {});
  } catch (e) {
    console.error('Failed to clear applications', e);
  }
}

/**
 * Reset applications list (clears all records)
 */
export function resetApplicationsToSeed(): LoanApplicationRecord[] {
  clearAllApplications();
  return [];
}

/**
 * Rate Grid Configuration (Back-Office)
 */
export function getStoredRateConfig(): RateConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_RATE_CONFIG);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_RATE_CONFIG, JSON.stringify(DEFAULT_RATE_CONFIG));
      return DEFAULT_RATE_CONFIG;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_RATE_CONFIG;
  }
}

export function saveRateConfig(config: RateConfig): void {
  try {
    localStorage.setItem(STORAGE_KEY_RATE_CONFIG, JSON.stringify(config));
    window.dispatchEvent(new Event('rate_config_updated'));
  } catch (e) {
    console.error('Failed to persist rate configuration', e);
  }
}

/**
 * Export applications to CSV format
 */
export function exportApplicationsToCsv(applications: LoanApplicationRecord[]): void {
  const headers = [
    'Référence',
    'Date de création',
    'Nom',
    'Prénom',
    'Email',
    'Téléphone',
    'Pays',
    'Situation Pro',
    'Revenus Nets (€)',
    'Charges (€)',
    'Montant Prêt (€)',
    'Durée (mois)',
    'TAEG (%)',
    'Mensualité (€)',
    'Taux Endettement (%)',
    'Reste à vivre (€)',
    'Statut',
  ];

  const rows = applications.map((app) => [
    `"${app.reference}"`,
    `"${new Date(app.createdAt).toLocaleString('fr-FR')}"`,
    `"${app.lastName}"`,
    `"${app.firstName}"`,
    `"${app.email}"`,
    `"${app.phoneCountryCode} ${app.phone}"`,
    `"${app.country}"`,
    `"${app.professionalSituation}"`,
    app.monthlyIncome,
    app.monthlyExpenses,
    app.amount,
    app.months,
    app.taeg,
    app.monthlyPayment,
    app.debtRatio.toFixed(1),
    app.remainingIncome.toFixed(0),
    `"${app.status}"`,
  ]);

  const csvContent = '\uFEFF' + [headers.join(';'), ...rows.map((r) => r.join(';'))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `demandes_prets_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export const exportApplicationsToCSV = exportApplicationsToCsv;

