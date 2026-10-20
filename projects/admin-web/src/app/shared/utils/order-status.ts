import { OrderAction } from './../../../../../../libs/models/order/order-action';
// Single source of truth for order statuses, workflow and display helpers.
import { OrderDetailResponse } from '../../../../../../libs/models/order/order-detail-response.model';
import { OrderResponse } from '../../../../../../libs/models/order/order-response.model';
import { OrderStatus } from '../../../../../../libs/models/order/order-status.enum';

export interface StatusMeta {
  label: string;
  icon: string;
  badge: string; // pill classes
  dot: string; // progress / timeline color
}

export interface NextAction {
  action: OrderAction;
  label: string;
  icon: string;
}

// Full class strings so Tailwind can see them.
export const STATUS_META: Record<OrderStatus, StatusMeta> = {
  [OrderStatus.PENDING]: {
    label: 'Pending',
    icon: 'fa-regular fa-clock',
    badge: 'bg-amber-50 text-amber-700 ring-amber-200',
    dot: 'bg-amber-500',
  },
  [OrderStatus.CONFIRMED]: {
    label: 'Confirmed',
    icon: 'fa-solid fa-check',
    badge: 'bg-sky-50 text-sky-700 ring-sky-200',
    dot: 'bg-sky-500',
  },

  [OrderStatus.PREPARING]: {
    label: 'Preparing',
    icon: '  fa-solid fa-mug-saucer',
    badge: 'bg-orange-50 text-[#e95f37] ring-orange-200',
    dot: 'bg-[#e95f37]',
  },
  [OrderStatus.READY]: {
    label: 'Ready',
    icon: 'fa-solid fa-bell-concierge',
    badge: 'bg-violet-50 text-violet-700 ring-violet-200',
    dot: 'bg-violet-500',
  },
  [OrderStatus.DELIVERING]: {
    label: 'Delivering',
    icon: 'fa-solid fa-motorcycle',
    badge: 'bg-indigo-50 text-indigo-700 ring-indigo-200',
    dot: 'bg-indigo-500',
  },
  [OrderStatus.COMPLETED]: {
    label: 'Completed',
    icon: 'fa-solid fa-circle-check',
    badge: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
    dot: 'bg-emerald-500',
  },
  [OrderStatus.CANCELLED]: {
    label: 'Cancelled',
    icon: 'fa-solid fa-ban',
    badge: 'bg-neutral-100 text-neutral-500 ring-neutral-200',
    dot: 'bg-neutral-400',
  },
};

const BASE_FLOW: OrderStatus[] = [
  OrderStatus.PENDING,
  OrderStatus.CONFIRMED,
  OrderStatus.PREPARING,
  OrderStatus.READY,
  OrderStatus.COMPLETED,
];
const DELIVERY_FLOW: OrderStatus[] = [
  OrderStatus.PENDING,
  OrderStatus.CONFIRMED,
  OrderStatus.PREPARING,
  OrderStatus.READY,
  OrderStatus.DELIVERING,
  OrderStatus.COMPLETED,
];
const CANCELLABLE: OrderStatus[] = [
  OrderStatus.PENDING,
  OrderStatus.CONFIRMED,
  OrderStatus.PREPARING,
];

/**
 * The API doesn't say whether an order is delivery or pickup, so the
 * "Delivering" step only appears once an order is actually being delivered.
 */
export function orderSteps(order: OrderResponse): OrderStatus[] {
  return order.status === OrderStatus.DELIVERING ? DELIVERY_FLOW : BASE_FLOW;
}

export function stepIndex(order: OrderResponse): number {
  return orderSteps(order).indexOf(order.status);
}

/** The main next step for an order, or null when finished. */
export function nextAction(order: OrderResponse): NextAction | null {
  switch (order.status) {
    case OrderStatus.PENDING:
      return { action: 'confirm', label: 'Confirm', icon: 'fa-solid fa-check' };
    case OrderStatus.CONFIRMED:
      return { action: 'preparing', label: 'Start preparing', icon: 'fa-solid fa-mug-saucer' };
    case OrderStatus.PREPARING:
      return { action: 'ready', label: 'Mark ready', icon: 'fa-solid fa-bell-concierge' };
    case OrderStatus.READY:
      return { action: 'complete', label: 'Complete', icon: 'fa-solid fa-circle-check' };
    case OrderStatus.DELIVERING:
      return { action: 'complete', label: 'Mark delivered', icon: 'fa-solid fa-circle-check' };
    default:
      return null;
  }
}

/** Optional side step: a ready order can go out for delivery instead. */
export function altAction(order: OrderResponse): NextAction | null {
  return order.status === OrderStatus.READY
    ? { action: 'delivering', label: 'Send out for delivery', icon: 'fa-solid fa-motorcycle' }
    : null;
}

export function canCancel(order: OrderResponse): boolean {
  return CANCELLABLE.includes(order.status);
}

export function initials(name?: string | null): string {
  const clean = (name ?? '').trim();
  if (!clean) return '#';
  return clean
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('');
}

export function itemSummary(order: OrderResponse): string {
  const items = order.details ?? [];
  if (!items.length) return 'No items';
  const first = `${items[0].quantity}× ${items[0].productName}`;
  return items.length > 1 ? `${first} +${items.length - 1} more` : first;
}

export function itemCount(order: OrderResponse): number {
  return (order.details ?? []).reduce((n, d) => n + d.quantity, 0);
}

export function firstImage(order: OrderResponse): string | null {
  return (order.details ?? []).find((d: OrderDetailResponse) => !!d.imageUrl)?.imageUrl ?? null;
}

export function timeAgo(iso: string, now = Date.now()): string {
  const min = Math.floor(Math.max(0, now - new Date(iso).getTime()) / 60_000);
  if (min < 1) return 'Just now';
  if (min < 60) return `${min} min ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr} h ago`;
  return `${Math.floor(hr / 24)} d ago`;
}

/** Active orders open for more than 15 minutes get a warning. */
export function isLate(order: OrderResponse, now = Date.now()): boolean {
  if (order.status === OrderStatus.COMPLETED || order.status === OrderStatus.CANCELLED) {
    return false;
  }
  return now - new Date(order.orderDate).getTime() > 15 * 60_000;
}
