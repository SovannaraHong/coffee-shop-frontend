import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';

import { InventoryTransactionService } from '../../../core/services/inventory-transaction-service';
import { PageHeader } from '../../../shared/components/page-header/page-header';
import {
  INVENTORY_TRANSACTION_TYPES,
  InventoryTransaction,
} from '../../../../../../../libs/models/inventoryTransaction/inventory-transaction';

@Component({
  selector: 'app-inventory-transaction-list',
  imports: [DatePipe, DecimalPipe, PageHeader],
  templateUrl: './inventory-transaction-list.html',
})
export class InventoryTransactionList {
  private readonly service = inject(InventoryTransactionService);

  protected readonly search = signal('');
  protected readonly tabs: string[] = ['all', ...INVENTORY_TRANSACTION_TYPES];
  protected readonly tab = signal('all');

  protected readonly tone: Record<string, string> = {
    Purchase: 'bg-emerald-50 text-emerald-700',
    Usage: 'bg-sky-50 text-sky-700',
    Adjustment: 'bg-amber-50 text-amber-700',
    Waste: 'bg-red-50 text-red-600',
  };

  protected readonly filtered = computed(() => {
    const q = this.search().trim().toLowerCase();
    const t = this.tab();
    return this.service
      .items()
      .filter((r) => {
        const matchesSearch =
          !q ||
          [this.ingredientName(r), r.referenceType, r.referenceId, r.notes, r.createdBy].some((v) =>
            String(v ?? '')
              .toLowerCase()
              .includes(q),
          );
        return matchesSearch && (t === 'all' || r.transactionType === t);
      })
      .sort((a, b) => b.transactionDate.localeCompare(a.transactionDate));
  });

  protected ingredientName(r: InventoryTransaction): string {
    return this.service.ingredient(r.ingredientId).name;
  }

  protected unit(r: InventoryTransaction): string {
    return this.service.ingredient(r.ingredientId).unit;
  }

  protected reference(r: InventoryTransaction): string {
    if (!r.referenceType) return '—';
    return r.referenceId
      ? `${r.referenceType.replace('_', ' ')} #${r.referenceId}`
      : r.referenceType;
  }

  protected tabCount(t: string): number {
    return t === 'all'
      ? this.service.items().length
      : this.service.items().filter((r) => r.transactionType === t).length;
  }
}
