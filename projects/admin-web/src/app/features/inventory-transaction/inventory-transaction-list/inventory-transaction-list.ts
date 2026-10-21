import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';

import { InventoryTransactionService } from '../../../core/services/inventory-transaction-service';
import { PageHeader } from '../../../shared/components/page-header/page-header';
import {
  INVENTORY_TRANSACTION_TYPES,
  TransactionResponse,
} from '../../../../../../../libs/models/inventoryTransaction/transaction-response.model';

@Component({
  selector: 'app-inventory-transaction-list',
  imports: [DatePipe, DecimalPipe, PageHeader],
  templateUrl: './inventory-transaction-list.html',
})
export class InventoryTransactionList implements OnInit {
  protected readonly service = inject(InventoryTransactionService);

  protected readonly skeleton = [1, 2, 3, 4, 5, 6];
  protected readonly search = signal('');
  protected readonly tabs: string[] = ['all', ...INVENTORY_TRANSACTION_TYPES];
  protected readonly tab = signal('all');

  protected readonly label: Record<string, string> = {
    all: 'All',
    in: 'Stock in',
    out: 'Stock out',
    adjustment: 'Adjustment',
  };

  protected readonly tone: Record<string, string> = {
    in: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
    out: 'bg-red-50 text-red-700 ring-red-600/20',
    adjustment: 'bg-amber-50 text-amber-700 ring-amber-600/20',
  };

  protected readonly icon: Record<string, string> = {
    in: 'fa-arrow-down',
    out: 'fa-arrow-up',
    adjustment: 'fa-sliders',
  };

  protected readonly stats = computed(() => {
    const items = this.service.items();
    const count = (key: string) => items.filter((r) => this.typeKey(r) === key).length;
    return {
      total: items.length,
      in: count('in'),
      out: count('out'),
      adjustment: count('adjustment'),
    };
  });

  protected readonly filtered = computed(() => {
    const q = this.search().trim().toLowerCase();
    const t = this.tab();
    return this.service
      .items()
      .filter((r) => {
        const matchesSearch =
          !q ||
          [
            r.ingredientName,
            r.referenceType,
            r.referenceId,
            r.note,
            this.label[this.typeKey(r)],
          ].some((v) =>
            String(v ?? '')
              .toLowerCase()
              .includes(q),
          );
        return matchesSearch && (t === 'all' || this.typeKey(r) === t);
      })
      .sort((a, b) => b.transactionDate.localeCompare(a.transactionDate));
  });

  ngOnInit(): void {
    this.service.load();
  }

  protected clearSearch(): void {
    this.search.set('');
  }

  protected typeKey(r: TransactionResponse): string {
    return (r.type ?? '').toLowerCase();
  }

  /** OUT is always stock out, IN is always stock in, ADJUSTMENT follows the sign. */
  protected isOut(r: TransactionResponse): boolean {
    const t = this.typeKey(r);
    if (t === 'out') return true;
    if (t === 'adjustment') return r.quantity < 0;
    return false;
  }

  protected reference(r: TransactionResponse): string {
    if (!r.referenceType) return '—';
    const type = r.referenceType.replace(/_/g, ' ').toLowerCase();
    return r.referenceId ? `${type} #${r.referenceId}` : type;
  }

  protected tabCount(t: string): number {
    const items = this.service.items();
    return t === 'all' ? items.length : items.filter((r) => this.typeKey(r) === t).length;
  }
}
