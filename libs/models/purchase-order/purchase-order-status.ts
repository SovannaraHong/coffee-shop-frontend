export type PoStage = 'pending' | 'ordered' | 'received' | 'cancelled';

export const PO_STAGES: PoStage[] = ['pending', 'ordered', 'received'];

/** Maps whatever the backend sends to one of our four stages. */
export function stageOf(status: string | null | undefined): PoStage {
  const s = (status ?? '').toLowerCase();
  if (s === 'ordered') return 'ordered';
  if (s === 'received') return 'received';
  if (s === 'cancelled' || s === 'canceled') return 'cancelled';
  return 'pending';
}

export const PO_META: Record<
  PoStage,
  { label: string; badge: string; dot: string; icon: string; tile: string }
> = {
  pending: {
    label: 'Pending',
    badge: 'bg-amber-50 text-amber-700 ring-amber-600/20',
    dot: 'bg-amber-500',
    icon: 'fa-regular fa-clock',
    tile: 'bg-amber-50 text-amber-600',
  },
  ordered: {
    label: 'Ordered',
    badge: 'bg-sky-50 text-sky-700 ring-sky-600/20',
    dot: 'bg-sky-500',
    icon: 'fa-solid fa-paper-plane',
    tile: 'bg-sky-50 text-sky-600',
  },
  received: {
    label: 'Received',
    badge: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
    dot: 'bg-emerald-500',
    icon: 'fa-solid fa-circle-check',
    tile: 'bg-emerald-50 text-emerald-600',
  },
  cancelled: {
    label: 'Cancelled',
    badge: 'bg-red-50 text-red-700 ring-red-600/20',
    dot: 'bg-red-400',
    icon: 'fa-solid fa-ban',
    tile: 'bg-red-50 text-red-600',
  },
};
