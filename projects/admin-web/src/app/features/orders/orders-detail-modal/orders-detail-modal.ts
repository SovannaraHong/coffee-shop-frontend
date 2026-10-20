import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, computed, inject, input, output, signal } from '@angular/core';
import { OrderService } from '../../../core/services/order-service';
import { ConfirmDialog } from '../../../shared/components/confirm-dialog/confirm-dialog';
import {
  altAction,
  canCancel,
  initials,
  isLate,
  itemSummary,
  nextAction,
  NextAction,
  timeAgo,
} from '../../../shared/utils/order-status';
import { OrderStatus } from '../../../../../../../libs/models/order/order-status.enum';
import { OrderTimeline } from '../orders-time-line/orders-time-line';
import { OrderStatusBadge } from '../order-status-badge/order-status-badge';

/**
 * Order details popup. Reads the order from OrderService by id, so it stays
 * in sync with the live list (status changes show up instantly).
 */
@Component({
  selector: 'app-order-detail-modal',
  imports: [CurrencyPipe, DatePipe, ConfirmDialog, OrderTimeline, OrderStatusBadge],
  templateUrl: './orders-detail-modal.html',
  host: { '(document:keydown.escape)': 'onEscape()' },
})
export class OrderDetailModal {
  private readonly service = inject(OrderService);

  /** Id of the order to show. null = closed. */
  readonly orderId = input<number | null>(null);

  readonly closed = output<void>();
  /** Fired when staff click another order from the customer's history. */
  readonly openOrder = output<number>();

  protected readonly busyId = this.service.busyId;
  protected readonly error = this.service.error;
  protected readonly confirmingCancel = signal(false);

  protected readonly order = computed(() => {
    const id = this.orderId();
    return id === null ? null : (this.service.items().find((o) => o.id === id) ?? null);
  });

  protected readonly next = computed(() => {
    const o = this.order();
    return o ? nextAction(o) : null;
  });

  protected readonly alt = computed(() => {
    const o = this.order();
    return o ? altAction(o) : null;
  });

  protected readonly cancellable = computed(() => {
    const o = this.order();
    return !!o && canCancel(o);
  });

  protected readonly late = computed(() => {
    const o = this.order();
    return !!o && isLate(o);
  });

  /** Lifetime numbers for this customer (includes the current order). */
  protected readonly stats = computed(() => {
    const o = this.order();
    if (!o) return null;
    const all = this.service.items().filter((x) => x.customerId === o.customerId);
    const valid = all.filter((x) => x.status !== OrderStatus.CANCELLED);
    return {
      orders: all.length,
      spent: valid.reduce((sum, x) => sum + (x.finalAmount ?? 0), 0),
      cancelled: all.length - valid.length,
    };
  });

  /** Other orders from the same customer, newest first, max 5. */
  protected readonly history = computed(() => {
    const o = this.order();
    if (!o) return [];
    return this.service
      .items()
      .filter((x) => x.customerId === o.customerId && x.id !== o.id)
      .sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime())
      .slice(0, 5);
  });

  protected readonly initials = initials;
  protected readonly timeAgo = timeAgo;
  protected readonly itemSummary = itemSummary;

  protected close(): void {
    this.confirmingCancel.set(false);
    this.closed.emit();
  }

  protected onEscape(): void {
    // Let the confirm dialog handle its own Escape first.
    if (this.order() && !this.confirmingCancel()) this.close();
  }

  protected async run(step: NextAction | null): Promise<void> {
    const o = this.order();
    if (o && step) await this.service.changeStatus(o.id, step.action);
  }

  protected async cancel(): Promise<void> {
    const o = this.order();
    if (!o) return;
    const result = await this.service.changeStatus(o.id, 'cancel');
    if (result) this.confirmingCancel.set(false);
  }
}
