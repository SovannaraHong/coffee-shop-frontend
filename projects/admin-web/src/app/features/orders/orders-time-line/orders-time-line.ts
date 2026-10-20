import { Component, computed, input } from '@angular/core';
import { OrderResponse } from '../../../../../../../libs/models/order/order-response.model';
import { OrderStatus } from '../../../../../../../libs/models/order/order-status.enum';
import { orderSteps, STATUS_META, stepIndex } from '../../../shared/utils/order-status';

@Component({
  selector: 'app-order-timeline',
  templateUrl: './orders-time-line.html',
})
export class OrderTimeline {
  readonly order = input.required<OrderResponse>();

  protected readonly meta = STATUS_META;
  protected readonly steps = computed(() => orderSteps(this.order()));
  protected readonly current = computed(() => stepIndex(this.order()));
  protected readonly cancelled = computed(() => this.order().status === OrderStatus.CANCELLED);
}
