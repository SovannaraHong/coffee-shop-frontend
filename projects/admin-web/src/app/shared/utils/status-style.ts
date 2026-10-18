const MAP: Record<string, string> = {
  // order status
  Pending: 'bg-amber-50 text-amber-700',
  Preparing: 'bg-blue-50 text-blue-700',
  Ready: 'bg-violet-50 text-violet-700',
  Completed: 'bg-emerald-50 text-emerald-700',
  Cancelled: 'bg-red-50 text-red-600',
  // payment status
  Paid: 'bg-emerald-50 text-emerald-700',
  Refunded: 'bg-red-50 text-red-600',
  Failed: 'bg-neutral-100 text-neutral-600',
};

export const statusClass = (s: string): string => MAP[s] ?? 'bg-neutral-100 text-neutral-600';

export const initials = (name: string): string =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('');
