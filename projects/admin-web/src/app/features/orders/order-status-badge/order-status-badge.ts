import { Component, computed, input } from '@angular/core';
import { STATUS_META } from '../../../shared/utils/order-status';
import { OrderStatus } from '../../../../../../../libs/models/order/order-status.enum';

@Component({
  imports: [],
  selector: 'app-order-status-badge',
  styleUrl: './order-status-badge.css',
  templateUrl: './order-status-badge.html',
})
export class OrderStatusBadge {
  readonly status = input.required<OrderStatus>();
  protected readonly meta = computed(() => STATUS_META[this.status()]);
}
