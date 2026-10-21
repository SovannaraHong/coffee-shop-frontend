import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';

import { PurchaseOrderService } from '../../../core/services/purchase-order-service';
import { ConfirmDialog } from '../../../shared/components/confirm-dialog/confirm-dialog';
import { PageHeader } from '../../../shared/components/page-header/page-header';
import { PurchaseOrderDrawer } from '../purchase-order-drawer/purchase-order-drawer';
import {
  PO_META,
  PO_STAGES,
  PoStage,
  stageOf,
} from '../../../../../../../libs/models/purchase-order/purchase-order-status';
import { PurchaseOrderRequest } from '../../../../../../../libs/models/purchase-order/purchase-order-request.model';
import { PurchaseOrderResponse } from '../../../../../../../libs/models/purchase-order/purchase-order-response.model';
import { PurchaseOrderDetailModal } from '../purchase-order-detail-modal/purchase-order-detail-modal';

export type PoAction = 'order' | 'receive';

@Component({
  selector: 'app-purchase-order-list',
  imports: [
    CurrencyPipe,
    DatePipe,
    PageHeader,
    ConfirmDialog,
    PurchaseOrderDrawer,
    PurchaseOrderDetailModal,
  ],
  templateUrl: './purchase-order-list.html',
})
export class PurchaseOrderList implements OnInit {
  protected readonly service = inject(PurchaseOrderService);

  protected readonly meta = PO_META;
  protected readonly stages = PO_STAGES;
  protected readonly skeleton = [1, 2, 3, 4, 5];
  protected readonly pageSize = 8;

  protected readonly tabs: { value: 'all' | PoStage; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'pending', label: 'Pending' },
    { value: 'ordered', label: 'Ordered' },
    { value: 'received', label: 'Received' },
    { value: 'cancelled', label: 'Cancelled' },
  ];

  protected readonly status = signal<'all' | PoStage>('all');
  protected readonly search = signal('');
  protected readonly page = signal(1);

  protected readonly showForm = signal(false);
  protected readonly selectedId = signal<number | null>(null);
  protected readonly toCancel = signal<PurchaseOrderResponse | null>(null);
  protected readonly busyId = signal<number | null>(null);

  protected readonly editing = signal<PurchaseOrderResponse | null>(null);

  protected readonly selected = computed(
    () => this.service.items().find((o) => o.id === this.selectedId()) ?? null,
  );

  protected readonly counts = computed(() => {
    const items = this.service.items();
    const c: Record<string, number> = { all: items.length };
    for (const o of items) c[this.stage(o)] = (c[this.stage(o)] ?? 0) + 1;
    return c;
  });

  protected readonly totalSpend = computed(() =>
    this.service
      .items()
      .filter((o) => this.stage(o) !== 'cancelled')
      .reduce((sum, o) => sum + (o.totalAmount ?? 0), 0),
  );

  protected readonly filtered = computed(() => {
    const q = this.search().trim().toLowerCase();
    const s = this.status();
    return this.service
      .items()
      .filter(
        (o) =>
          (s === 'all' || this.stage(o) === s) &&
          (!q ||
            `po-${o.id}`.includes(q) ||
            String(o.id).includes(q) ||
            (o.supplierName ?? '').toLowerCase().includes(q) ||
            o.details?.some((d) => d.ingredientName.toLowerCase().includes(q))),
      )
      .sort((a, b) => b.orderDate.localeCompare(a.orderDate));
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

  ngOnInit(): void {
    this.service.load();
    this.service.loadOptions();
  }

  protected stage(o: PurchaseOrderResponse): PoStage {
    return stageOf(o.status);
  }

  protected stepIndex(o: PurchaseOrderResponse): number {
    return PO_STAGES.indexOf(this.stage(o));
  }

  protected itemSummary(o: PurchaseOrderResponse): string {
    return (o.details ?? []).map((d) => d.ingredientName).join(', ') || '—';
  }

  protected canEdit(o: PurchaseOrderResponse): boolean {
    return this.stage(o) === 'pending';
  }

  protected openAdd(): void {
    this.editing.set(null);
    this.showForm.set(true);
  }

  protected openEdit(o: PurchaseOrderResponse): void {
    this.editing.set(o);
    this.showForm.set(true);
  }
  protected nextAction(
    o: PurchaseOrderResponse,
  ): { kind: PoAction; label: string; icon: string } | null {
    switch (this.stage(o)) {
      case 'pending':
        return { kind: 'order', label: 'Place order', icon: 'fa-solid fa-paper-plane' };
      case 'ordered':
        return { kind: 'receive', label: 'Receive', icon: 'fa-solid fa-box-open' };
      default:
        return null;
    }
  }

  protected canCancel(o: PurchaseOrderResponse): boolean {
    const s = this.stage(o);
    return s === 'pending' || s === 'ordered';
  }

  protected initials(name: string | null): string {
    return (name ?? '?')
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0].toUpperCase())
      .join('');
  }

  protected setStatus(s: 'all' | PoStage): void {
    this.status.set(s);
    this.page.set(1);
  }

  protected setSearch(v: string): void {
    this.search.set(v);
    this.page.set(1);
  }

  protected clearFilters(): void {
    this.search.set('');
    this.status.set('all');
    this.page.set(1);
  }

  protected goTo(n: number): void {
    this.page.set(Math.min(Math.max(1, n), this.pageCount()));
  }

  protected async run(o: PurchaseOrderResponse, kind: PoAction): Promise<void> {
    this.busyId.set(o.id);
    if (kind === 'order') await this.service.placeOrder(o.id);
    else await this.service.receive(o.id);
    this.busyId.set(null);
  }

  protected async confirmCancel(): Promise<void> {
    const o = this.toCancel();
    this.toCancel.set(null);
    if (!o) return;
    this.busyId.set(o.id);
    await this.service.cancel(o.id);
    this.busyId.set(null);
  }

  protected async save(v: PurchaseOrderRequest): Promise<void> {
    const current = this.editing();
    const ok = current ? await this.service.update(current.id, v) : await this.service.add(v);
    if (ok) {
      this.showForm.set(false);
      this.editing.set(null);
    }
  }
}
