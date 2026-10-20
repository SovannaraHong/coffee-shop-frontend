import { CurrencyPipe } from '@angular/common';
import { Component, DestroyRef, inject, signal, OnInit, computed } from '@angular/core';
import { OrderService } from '../../../core/services/order-service';
import { OrderStatus } from '../../../../../../../libs/models/order/order-status.enum';
import { OrderResponse } from '../../../../../../../libs/models/order/order-response.model';
import {
  altAction,
  canCancel,
  firstImage,
  isLate,
  itemCount,
  itemSummary,
  NextAction,
  nextAction,
  orderSteps,
  STATUS_META,
  stepIndex,
  timeAgo,
} from '../../../shared/utils/order-status';
import { initials } from '../../../shared/utils/status-style';
import { ConfirmDialog } from '../../../shared/components/confirm-dialog/confirm-dialog';
import { OrderDetailModal } from '../orders-detail-modal/orders-detail-modal';
import { OrderStatusBadge } from '../order-status-badge/order-status-badge';

type StatusFilter = 'ALL' | OrderStatus;

const REFRESH_MS = 30_000;

@Component({
  selector: 'app-order-list',
  imports: [CurrencyPipe, ConfirmDialog, OrderDetailModal, OrderStatusBadge],
  templateUrl: './order-list.html',
})
export class OrderList implements OnInit {
  private readonly orderService = inject(OrderService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly orders = this.orderService.items;
  protected readonly loading = this.orderService.loading;
  protected readonly error = this.orderService.error;
  protected readonly busyId = this.orderService.busyId;

  // Exposed for the template
  protected readonly Status = OrderStatus;

  // Filters
  protected readonly search = signal('');
  protected readonly status = signal<StatusFilter>('ALL');

  //pagination
  protected readonly pageSize = 10;
  protected readonly page = signal(1);

  // Details popup (null = closed)
  protected readonly selectedId = signal<number | null>(null);

  // Cancel confirmation
  protected readonly toCancel = signal<OrderResponse | null>(null);

  // Ticks so "5 min ago" stays fresh
  protected readonly now = signal(Date.now());

  protected readonly tabs: { value: StatusFilter; label: string }[] = [
    { value: 'ALL', label: 'All' },
    { value: OrderStatus.PENDING, label: 'Pending' },
    { value: OrderStatus.CONFIRMED, label: 'Confirmed' },
    { value: OrderStatus.PREPARING, label: 'Preparing' },
    { value: OrderStatus.READY, label: 'Ready' },
    { value: OrderStatus.DELIVERING, label: 'Delivering' },
    { value: OrderStatus.COMPLETED, label: 'Completed' },
    { value: OrderStatus.CANCELLED, label: 'Cancelled' },
  ];

  // Display helpers (shared with the detail page)

  protected readonly meta = STATUS_META;
  protected readonly steps = orderSteps;
  protected readonly stepIndex = stepIndex;
  protected readonly nextAction = nextAction;
  protected readonly altAction = altAction;
  protected readonly canCancel = canCancel;
  protected readonly itemSummary = itemSummary;
  protected readonly itemCount = itemCount;
  protected readonly firstImage = firstImage;
  protected readonly initials = initials;
  protected readonly timeAgo = (iso: string) => timeAgo(iso, this.now());
  protected readonly isLate = (o: OrderResponse) => isLate(o, this.now());

  ngOnInit(): void {
    void this.orderService.load();

    // Live board: refresh quietly so staff see new orders without reloading.
    const timer = setInterval(() => {
      this.now.set(Date.now());
      void this.orderService.load(true);
    }, REFRESH_MS);
    this.destroyRef.onDestroy(() => clearInterval(timer));
  }

  // ---------- Derived data ----------

  private readonly sorted = computed(() =>
    [...this.orders()].sort(
      (a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime(),
    ),
  );

  protected readonly counts = computed(() => {
    const result: Record<string, number> = { ALL: this.orders().length };
    for (const o of this.orders()) result[o.status] = (result[o.status] ?? 0) + 1;
    return result;
  });

  protected readonly todayRevenue = computed(() => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);

    const revenueStatuses: OrderStatus[] = [
      OrderStatus.CONFIRMED,
      OrderStatus.PREPARING,
      OrderStatus.READY,
      OrderStatus.DELIVERING,
      OrderStatus.COMPLETED,
    ];

    return this.orders()
      .filter((o) => revenueStatuses.includes(o.status) && new Date(o.orderDate) >= start)
      .reduce((sum, o) => sum + (o.finalAmount ?? 0), 0);
  });
  protected readonly filtered = computed(() => {
    const query = this.search().trim().toLowerCase();
    const selected = this.status();

    return this.sorted().filter((o) => {
      const matchesStatus = selected === 'ALL' || o.status === selected;
      const matchesSearch =
        !query ||
        (o.orderNumber ?? '').toLowerCase().includes(query) ||
        String(o.id) === query.replace('#', '') ||
        (o.customerName ?? '').toLowerCase().includes(query);
      return matchesStatus && matchesSearch;
    });
  });

  protected readonly pageCount = computed(() =>
    Math.max(1, Math.ceil(this.filtered().length / this.pageSize)),
  );

  protected readonly paged = computed(() => {
    const start = (this.page() - 1) * this.pageSize;
    return this.filtered().slice(start, start + this.pageSize);
  });

  protected readonly pages = computed(() =>
    Array.from({ length: this.pageCount() }, (_, i) => i + 1),
  );

  // ---------- Actions ----------

  protected setSearch(value: string): void {
    this.search.set(value);
    this.page.set(1);
  }

  protected setStatus(value: StatusFilter): void {
    this.status.set(value);
    this.page.set(1);
  }

  protected goTo(page: number): void {
    if (page < 1 || page > this.pageCount()) return;
    this.page.set(page);
  }

  protected refresh(): void {
    void this.orderService.load();
  }

  protected async run(order: OrderResponse, step: NextAction | null): Promise<void> {
    if (step) await this.orderService.changeStatus(order.id, step.action);
  }

  protected async confirmCancel(): Promise<void> {
    const order = this.toCancel();
    if (!order) return;
    const result = await this.orderService.changeStatus(order.id, 'cancel');
    if (result) this.toCancel.set(null);
  }
}
