import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ORDER_STATUSES, OrderStatus, OrderType } from '../../../core/models/order';
import { OrderService } from '../../../core/services/order-service';
import { initials, statusClass } from '../../../shared/utils/status-style';

const TYPE_ICON: Record<OrderType, string> = {
  'Dine-in': 'fa-utensils',
  Takeaway: 'fa-bag-shopping',
  Delivery: 'fa-motorcycle',
};
const PAY_ICON: Record<string, string> = {
  Cash: 'fa-money-bill-wave',
  Card: 'fa-credit-card',
  'QR Pay': 'fa-qrcode',
};

@Component({
  selector: 'app-order-list',
  imports: [RouterLink, CurrencyPipe, DatePipe],
  templateUrl: './order-list.html',
})
export class OrderList {
  private readonly orders = inject(OrderService);

  protected readonly tabs: (OrderStatus | 'All')[] = ['All', ...ORDER_STATUSES];
  protected readonly pageSize = 8;
  protected readonly status = signal<OrderStatus | 'All'>('All');
  protected readonly search = signal('');
  protected readonly page = signal(1);

  protected readonly counts = computed(() => {
    const all = this.orders.items();
    const c: Record<string, number> = { All: all.length };
    for (const s of ORDER_STATUSES) c[s] = all.filter((o) => o.status === s).length;
    return c;
  });

  protected readonly filtered = computed(() => {
    const q = this.search().trim().toLowerCase();
    return this.orders
      .recent()
      .filter(
        (o) =>
          (this.status() === 'All' || o.status === this.status()) &&
          (!q || o.customer.toLowerCase().includes(q) || o.number.toLowerCase().includes(q)),
      );
  });
  protected readonly paged = computed(() =>
    this.filtered().slice((this.page() - 1) * this.pageSize, this.page() * this.pageSize),
  );
  protected readonly pageCount = computed(() =>
    Math.max(1, Math.ceil(this.filtered().length / this.pageSize)),
  );
  protected readonly pages = computed(() =>
    Array.from({ length: this.pageCount() }, (_, n) => n + 1),
  );

  protected setStatus(s: OrderStatus | 'All'): void {
    this.status.set(s);
    this.page.set(1);
  }
  protected setSearch(v: string): void {
    this.search.set(v);
    this.page.set(1);
  }
  protected goTo(p: number): void {
    this.page.set(Math.min(Math.max(1, p), this.pageCount()));
  }

  protected typeIcon = (t: OrderType) => TYPE_ICON[t];
  protected payIcon = (m: string) => PAY_ICON[m];
  protected itemCount = (items: { qty: number }[]) => items.reduce((n, i) => n + i.qty, 0);
  protected readonly statusClass = statusClass;
  protected readonly initials = initials;
}
