import { PaymentService } from './../../../../../../../../libs/api/payment/payment.service';
import { Component, computed, inject, input, signal } from '@angular/core';

import { ActivatedRoute } from '@angular/router';
import { DatePipe } from '@angular/common';
import { Observable } from 'rxjs';

import { OrderResponse } from '../../../../../../../../libs/models/order/order-response.model';
import { OrderApiService } from '../../../../../../../../libs/api/order/order.service';
import { KhqrPaymentResult } from '../../../../../../../../libs/models/payment/payment-response';
import { PaymentQrModal } from '../../../../shared/components/payment-qr-modal/payment-qr-modal';
import { OrderSuccess } from '../../../../shared/components/order-success/order-success';
import { CartService } from '../../../../../../../../libs/services/cart/cart.service';

type StepState = 'done' | 'current' | 'upcoming';

interface Step {
  index: number;
  label: string;
  state: StepState;
}

@Component({
  selector: 'app-order-detail',
  standalone: true,
  imports: [DatePipe, PaymentQrModal, OrderSuccess],
  templateUrl: './order-detail.html',
})
export class OrderDetail {
  private readonly route = inject(ActivatedRoute);
  private readonly orderApi = inject(OrderApiService);
  private readonly paymentService = inject(PaymentService);
  private readonly cart = inject(CartService);

  isAdmin = input(false);

  order = signal<OrderResponse | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);
  summaryOpen = signal(true);
  updating = signal(false);

  // ---------- Payment state ----------
  paying = signal(false);
  paid = signal(false);
  payError = signal<string | null>(null);
  payment = signal<KhqrPaymentResult | null>(null); // controls the QR modal
  paidAmount = signal(0); // kept for the success popup
  showSuccessPopup = signal(false);
  pendingOrderId = signal<number | null>(null);

  // status -> stepper
  // Cancelled orders just show step 1 as "done" and stop there.
  private readonly stepOrder = ['PENDING', 'CONFIRMED', 'PREPARING', 'DELIVERING', 'COMPLETED'];
  private readonly stepLabels = ['Placed', 'Confirmed', 'Preparing', 'Delivering', 'Done'];

  steps = computed<Step[]>(() => {
    const status = this.order()?.status?.toUpperCase();

    if (!status) {
      return [];
    }

    if (status === 'CANCELLED') {
      return this.stepLabels.map((label, i) => ({
        index: i + 1,
        label,
        state: i === 0 ? 'done' : ('upcoming' as StepState),
      }));
    }

    const currentIndex = this.stepOrder.indexOf(status === 'READY' ? 'PREPARING' : status);

    return this.stepLabels.map((label, i) => ({
      index: i + 1,
      label,
      state: (i < currentIndex ? 'done' : i === currentIndex ? 'current' : 'upcoming') as StepState,
    }));
  });

  constructor() {
    this.route.paramMap.subscribe((params) => {
      const id = Number(params.get('id'));

      if (!id) {
        this.order.set(null);
        this.error.set('Invalid order id');
        this.loading.set(false);
        return;
      }

      this.loadOrder(id);
    });
  }

  // ---------- Payment ----------

  payNow(orderId: number): void {
    this.paying.set(true);
    this.payError.set(null);
    this.pendingOrderId.set(orderId);
    this.paymentService.initiateKhqrPayment(orderId).subscribe({
      next: (res) => {
        this.payment.set(res);
        this.paying.set(false);
      },
      error: () => {
        this.payError.set('Could not start payment. Please try again.');
        this.paying.set(false);
      },
    });
  }

  onPaid(): void {
    this.paidAmount.set(this.payment()?.payment.amount ?? this.order()?.finalAmount ?? 0);

    this.paid.set(true);
    const orderId = this.pendingOrderId();

    if (orderId) {
      this.cart.removeItemsForOrder(orderId);
    }
    this.payment.set(null); // close QR modal
    this.showSuccessPopup.set(true); // open success popup

    const id = this.order()?.id;
    if (id) {
      this.loadOrder(id, true);
    }
  }

  onModalClosed(): void {
    this.payment.set(null);
  }

  onSuccessClosed(): void {
    this.showSuccessPopup.set(false);
  }

  // ---------- Order loading ----------

  private loadOrder(id: number, silent = false): void {
    if (!silent) {
      this.loading.set(true);
      this.order.set(null);
    }
    this.error.set(null);

    this.orderApi.findById(id).subscribe({
      next: (order) => {
        this.order.set(order);
        this.loading.set(false);
      },
      error: () => {
        if (silent) {
          this.loading.set(false);
          return;
        }
        this.order.set(null);
        this.error.set("We couldn't load this order.");
        this.loading.set(false);
      },
    });
  }

  toggleSummary(): void {
    this.summaryOpen.update((open) => !open);
  }

  /**
   * Call any status-transition endpoint and push
   * the returned order back into the signal.
   *
   * steps() is computed from order(), so the stepper
   * automatically updates when the order status changes.
   */
  private runTransition(call: Observable<OrderResponse>): void {
    const id = this.order()?.id;

    if (!id || this.updating()) {
      return;
    }

    this.updating.set(true);

    call.subscribe({
      next: (updated) => {
        this.order.set(updated);
        this.updating.set(false);
      },
      error: () => {
        this.error.set('Could not update the order status.');
        this.updating.set(false);
      },
    });
  }

  confirm(): void {
    this.runTransition(this.orderApi.confirm(this.order()!.id));
  }

  markPreparing(): void {
    this.runTransition(this.orderApi.markPreparing(this.order()!.id));
  }

  markReady(): void {
    this.runTransition(this.orderApi.markReady(this.order()!.id));
  }

  markDelivering(): void {
    this.runTransition(this.orderApi.markDelivering(this.order()!.id));
  }

  complete(): void {
    this.runTransition(this.orderApi.complete(this.order()!.id));
  }

  cancel(): void {
    this.runTransition(this.orderApi.cancel(this.order()!.id));
  }

  statusMeta(status: string): { label: string; textClass: string } {
    switch (status?.toUpperCase()) {
      case 'PENDING':
        return { label: 'Pending', textClass: 'text-gray-500' };
      case 'CONFIRMED':
        return { label: 'Confirmed', textClass: 'text-gray-900' };
      case 'PREPARING':
      case 'READY':
        return { label: status, textClass: 'text-amber-600' };
      case 'DELIVERING':
        return { label: 'Delivering', textClass: 'text-blue-600' };
      case 'COMPLETED':
        return { label: 'Completed', textClass: 'text-green-600' };
      case 'CANCELLED':
        return { label: 'Cancelled', textClass: 'text-red-500' };
      default:
        return { label: status ?? 'Unknown', textClass: 'text-gray-500' };
    }
  }
}
