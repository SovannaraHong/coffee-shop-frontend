import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { OrderService } from './../../../../../../libs/services/order/order.service';
import { Component, computed, effect, input, signal } from '@angular/core';
import { OrderResponse } from '../../../../../../libs/models/order/order-response.model';
import { OrderStatus } from '../../../../../../libs/models/order/order-status.enum';

type OrderFilter = 'ALL' | OrderStatus;

@Component({
  imports: [RouterLink, DatePipe],
  selector: 'app-order',
  templateUrl: './order.html',
})
export class Order {
  customerId = input<number | undefined>(undefined);

  // Current selected filter
  filter = signal<OrderFilter>('ALL');

  // Filter tabs
  filters: { key: OrderFilter; label: string }[] = [
    { key: 'ALL', label: 'All' },
    { key: OrderStatus.PENDING, label: 'Pending' },
    { key: OrderStatus.CONFIRMED, label: 'Confirmed' },
    { key: OrderStatus.PREPARING, label: 'Preparing' },
    { key: OrderStatus.READY, label: 'Ready' },
    { key: OrderStatus.DELIVERING, label: 'Delivering' },
    { key: OrderStatus.COMPLETED, label: 'Completed' },
    { key: OrderStatus.CANCELLED, label: 'Cancelled' },
  ];

  // Filter orders based on selected tab
  filtered = computed(() => {
    const list = this.orders.orders();
    const selectedFilter = this.filter();

    // All orders
    if (selectedFilter === 'ALL') {
      return list;
    }

    // Specific status
    return list.filter((order) => order.status === selectedFilter);
  });

  constructor(public orders: OrderService) {
    effect(() => {
      const id = this.customerId();

      if (this.orders.isOpen() && id != null) {
        this.orders.loadOrders(id);
      }
    });
  }

  retry(): void {
    const id = this.customerId();

    if (id != null) {
      this.orders.loadOrders(id);
    }
  }

  itemCount(order: OrderResponse): number {
    return order.details?.reduce((sum, detail) => sum + detail.quantity, 0) ?? 0;
  }

  statusMeta(status: OrderStatus): {
    label: string;
    classes: string;
  } {
    switch (status) {
      case OrderStatus.PENDING:
        return {
          label: 'Pending',
          classes: 'bg-[#f6efe4] text-[#a67c52]',
        };

      case OrderStatus.CONFIRMED:
        return {
          label: 'Confirmed',
          classes: 'bg-[#f6efe4] text-[#a67c52]',
        };

      case OrderStatus.PREPARING:
        return {
          label: 'Preparing',
          classes: 'bg-[#fbeadb] text-[#b5762f]',
        };

      case OrderStatus.READY:
        return {
          label: 'Ready',
          classes: 'bg-[#fbeadb] text-[#b5762f]',
        };

      case OrderStatus.DELIVERING:
        return {
          label: 'Delivering',
          classes: 'bg-[#e8eef5] text-[#3a5a8c]',
        };

      case OrderStatus.COMPLETED:
        return {
          label: 'Completed',
          classes: 'bg-[#e7f2ea] text-[#2f6f4f]',
        };

      case OrderStatus.CANCELLED:
        return {
          label: 'Cancelled',
          classes: 'bg-[#fbeae7] text-[#93392f]',
        };

      default:
        return {
          label: 'Unknown',
          classes: 'bg-[#f1ece4] text-[#8a7359]',
        };
    }
  }
}
