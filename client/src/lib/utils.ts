import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { differenceInDays, differenceInWeeks, differenceInMonths } from "date-fns"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Calcule un conseil intelligent pour atteindre un objectif avant une date butoir
 * @param currentAmount Montant actuel (en centimes)
 * @param targetAmount Montant cible (en centimes)
 * @param deadline Date butoir
 * @param currencySymbol Symbole de la monnaie
 * @returns Un objet avec le conseil formaté et l'unité de temps
 */
export function calculateSavingsAdvice(
  currentAmount: number,
  targetAmount: number,
  deadline: string | null,
  currencySymbol: string
): { advice: string; amount: number; period: "day" | "week" | "month" } | null {
  if (!deadline) return null;

  const deadlineDate = new Date(deadline);
  const now = new Date();
  const daysRemaining = differenceInDays(deadlineDate, now);
  
  // Si la date est passée, pas de conseil
  if (daysRemaining < 0) return null;
  
  const remainingAmount = targetAmount - currentAmount;
  
  // Si l'objectif est déjà atteint
  if (remainingAmount <= 0) return null;
  
  const days = daysRemaining;
  const weeks = Math.ceil(days / 7);
  const months = Math.max(1, Math.ceil(days / 30));
  
  // Calculer les valeurs exactes pour la comparaison
  const exactWeeks = days / 7;
  const exactMonths = days / 30;
  
  const amountPerDay = remainingAmount / days;
  const amountPerWeek = remainingAmount / weeks;
  const amountPerMonth = remainingAmount / months;
  
  // Logique intelligente pour choisir l'unité de temps
  let period: "day" | "week" | "month";
  let amount: number;
  let periodLabel: string;
  let periodCount: number;
  
  if (days <= 7) {
    // Moins de 7 jours : toujours par jour (urgent)
    period = "day";
    amount = amountPerDay;
    periodCount = days;
    periodLabel = days === 1 ? "jour" : "jours";
  } else if (days <= 21) {
    // 8-21 jours : comparer jour vs semaine
    // Si le montant par jour est très petit (< 0.5% du montant total par jour), utiliser la semaine
    const dailyPercentage = (amountPerDay / remainingAmount) * 100;
    if (dailyPercentage < 0.5 && exactWeeks >= 1) {
      period = "week";
      amount = amountPerWeek;
      periodCount = weeks;
      // Utiliser la valeur exacte pour déterminer le singulier/pluriel
      periodLabel = "semaine"; // Toujours au singulier avec "par"
    } else {
      period = "day";
      amount = amountPerDay;
      periodCount = days;
      periodLabel = "jours";
    }
  } else if (days <= 90) {
    // 22-90 jours : comparer semaine vs mois
    // Si le montant par semaine est très petit (< 2% du montant total par semaine), utiliser le mois
    const weeklyPercentage = (amountPerWeek / remainingAmount) * 100;
    if (weeklyPercentage < 2 && exactMonths >= 1) {
      period = "month";
      amount = amountPerMonth;
      periodCount = months;
      // "mois" est toujours au singulier en français
      periodLabel = "mois";
    } else {
      period = "week";
      amount = amountPerWeek;
      periodCount = weeks;
      // Utiliser la valeur exacte pour déterminer le singulier/pluriel
      periodLabel = "semaine"; // Toujours au singulier avec "par"
    }
  } else {
    // Plus de 90 jours : utiliser le mois
    period = "month";
    amount = amountPerMonth;
    periodCount = months;
    // "mois" est toujours au singulier en français
    periodLabel = "mois";
  }
  
  // Formater le montant de manière intelligente
  let formattedAmount: string;
  if (amount < 100) {
    // Moins de 1 unité : afficher avec 2 décimales
    formattedAmount = (amount / 100).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  } else {
    // 1 unité ou plus : arrondir à l'entier le plus proche
    formattedAmount = Math.round(amount / 100).toLocaleString();
  }
  
  // Message intelligent selon le contexte
  let advice: string;
  if (period === "day" && periodCount <= 3) {
    advice = `⚠️ Urgent ! Économisez ${currencySymbol}${formattedAmount} par jour pour atteindre votre objectif à temps`;
  } else if (period === "day") {
    advice = `Pour atteindre votre objectif, économisez ${currencySymbol}${formattedAmount} par jour`;
  } else if (period === "week") {
    advice = `Pour atteindre votre objectif, économisez ${currencySymbol}${formattedAmount} par ${periodLabel}`;
  } else {
    advice = `Pour atteindre votre objectif, économisez ${currencySymbol}${formattedAmount} par ${periodLabel}`;
  }
  
  return { advice, amount, period };
}
