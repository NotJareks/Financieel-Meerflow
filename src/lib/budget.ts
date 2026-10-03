import type { BudgetExpense, Frequency } from "@prisma/client";

export const STANDARD_CATEGORIES = [
  "Wonen",
  "Energie & water",
  "Verzekeringen",
  "Vervoer",
  "Telefoon & internet",
  "Abonnementen",
  "Uitgaan",
  "Kleding",
  "Sport",
  "Leningen",
  "Boodschappen",
  "Overig",
] as const;

/** Converts an amount to its monthly equivalent in cents. */
export function toMonthlyCents(amountCents: number, frequency: Frequency): number {
  switch (frequency) {
    case "QUARTERLY":
      return Math.round(amountCents / 3);
    case "YEARLY":
      return Math.round(amountCents / 12);
    case "MONTHLY":
    default:
      return amountCents;
  }
}

export function frequencyLabel(frequency: Frequency): string {
  switch (frequency) {
    case "QUARTERLY":
      return "per kwartaal";
    case "YEARLY":
      return "per jaar";
    case "MONTHLY":
    default:
      return "per maand";
  }
}

/** Returns all categories: expense categories first, then standard ones. */
export function getBudgetCategories(expenses: Pick<BudgetExpense, "category">[]): string[] {
  const categories = new Set<string>();
  for (const expense of expenses) categories.add(expense.category);
  for (const category of STANDARD_CATEGORIES) categories.add(category);
  return [...categories];
}

export function getMonthlyBudgetByCategory(
  expenses: Pick<BudgetExpense, "category" | "amountCents" | "frequency">[]
): Map<string, number> {
  const map = new Map<string, number>();
  for (const expense of expenses) {
    const monthly = toMonthlyCents(expense.amountCents, expense.frequency);
    map.set(expense.category, (map.get(expense.category) ?? 0) + monthly);
  }
  return map;
}
