/**
 * Money helpers. All amounts are integer cents in the database.
 */

const eurFormatter = new Intl.NumberFormat("nl-NL", {
  style: "currency",
  currency: "EUR",
});

export function formatCents(cents: number | null | undefined): string {
  return eurFormatter.format((cents ?? 0) / 100);
}

export function formatEuros(euros: number | null | undefined): string {
  return eurFormatter.format(euros ?? 0);
}

/**
 * Parses a user-entered euro amount ("12,34" or "12.34" or 12.34)
 * into integer cents. Returns 0 for invalid input.
 */
export function eurosToCents(value: string | number | null | undefined): number {
  if (typeof value === "number") {
    if (!Number.isFinite(value)) return 0;
    return Math.round(value * 100);
  }
  if (!value) return 0;
  const normalized = value.trim().replace(",", ".");
  if (!normalized) return 0;
  const parsed = Number.parseFloat(normalized);
  if (Number.isNaN(parsed)) return 0;
  return Math.round(parsed * 100);
}

/** Formats integer cents back to a plain Dutch decimal string, e.g. 1234 -> "12,34". */
export function centsToInputValue(cents: number | null | undefined): string {
  const value = (cents ?? 0) / 100;
  return Number.isInteger(value)
    ? String(value)
    : value.toFixed(2).replace(".", ",");
}
