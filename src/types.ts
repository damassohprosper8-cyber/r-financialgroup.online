export type ProjectType = 'auto' | 'travaux' | 'perso' | 'rachat' | 'imprevu' | 'eco';

export interface ProjectOption {
  id: ProjectType;
  title: string;
  shortName: string;
  iconName: string;
  description: string;
  minAmount: number;
  maxAmount: number;
  defaultAmount: number;
  minMonths: number;
  maxMonths: number;
  defaultMonths: number;
  baseRate: number; // Annual base nominal rate
  popularBadge?: string;
}

export interface LoanCalculation {
  capital: number;
  months: number;
  nominalRate: number; // annual in %
  taeg: number; // Annual percentage rate in %
  monthlyPayment: number;
  insuranceMonthly: number;
  monthlyTotalWithInsurance: number;
  totalCost: number;
  totalDue: number;
  totalInsurance: number;
  applicationFee: number;
}

export interface ReviewItem {
  id: string;
  author: string;
  city: string;
  rating: number;
  date: string;
  amount: number;
  project: string;
  comment: string;
  verified: boolean;
}

export interface FaqItem {
  question: string;
  answer: string;
  category: string;
}

export type ApplicationStatus =
  | 'PENDING'
  | 'PRE_APPROVED'
  | 'REJECTED'
  | 'FUNDED'
  | 'Nouveau'
  | 'En attente de pièces'
  | 'Analyse en cours'
  | 'Accepté'
  | 'Refusé'
  | 'Archivé';

export interface StatusHistoryItem {
  id: string;
  status: ApplicationStatus;
  changedAt: string; // ISO string
  changedBy: string; // Admin username/id
  comment?: string;
}

export interface LoanApplicationRecord {
  id: string;
  reference: string; // Format PR-YYYY-XXXX
  createdAt: string; // ISO string
  updatedAt: string;

  // Personal Info
  firstName: string;
  lastName: string;
  email: string;
  phoneCountryCode: string; // e.g. "+33"
  phone: string;
  country: string; // Pays de résidence

  // Financial Info
  professionalSituation: string; // Salarié, Indépendant, Retraité, Sans emploi, etc.
  monthlyIncome: number; // Revenus nets mensuels (€)
  monthlyExpenses: number; // Charges mensuelles / Crédits en cours (€)
  termsAccepted: boolean; // RGPD / Consentement

  // Simulation Parameters
  project: ProjectType;
  amount: number;
  months: number;
  withInsurance: boolean;
  taeg: number;
  monthlyPayment: number;
  totalCost: number;
  totalDue: number;

  // Auto-calculated Financial Indicators (Back-Office)
  debtRatio: number; // Taux d'endettement (%)
  remainingIncome: number; // Reste à vivre (€)

  // Status & Management
  status: ApplicationStatus;
  history: StatusHistoryItem[];
  notes?: string;
}

export interface RateGridTier {
  id: string;
  name: string;
  minAmount: number;
  maxAmount: number;
  minMonths: number;
  maxMonths: number;
  rateAdjustment: number; // in % added to base rate (e.g. +0.25 or -0.20)
}

export type RateTier = RateGridTier;

export interface RateConfig {
  baseRate: number; // Default 2.00%
  tiers: RateGridTier[];
}

