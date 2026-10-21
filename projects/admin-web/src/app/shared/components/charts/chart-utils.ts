export interface ChartSeries {
  name: string;
  color: string;
  data: number[];
}

/** Round a max value up to a "nice" axis ceiling (1, 2, 2.5, 5 × 10ⁿ). */
export function niceMax(value: number): number {
  if (value <= 0) return 100;
  const exp = Math.pow(10, Math.floor(Math.log10(value)));
  const f = value / exp;
  const nf = f <= 1 ? 1 : f <= 2 ? 2 : f <= 2.5 ? 2.5 : f <= 5 ? 5 : 10;
  return nf * exp;
}

/**
 * Format a y-axis tick label cleanly — no long decimals.
 *  < 1 000  → whole dollar, e.g. "500"  or "$500"
 *  >= 1 000 → compact with one decimal max, e.g. "$1.5k"
 */
export function compact(value: number, prefix = '$'): string {
  if (value === 0) return prefix + '0';
  if (value >= 1_000_000) {
    const m = value / 1_000_000;
    return prefix + (Number.isInteger(m) ? m : +m.toFixed(1)) + 'M';
  }
  if (value >= 1_000) {
    const k = value / 1_000;
    return prefix + (Number.isInteger(k) ? k : +k.toFixed(1)) + 'k';
  }
  // For small values: round to nearest integer for axis readability
  return prefix + Math.round(value);
}

/** Tooltip / hover label — more precision. */
export function money(value: number, prefix = '$'): string {
  return (
    prefix +
    value.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })
  );
}
