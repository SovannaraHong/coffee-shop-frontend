import { OrderApiService } from '../../api/order/order.service';
import { OrderResponse } from '../../models/order/order-response.model';
import { inject, Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class OrderService {
  private readonly orderApi = inject(OrderApiService);

  isOpen = signal(false);

  orders = signal<OrderResponse[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  open() {
    this.isOpen.set(true);
  }

  close() {
    this.isOpen.set(false);
  }

  toggle() {
    this.isOpen.update((v) => !v);
  }

  loadOrders(customerId: number) {
    this.loading.set(true);
    this.error.set(null);
    this.orderApi.findByCustomer(customerId).subscribe({
      next: (orders) => {
        this.orders.set(orders);
        this.loading.set(false);
      },
      error: () => {
        this.error.set("We couldn't load your orders. Please try again.");
        this.loading.set(false);
      },
    });
  }
}
