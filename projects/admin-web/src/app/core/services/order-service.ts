import { Injectable, computed } from '@angular/core';
import { Order, OrderStatus } from '../models/order';
import { ORDERS } from '../data/mock-data';
import { InMemoryStore } from './in-memory-store';

const FLOW: OrderStatus[] = ['Pending', 'Preparing', 'Ready', 'Completed'];

@Injectable({ providedIn: 'root' })
export class OrderService extends InMemoryStore<Order> {
  /** Newest first */
  readonly recent = computed(() =>
    [...this.items()].sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
  );

  constructor() {
    super(ORDERS);
  }

  /** Status that comes after `status`, or null when the order is finished/cancelled */
  nextStatus(status: OrderStatus): OrderStatus | null {
    const i = FLOW.indexOf(status);
    return i >= 0 && i < FLOW.length - 1 ? FLOW[i + 1] : null;
  }

  setStatus(id: number, status: OrderStatus): void {
    this.update(id, { status });
  }
}
