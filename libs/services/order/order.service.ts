import { Order } from './../../../projects/customer-web/src/app/features/order/order';
import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class OrderService {
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
