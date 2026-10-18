export interface ChartSeries {
  name: string;
  color: string;
  data: number[];
}

/** Round a max value up to a "nice" axis ceiling (1, 2, 2.5, 5 × 10ⁿ). */
export function niceMax(value: number): number {
  if (value <= 0) return 1;
  const exp = Math.pow(10, Math.floor(Math.log10(value)));
  const f = value / exp;
  const nf = f <= 1 ? 1 : f <= 2 ? 2 : f <= 2.5 ? 2.5 : f <= 5 ? 5 : 10;
  return nf * exp;
}

export function compact(value: number, prefix = ''): string {
  return prefix + (value >= 1000 ? `${+(value / 1000).toFixed(1)}k` : `${value}`);
}

export function money(value: number, prefix = '$'): string {
  return prefix + value.toLocaleString('en-US', { maximumFractionDigits: 0 });
}
