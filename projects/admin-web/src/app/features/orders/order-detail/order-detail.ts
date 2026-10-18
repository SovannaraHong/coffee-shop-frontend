import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { OrderStatus } from '../../../core/models/order';
import { OrderService } from '../../../core/services/order-service';
import { StaffService } from '../../../core/services/staff-service';
import { initials, statusClass } from '../../../shared/utils/status-style';

@Component({
  selector: 'app-order-detail',
  imports: [RouterLink, CurrencyPipe, DatePipe],
  templateUrl: './order-detail.html',
})
export class OrderDetail {
  private readonly service = inject(OrderService);
  private readonly staffService = inject(StaffService);

  /** Route param :id (bound with withComponentInputBinding) */
  readonly id = input<string>();

  protected readonly steps: OrderStatus[] = ['Pending', 'Preparing', 'Ready', 'Completed'];

  protected readonly order = computed(() =>
    this.service.items().find((o) => o.id === Number(this.id())),
  );
  protected readonly next = computed(() => {
    const o = this.order();
    return o ? this.service.nextStatus(o.status) : null;
  });
  protected readonly stepIndex = computed(() =>
    this.steps.indexOf(this.order()?.status ?? 'Pending'),
  );
  protected readonly cashier = computed(() =>
    this.staffService.getById(this.order()?.staffId ?? 0),
  );

  protected readonly statusClass = statusClass;
  protected readonly initials = initials;

  protected advance(): void {
    const o = this.order();
    const n = this.next();
    if (o && n) this.service.setStatus(o.id, n);
  }
  protected cancel(): void {
    const o = this.order();
    if (o) this.service.setStatus(o.id, 'Cancelled');
  }
}
