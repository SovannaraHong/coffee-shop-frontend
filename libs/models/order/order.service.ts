import { Injectable, signal } from '@angular/core';

// replace with your real Order model once you have it
export interface Order {
  id: number;
  placedAt: string;
  status: string;
  total: number;
}

@Injectable({ providedIn: 'root' })
export class OrdersService {
  // drawer visibility — the single source of truth, not a route
  isOpen = signal(false);

  // ---- order data (replace with your real API call) ----
  orders = signal<Order[]>([]);

  open() {
    this.isOpen.set(true);
  }

  close() {
    this.isOpen.set(false);
  }

  toggle() {
    this.isOpen.update((v) => !v);
  }
}
