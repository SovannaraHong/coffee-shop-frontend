import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PaymentMethod, PaymentStatus } from '../../../core/models/order';
import { PaymentService } from '../../../core/services/payment-service';

const METHOD_ICON: Record<PaymentMethod, string> = {
  Cash: 'fa-money-bill-wave',
  Card: 'fa-credit-card',
  'QR Pay': 'fa-qrcode',
};
const METHOD_TONE: Record<PaymentMethod, string> = {
  Cash: 'bg-emerald-50 text-emerald-600',
  Card: 'bg-blue-50 text-blue-600',
  'QR Pay': 'bg-violet-50 text-violet-600',
};
const METHOD_BAR: Record<PaymentMethod, string> = {
  Cash: 'bg-emerald-500',
  Card: 'bg-blue-500',
  'QR Pay': 'bg-violet-500',
};
const STATUS_CLASS: Record<PaymentStatus, string> = {
  Paid: 'bg-emerald-50 text-emerald-700',
  Pending: 'bg-amber-50 text-amber-700',
  Refunded: 'bg-red-50 text-red-600',
  Failed: 'bg-neutral-100 text-neutral-600',
};

@Component({
  selector: 'app-payment-list',
  imports: [RouterLink, CurrencyPipe, DatePipe],
  templateUrl: './payment-list.html',
})
export class PaymentList {
  private readonly payments = inject(PaymentService).items;

  protected readonly methods: PaymentMethod[] = ['Cash', 'Card', 'QR Pay'];
  protected readonly statuses: PaymentStatus[] = ['Paid', 'Pending', 'Refunded', 'Failed'];
  protected readonly methodChips = [
    { value: 'all', label: 'All', icon: '' },
    ...this.methods.map((m) => ({ value: m as string, label: m as string, icon: METHOD_ICON[m] })),
  ];
  protected readonly pageSize = 8;

  protected readonly search = signal('');
  protected readonly method = signal('all');
  protected readonly status = signal('all');
  protected readonly page = signal(1);

  private readonly sumBy = (
    pred: (p: { method: PaymentMethod; status: PaymentStatus }) => boolean,
  ) =>
    this.payments()
      .filter(pred)
      .reduce((s, p) => s + p.amount, 0);

  protected readonly collected = computed(() => this.sumBy((p) => p.status === 'Paid'));
  protected readonly pending = computed(() => this.sumBy((p) => p.status === 'Pending'));
  protected readonly refunded = computed(() => this.sumBy((p) => p.status === 'Refunded'));

  protected readonly byMethod = computed(() => {
    const total = this.collected();
    return this.methods.map((m) => {
      const amount = this.sumBy((p) => p.status === 'Paid' && p.method === m);
      return {
        method: m,
        icon: METHOD_ICON[m],
        tone: METHOD_TONE[m],
        bar: METHOD_BAR[m],
        amount,
        share: total ? Math.round((amount / total) * 100) : 0,
      };
    });
  });

  protected readonly statusTabs = computed(() => [
    { value: 'all', label: 'All', count: this.payments().length },
    ...this.statuses.map((s) => ({
      value: s as string,
      label: s as string,
      count: this.payments().filter((p) => p.status === s).length,
    })),
  ]);

  protected readonly filtered = computed(() => {
    const q = this.search().trim().toLowerCase();
    return this.payments().filter(
      (p) =>
        (!q ||
          p.reference.toLowerCase().includes(q) ||
          p.customer.toLowerCase().includes(q) ||
          p.orderNumber.includes(q)) &&
        (this.method() === 'all' || p.method === this.method()) &&
        (this.status() === 'all' || p.status === this.status()),
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

  protected setSearch(v: string): void {
    this.search.set(v);
    this.page.set(1);
  }
  protected setMethod(v: string): void {
    this.method.set(v);
    this.page.set(1);
  }
  protected setStatus(v: string): void {
    this.status.set(v);
    this.page.set(1);
  }
  protected goTo(p: number): void {
    this.page.set(Math.min(Math.max(1, p), this.pageCount()));
  }

  protected icon = (m: PaymentMethod) => METHOD_ICON[m];
  protected methodTone = (m: PaymentMethod) => METHOD_TONE[m];
  protected statusClass = (s: PaymentStatus) => STATUS_CLASS[s];
  protected initials(name: string): string {
    return name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0].toUpperCase())
      .join('');
  }
}
