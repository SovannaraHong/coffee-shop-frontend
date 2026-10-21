import { CurrencyPipe, DatePipe, DecimalPipe, DOCUMENT } from '@angular/common';
import {
  Component,
  DestroyRef,
  ElementRef,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
  untracked,
} from '@angular/core';

import {
  PO_META,
  PO_STAGES,
  PoStage,
  stageOf,
} from '../../../../../../../libs/models/purchase-order/purchase-order-status';
import { PurchaseOrderResponse } from '../../../../../../../libs/models/purchase-order/purchase-order-response.model';

@Component({
  selector: 'app-purchase-order-detail-modal',
  imports: [CurrencyPipe, DatePipe, DecimalPipe],
  templateUrl: './purchase-order-detail-modal.html',
  host: { '(document:keydown.escape)': 'closed.emit()' },
})
export class PurchaseOrderDetailModal {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly doc = inject(DOCUMENT);

  readonly order = input<PurchaseOrderResponse | null>(null);
  readonly busy = input(false);

  readonly closed = output<void>();
  readonly action = output<'order' | 'receive'>();
  readonly cancelOrder = output<void>();

  protected readonly meta = PO_META;
  protected readonly stages = PO_STAGES;
  protected readonly shown = signal(false);

  protected readonly stage = computed<PoStage>(() => stageOf(this.order()?.status));
  protected readonly stepIndex = computed(() => PO_STAGES.indexOf(this.stage()));

  protected readonly stepLabels: Record<string, string> = {
    pending: 'Created',
    ordered: 'Ordered',
    received: 'Received',
  };

  constructor() {
    // Render above the whole app (sidebar and top bar)
    this.doc.body.appendChild(this.host.nativeElement);
    inject(DestroyRef).onDestroy(() => this.host.nativeElement.remove());

    effect(() => {
      if (this.order()) {
        untracked(() => requestAnimationFrame(() => this.shown.set(true)));
      } else {
        untracked(() => this.shown.set(false));
      }
    });
  }

  protected itemCount(): number {
    return this.order()?.details?.length ?? 0;
  }

  protected totalQuantity(): number {
    return (this.order()?.details ?? []).reduce((s, d) => s + (d.quantity ?? 0), 0);
  }
}
