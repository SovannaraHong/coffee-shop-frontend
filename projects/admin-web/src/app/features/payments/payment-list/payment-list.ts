import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PaymentService } from '../../../core/services/payment-service';

// Backend statuses: PENDING | PAID | FAILED | EXPIRED
// Backend methods:  KHQR | CASH | CARD

const METHOD_ICON: Record<string, string> = {
  CASH: 'fa-money-bill-wave',
  CARD: 'fa-credit-card',
  KHQR: 'fa-qrcode',
};
const METHOD_TONE: Record<string, string> = {
  CASH: 'bg-emerald-50 text-emerald-600',
  CARD: 'bg-blue-50 text-blue-600',
  KHQR: 'bg-violet-50 text-violet-600',
};
const METHOD_BAR: Record<string, string> = {
  CASH: 'bg-emerald-500',
  CARD: 'bg-blue-500',
  KHQR: 'bg-violet-500',
};
const STATUS_CLASS: Record<string, string> = {
  PAID: 'bg-emerald-50 text-emerald-700',
  PENDING: 'bg-amber-50 text-amber-700',
  FAILED: 'bg-neutral-100 text-neutral-600',
  EXPIRED: 'bg-red-50 text-red-600',
};
const STATUS_LABEL: Record<string, string> = {
  PAID: 'Paid',
  PENDING: 'Pending',
  FAILED: 'Failed',
  EXPIRED: 'Expired',
};

@Component({
  selector: 'app-payment-list',
  imports: [RouterLink, CurrencyPipe, DatePipe],
  templateUrl: './payment-list.html',
})
export class PaymentList implements OnInit {
  private readonly paymentService = inject(PaymentService);

  protected readonly loading = this.paymentService.loading;
  protected readonly error = this.paymentService.error;

  protected readonly methods: string[] = ['CASH', 'CARD', 'KHQR'];
  protected readonly statuses: string[] = ['PAID', 'PENDING', 'FAILED', 'EXPIRED'];

  protected readonly methodChips = [
    { value: 'all', label: 'All', icon: '' },
    { value: 'CASH', label: 'Cash', icon: METHOD_ICON['CASH'] },
    { value: 'CARD', label: 'Card', icon: METHOD_ICON['CARD'] },
    { value: 'KHQR', label: 'QR Pay', icon: METHOD_ICON['KHQR'] },
  ];
  protected readonly pageSize = 8;

  protected readonly search = signal('');
  protected readonly method = signal('all');
  protected readonly status = signal('all');
  protected readonly page = signal(1);

  ngOnInit(): void {
    void this.paymentService.load();
  }

  // ── View model ──────────────────────────────────────────────────────────
  private readonly enriched = computed(() =>
    this.paymentService.items().map((p) => ({
      ...p,
      reference: p.transactionRef || `PAY-${p.id}`,
      customer: `Order #${p.orderId}`,
      orderNumber: `#${p.orderId}`,
      methodKey: (p.method || 'KHQR').toUpperCase(),
      statusKey: (p.status || 'PENDING').toUpperCase(),
    })),
  );

  // ── Summary ─────────────────────────────────────────────────────────────
  private sumByStatus = (status: string) =>
    computed(() =>
      this.enriched()
        .filter((p) => p.statusKey === status)
        .reduce((s, p) => s + (p.amount ?? 0), 0),
    );

  protected readonly collected = this.sumByStatus('PAID');
  protected readonly pending = this.sumByStatus('PENDING');
  protected readonly refunded = computed(() => 0); // refunds not in current API

  protected readonly byMethod = computed(() => {
    const total = this.collected();
    return this.methods.map((m) => {
      const amount = this.enriched()
        .filter((p) => p.statusKey === 'PAID' && p.methodKey === m)
        .reduce((s, p) => s + (p.amount ?? 0), 0);
      return {
        method: this.methodChips.find((c) => c.value === m)?.label ?? m,
        methodKey: m,
        icon: METHOD_ICON[m] ?? 'fa-credit-card',
        tone: METHOD_TONE[m] ?? 'bg-neutral-50 text-neutral-600',
        bar: METHOD_BAR[m] ?? 'bg-neutral-500',
        amount,
        share: total ? Math.round((amount / total) * 100) : 0,
      };
    });
  });

  protected readonly statusTabs = computed(() => [
    { value: 'all', label: 'All', count: this.enriched().length },
    ...this.statuses.map((s) => ({
      value: s,
      label: STATUS_LABEL[s] ?? s,
      count: this.enriched().filter((p) => p.statusKey === s).length,
    })),
  ]);

  // ── Filtering + paging ──────────────────────────────────────────────────
  protected readonly filtered = computed(() => {
    const q = this.search().trim().toLowerCase();
    const m = this.method();
    const s = this.status();
    return this.enriched().filter(
      (p) =>
        (!q ||
          p.reference.toLowerCase().includes(q) ||
          p.customer.toLowerCase().includes(q) ||
          p.orderNumber.toLowerCase().includes(q)) &&
        (m === 'all' || p.methodKey === m) &&
        (s === 'all' || p.statusKey === s),
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

  // ── Template helpers ────────────────────────────────────────────────────
  protected icon = (methodKey: string) => METHOD_ICON[methodKey] ?? 'fa-credit-card';
  protected methodTone = (methodKey: string) =>
    METHOD_TONE[methodKey] ?? 'bg-neutral-50 text-neutral-600';
  protected statusClass = (statusKey: string) =>
    STATUS_CLASS[statusKey] ?? 'bg-neutral-100 text-neutral-600';
  protected statusLabel = (statusKey: string) => STATUS_LABEL[statusKey] ?? statusKey;

  protected initials(name: string): string {
    return name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0].toUpperCase())
      .join('');
  }
}
