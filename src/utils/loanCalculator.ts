import { LoanCalculation, ProjectType, RateConfig } from '../types';
import { getStoredRateConfig } from './storage';

/**
 * Détermine le taux d'intérêt annuel (TAEG) en fonction de la grille paramétrable du Back-Office
 * Taux annuel de base fixable à 2,00%, ajustable selon tranches de montants et de durées
 */
export function getAnnualRate(
  amount: number,
  months: number,
  config?: RateConfig
): number {
  const rateConfig = config || getStoredRateConfig();
  let rate = rateConfig.baseRate; // 2.00% par défaut

  // Parcourir les paliers paramétrables
  if (rateConfig.tiers && rateConfig.tiers.length > 0) {
    const matchedTier = rateConfig.tiers.find(
      (tier) =>
        amount >= tier.minAmount &&
        amount <= tier.maxAmount &&
        months >= tier.minMonths &&
        months <= tier.maxMonths
    );

    if (matchedTier) {
      rate += matchedTier.rateAdjustment;
    } else {
      // Si aucun palier exact ne correspond, trouver le palier de montant le plus proche
      const amountTier = rateConfig.tiers.find(
        (tier) => amount >= tier.minAmount && amount <= tier.maxAmount
      );
      if (amountTier) {
        rate += amountTier.rateAdjustment;
      }
    }
  }

  // Plancher minimum de sécurité à 0.50%
  return Math.max(0.5, Number(rate.toFixed(2)));
}

/**
 * Calcule les mensualités et le coût du crédit selon la formule exacte du Cahier des Charges :
 * M = P * (r * (1 + r)^n) / ((1 + r)^n - 1)
 * où P = Montant du capital, r = Taux mensuel, n = Nombre de mensualités.
 */
export function calculateLoan(
  capital: number,
  months: number,
  _projectType?: ProjectType,
  includeInsurance: boolean = false,
  customAnnualRate?: number
): LoanCalculation {
  // Frais de dossier chez R-Financial group : 0 € (offre 100% sans frais)
  const applicationFee = 0;

  // Déterminer le taux annuel (TAEG) via la grille dynamique si non spécifié
  const nominalRate = customAnnualRate !== undefined ? customAnnualRate : getAnnualRate(capital, months);
  const taeg = nominalRate;

  // Taux d'intérêt mensuel (r)
  const monthlyRate = (nominalRate / 100) / 12;

  let monthlyPayment = 0;
  if (monthlyRate <= 0) {
    monthlyPayment = capital / months;
  } else {
    // Formule standard d'amortissement à annuité constante spécifiée dans le PDF :
    // M = P * [r(1 + r)^n] / [(1 + r)^n - 1]
    const factor = Math.pow(1 + monthlyRate, months);
    monthlyPayment = capital * ((monthlyRate * factor) / (factor - 1));
  }

  // Assurance emprunteur facultative (0.03% du capital par mois)
  const insuranceMonthly = Math.round(capital * 0.0003 * 100) / 100;
  const totalInsurance = insuranceMonthly * months;

  const totalWithoutInsurance = monthlyPayment * months;
  const totalCost = totalWithoutInsurance - capital + applicationFee;
  const totalDue = totalWithoutInsurance + (includeInsurance ? totalInsurance : 0);

  return {
    capital,
    months,
    nominalRate,
    taeg,
    monthlyPayment: Math.round(monthlyPayment * 100) / 100,
    insuranceMonthly,
    monthlyTotalWithInsurance: Math.round((monthlyPayment + insuranceMonthly) * 100) / 100,
    totalCost: Math.max(0, Math.round(totalCost * 100) / 100),
    totalDue: Math.round(totalDue * 100) / 100,
    totalInsurance: Math.round(totalInsurance * 100) / 100,
    applicationFee,
  };
}

/**
 * Calcul automatique du Taux d'Endettement théorique (Back-Office) :
 * Taux d'endettement = ((Charges mensuelles + Mensualité estimée du prêt) / Revenus nets mensuels) * 100
 */
export function calculateDebtRatio(
  monthlyExpenses: number,
  monthlyPayment: number,
  monthlyIncome: number
): number {
  if (!monthlyIncome || monthlyIncome <= 0) return 100;
  const ratio = ((monthlyExpenses + monthlyPayment) / monthlyIncome) * 100;
  return Math.round(ratio * 10) / 10;
}

/**
 * Calcul automatique du Reste à vivre estimé (Back-Office) :
 * Reste à vivre = Revenus nets mensuels - Charges mensuelles - Mensualité estimée
 */
export function calculateRemainingIncome(
  monthlyIncome: number,
  monthlyExpenses: number,
  monthlyPayment: number
): number {
  const remaining = monthlyIncome - monthlyExpenses - monthlyPayment;
  return Math.round(remaining * 100) / 100;
}

export function formatEuro(value: number, decimals: number = 0): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat('fr-FR').format(value);
}

