import { RouterLink } from '@angular/router';
import { OrderService } from './../../../../../../libs/services/order/order.service';
import { Component, effect, input } from '@angular/core';

@Component({
  imports: [RouterLink],
  selector: 'app-order',
  templateUrl: './order.html',
})
export class Order {
  // Pass the signed-in customer's id in from the parent, e.g.
  // <app-order [customerId]="auth.customerId()"></app-order>
  // Optional (not required) because this drawer is mounted globally and may
  // render before a customer is known, e.g. while logged out.
  customerId = input<number | undefined>(undefined);

  constructor(public orders: OrderService) {
    effect(() => {
      const id = this.customerId();
      if (this.orders.isOpen() && id != null) {
        this.orders.loadOrders(id);
      }
    });
  }

  retry() {
    const id = this.customerId();
    if (id != null) {
      this.orders.loadOrders(id);
    }
  }

  statusMeta(status: string): { label: string; classes: string } {
    switch (status?.toUpperCase()) {
      case 'PENDING':
        return { label: 'Pending', classes: 'bg-[#f6efe4] text-[#a67c52]' };
      case 'CONFIRMED':
        return { label: 'Confirmed', classes: 'bg-[#f6efe4] text-[#a67c52]' };
      case 'PREPARING':
        return { label: 'Preparing', classes: 'bg-[#fbeadb] text-[#b5762f]' };
      case 'READY':
        return { label: 'Ready', classes: 'bg-[#fbeadb] text-[#b5762f]' };
      case 'DELIVERING':
        return { label: 'Delivering', classes: 'bg-[#e8eef5] text-[#3a5a8c]' };
      case 'COMPLETED':
        return { label: 'Completed', classes: 'bg-[#e7f2ea] text-[#2f6f4f]' };
      case 'CANCELLED':
        return { label: 'Cancelled', classes: 'bg-[#fbeae7] text-[#93392f]' };
      default:
        return { label: status ?? 'Unknown', classes: 'bg-[#f1ece4] text-[#8a7359]' };
    }
  }
}
