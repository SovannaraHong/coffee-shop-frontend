// import { Component, computed, inject, signal } from '@angular/core';
// import { ActivatedRoute } from '@angular/router';
// import { DatePipe } from '@angular/common';
// import { OrderResponse } from '../../../../../../../../libs/models/order/order-response.model';
// import { OrderApiService } from '../../../../../../../../libs/api/order/order.service';

// type StepState = 'done' | 'current' | 'upcoming';
// interface Step {
//   index: number;
//   label: string;
//   state: StepState;
// }

// @Component({
//   selector: 'app-order-detail',
//   standalone: true,
//   imports: [DatePipe],
//   templateUrl: './order-detail.html',
// })
// export class OrderDetail {
//   private readonly route = inject(ActivatedRoute);
//   private readonly orderApi = inject(OrderApiService);

//   order = signal<OrderResponse | null>(null);
//   loading = signal(true);
//   error = signal<string | null>(null);

//   private readonly stepOrder = ['PENDING', 'CONFIRMED', 'PREPARING', 'DELIVERING', 'COMPLETED'];
//   private readonly stepLabels = ['Placed', 'Confirmed', 'Preparing', 'Delivering', 'Done'];

//   steps = computed<Step[]>(() => {
//     const status = this.order()?.status?.toUpperCase();
//     if (!status) return [];

//     if (status === 'CANCELLED') {
//       return this.stepLabels.map((label, i) => ({
//         index: i + 1,
//         label,
//         state: i === 0 ? 'done' : ('upcoming' as StepState),
//       }));
//     }

//     const currentIndex = this.stepOrder.indexOf(status === 'READY' ? 'PREPARING' : status);

//     return this.stepLabels.map((label, i) => ({
//       index: i + 1,
//       label,
//       state: (i < currentIndex ? 'done' : i === currentIndex ? 'current' : 'upcoming') as StepState,
//     }));
//   });

//   constructor() {
//     const id = Number(this.route.snapshot.paramMap.get('id'));
//     if (!id) {
//       this.error.set('Invalid order id');
//       this.loading.set(false);
//       return;
//     }

//     this.orderApi.findById(id).subscribe({
//       next: (order) => {
//         this.order.set(order);
//         this.loading.set(false);
//       },
//       error: () => {
//         this.error.set("We couldn't load this order.");
//         this.loading.set(false);
//       },
//     });
//   }

//   statusMeta(status: string): { label: string; textClass: string } {
//     switch (status?.toUpperCase()) {
//       case 'PENDING':
//         return { label: 'Pending', textClass: 'text-gray-500' };
//       case 'CONFIRMED':
//         return { label: 'Confirmed', textClass: 'text-gray-900' };
//       case 'PREPARING':
//       case 'READY':
//         return { label: status, textClass: 'text-amber-600' };
//       case 'DELIVERING':
//         return { label: 'Delivering', textClass: 'text-blue-600' };
//       case 'COMPLETED':
//         return { label: 'Completed', textClass: 'text-green-600' };
//       case 'CANCELLED':
//         return { label: 'Cancelled', textClass: 'text-red-500' };
//       default:
//         return { label: status ?? 'Unknown', textClass: 'text-gray-500' };
//     }
//   }
// }
import { Component, computed, inject, input, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DatePipe } from '@angular/common';
import { Observable } from 'rxjs';
import { OrderResponse } from '../../../../../../../../libs/models/order/order-response.model';
import { OrderApiService } from '../../../../../../../../libs/api/order/order.service';

type StepState = 'done' | 'current' | 'upcoming';
interface Step {
  index: number;
  label: string;
  state: StepState;
}

@Component({
  selector: 'app-order-detail',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './order-detail.html',
})
export class OrderDetail {
  private readonly route = inject(ActivatedRoute);
  private readonly orderApi = inject(OrderApiService);

  // Only admin/staff views should pass this as true — customers get a
  // read-only status view with no action buttons.
  isAdmin = input(false);

  order = signal<OrderResponse | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);
  summaryOpen = signal(true);
  updating = signal(false);

  // status -> stepper. Cancelled orders just show step 1 as "done" and stop there.
  private readonly stepOrder = ['PENDING', 'CONFIRMED', 'PREPARING', 'DELIVERING', 'COMPLETED'];
  private readonly stepLabels = ['Placed', 'Confirmed', 'Preparing', 'Delivering', 'Done'];

  steps = computed<Step[]>(() => {
    const status = this.order()?.status?.toUpperCase();
    if (!status) return [];

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
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) {
      this.error.set('Invalid order id');
      this.loading.set(false);
      return;
    }

    this.orderApi.findById(id).subscribe({
      next: (order) => {
        this.order.set(order);
        this.loading.set(false);
      },
      error: () => {
        this.error.set("We couldn't load this order.");
        this.loading.set(false);
      },
    });
  }

  toggleSummary(): void {
    this.summaryOpen.update((open) => !open);
  }

  // Call any status-transition endpoint and push the returned order back into
  // the signal — steps() is computed from order(), so the stepper updates itself.
  private runTransition(call: Observable<OrderResponse>): void {
    const id = this.order()?.id;
    if (!id || this.updating()) return;

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
